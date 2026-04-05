const express = require("express");
const { query, getClient } = require("../db");
const { authRequired } = require("../middleware/auth");

const transfersRouter = express.Router();

const LISTING_STATUS_VALUES = ["open", "completed", "cancelled"];
const TRANSFER_TYPE_VALUES = ["adoption", "breeding"];
const TARGET_ROLE_VALUES = ["owner", "breeder", "shelter", "any"];
const CLAIM_ALLOWED_ROLES = ["owner", "breeder", "shelter"];

let schemaReadyPromise;

async function ensureTransferSchema() {
    if (!schemaReadyPromise) {
        schemaReadyPromise = (async () => {
            await query(`
        CREATE TABLE IF NOT EXISTS cat_transfer_listings (
          listing_id SERIAL PRIMARY KEY,
          cat_id INTEGER NOT NULL REFERENCES cats(cat_id) ON DELETE CASCADE,
          from_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
          transfer_type VARCHAR(20) NOT NULL CHECK (transfer_type IN ('adoption', 'breeding')),
          target_role VARCHAR(20) NOT NULL DEFAULT 'any' CHECK (target_role IN ('owner', 'breeder', 'shelter', 'any')),
          status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed', 'cancelled')),
          note TEXT,
          claimed_by_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP
        );
      `);

            await query(
                "CREATE INDEX IF NOT EXISTS idx_transfer_listings_status ON cat_transfer_listings(status);"
            );
            await query(
                "CREATE INDEX IF NOT EXISTS idx_transfer_listings_from_user ON cat_transfer_listings(from_user_id);"
            );
            await query(
                "CREATE INDEX IF NOT EXISTS idx_transfer_listings_claimed_by ON cat_transfer_listings(claimed_by_user_id);"
            );
            await query(
                "CREATE UNIQUE INDEX IF NOT EXISTS uq_transfer_open_listing_per_cat ON cat_transfer_listings(cat_id) WHERE status = 'open';"
            );
        })();
    }

    return schemaReadyPromise;
}

function canClaimListing(userRole, targetRole) {
    if (!CLAIM_ALLOWED_ROLES.includes(userRole)) {
        return false;
    }
    if (targetRole === "any") {
        return true;
    }
    return userRole === targetRole;
}

// GET /api/v1/transfers/users?role=shelter
transfersRouter.get("/users", authRequired, async (req, res) => {
    try {
        await ensureTransferSchema();

        const requestedRole = req.query.role;
        const values = [];
        let whereSql = "WHERE u.role IN ('owner', 'breeder', 'shelter')";

        if (requestedRole) {
            if (!["owner", "breeder", "shelter"].includes(requestedRole)) {
                return res.status(400).json({ error: "role must be owner, breeder, or shelter" });
            }
            values.push(requestedRole);
            whereSql += " AND u.role = $1";
        }

        const result = await query(
            `
        SELECT
          u.user_id,
          u.email,
          u.role,
          u.full_name,
          u.phone,
          COUNT(c.cat_id)::INTEGER AS cats_count
        FROM users u
        LEFT JOIN cats c ON c.owner_id = u.user_id
        ${whereSql}
        GROUP BY u.user_id, u.email, u.role, u.full_name, u.phone
        ORDER BY u.role ASC, u.full_name ASC;
      `,
            values
        );

        return res.json({ users: result.rows, count: result.rows.length });
    } catch (err) {
        console.error("Transfer users error:", err);
        return res.status(500).json({ error: "Failed to fetch user directory" });
    }
});

// GET /api/v1/transfers/listings?mine=1&status=all
transfersRouter.get("/listings", authRequired, async (req, res) => {
    try {
        await ensureTransferSchema();

        const mine = req.query.mine === "1";
        const requestedStatus = req.query.status || (mine ? "all" : "open");
        const values = [];
        const where = [];

        if (mine) {
            values.push(req.user.user_id);
            where.push(`(ctl.from_user_id = $${values.length} OR ctl.claimed_by_user_id = $${values.length})`);
        }

        if (requestedStatus !== "all") {
            if (!LISTING_STATUS_VALUES.includes(requestedStatus)) {
                return res.status(400).json({ error: "status must be open, completed, cancelled, or all" });
            }
            values.push(requestedStatus);
            where.push(`ctl.status = $${values.length}`);
        }

        const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

        const result = await query(
            `
        SELECT
          ctl.listing_id,
          ctl.cat_id,
          ctl.from_user_id,
          ctl.transfer_type,
          ctl.target_role,
          ctl.status,
          ctl.note,
          ctl.claimed_by_user_id,
          ctl.created_at,
          ctl.updated_at,
          ctl.completed_at,
          c.name AS cat_name,
          c.breed AS cat_breed,
          c.age AS cat_age,
          c.gender AS cat_gender,
          c.neutered AS cat_neutered,
          c.vaccination_status,
          c.is_active AS cat_is_active,
          fu.full_name AS from_user_name,
          fu.email AS from_user_email,
          fu.role AS from_user_role,
          cu.full_name AS claimed_by_name,
          cu.email AS claimed_by_email,
          cu.role AS claimed_by_role
        FROM cat_transfer_listings ctl
        JOIN cats c ON c.cat_id = ctl.cat_id
        JOIN users fu ON fu.user_id = ctl.from_user_id
        LEFT JOIN users cu ON cu.user_id = ctl.claimed_by_user_id
        ${whereSql}
        ORDER BY
          CASE ctl.status WHEN 'open' THEN 0 WHEN 'completed' THEN 1 ELSE 2 END,
          ctl.created_at DESC;
      `,
            values
        );

        return res.json({ listings: result.rows, count: result.rows.length });
    } catch (err) {
        console.error("Transfer listings error:", err);
        return res.status(500).json({ error: "Failed to fetch transfer listings" });
    }
});

// POST /api/v1/transfers/listings
transfersRouter.post("/listings", authRequired, async (req, res) => {
    try {
        await ensureTransferSchema();

        if (!CLAIM_ALLOWED_ROLES.includes(req.user.role)) {
            return res
                .status(403)
                .json({ error: "Only owner, breeder, or shelter accounts can list cats" });
        }

        const { cat_id, transfer_type, target_role, note } = req.body;

        const catId = Number(cat_id);
        if (!catId) {
            return res.status(400).json({ error: "cat_id is required" });
        }

        if (!TRANSFER_TYPE_VALUES.includes(transfer_type)) {
            return res.status(400).json({ error: "transfer_type must be adoption or breeding" });
        }

        const finalTargetRole = target_role || "any";
        if (!TARGET_ROLE_VALUES.includes(finalTargetRole)) {
            return res
                .status(400)
                .json({ error: "target_role must be owner, breeder, shelter, or any" });
        }

        const ownsCat = await query("SELECT 1 FROM cats WHERE cat_id = $1 AND owner_id = $2", [
            catId,
            req.user.user_id,
        ]);
        if (ownsCat.rows.length === 0) {
            return res.status(403).json({ error: "You can only list cats you own" });
        }

        const insertResult = await query(
            `
        INSERT INTO cat_transfer_listings (
          cat_id,
          from_user_id,
          transfer_type,
          target_role,
          note,
          status,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, 'open', CURRENT_TIMESTAMP)
        RETURNING
          listing_id,
          cat_id,
          from_user_id,
          transfer_type,
          target_role,
          status,
          note,
          created_at,
          updated_at;
      `,
            [catId, req.user.user_id, transfer_type, finalTargetRole, note || null]
        );

        return res.status(201).json({ listing: insertResult.rows[0] });
    } catch (err) {
        console.error("Create listing error:", err);
        if (err.code === "23505") {
            return res
                .status(409)
                .json({ error: "This cat already has an open transfer listing" });
        }
        return res.status(500).json({ error: "Failed to create transfer listing" });
    }
});

// POST /api/v1/transfers/listings/:id/cancel
transfersRouter.post("/listings/:listingId/cancel", authRequired, async (req, res) => {
    try {
        await ensureTransferSchema();

        const listingId = Number(req.params.listingId);
        if (!listingId) {
            return res.status(400).json({ error: "Invalid listing id" });
        }

        const cancelResult = await query(
            `
        UPDATE cat_transfer_listings
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE listing_id = $1
          AND from_user_id = $2
          AND status = 'open'
        RETURNING listing_id, status, updated_at;
      `,
            [listingId, req.user.user_id]
        );

        if (cancelResult.rows.length === 0) {
            return res
                .status(404)
                .json({ error: "Open listing not found for this account" });
        }

        return res.json({ listing: cancelResult.rows[0] });
    } catch (err) {
        console.error("Cancel listing error:", err);
        return res.status(500).json({ error: "Failed to cancel listing" });
    }
});

// POST /api/v1/transfers/listings/:id/claim
transfersRouter.post("/listings/:listingId/claim", authRequired, async (req, res) => {
    const client = await getClient();
    try {
        await ensureTransferSchema();

        const listingId = Number(req.params.listingId);
        if (!listingId) {
            return res.status(400).json({ error: "Invalid listing id" });
        }

        if (!CLAIM_ALLOWED_ROLES.includes(req.user.role)) {
            return res
                .status(403)
                .json({ error: "Only owner, breeder, or shelter accounts can claim cats" });
        }

        await client.query("BEGIN");

        const listingResult = await client.query(
            `
        SELECT
          ctl.listing_id,
          ctl.cat_id,
          ctl.from_user_id,
          ctl.target_role,
          ctl.status,
          c.owner_id AS current_owner_id,
          c.name AS cat_name
        FROM cat_transfer_listings ctl
        JOIN cats c ON c.cat_id = ctl.cat_id
        WHERE ctl.listing_id = $1
        FOR UPDATE;
      `,
            [listingId]
        );

        if (listingResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Listing not found" });
        }

        const listing = listingResult.rows[0];

        if (listing.status !== "open") {
            await client.query("ROLLBACK");
            return res.status(409).json({ error: "This listing is no longer open" });
        }

        if (Number(listing.from_user_id) === Number(req.user.user_id)) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "You cannot claim your own listing" });
        }

        if (!canClaimListing(req.user.role, listing.target_role)) {
            await client.query("ROLLBACK");
            return res.status(403).json({ error: "Your role is not eligible for this listing" });
        }

        if (Number(listing.current_owner_id) !== Number(listing.from_user_id)) {
            await client.query("ROLLBACK");
            return res
                .status(409)
                .json({ error: "Ownership changed before claim, listing is stale" });
        }

        await client.query("UPDATE cats SET owner_id = $1 WHERE cat_id = $2", [
            req.user.user_id,
            listing.cat_id,
        ]);

        const completeResult = await client.query(
            `
        UPDATE cat_transfer_listings
        SET
          status = 'completed',
          claimed_by_user_id = $1,
          completed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE listing_id = $2
        RETURNING listing_id, cat_id, status, claimed_by_user_id, completed_at;
      `,
            [req.user.user_id, listingId]
        );

        await client.query("COMMIT");

        return res.json({
            message: `${listing.cat_name} is now owned by your account`,
            listing: completeResult.rows[0],
        });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Claim listing error:", err);
        return res.status(500).json({ error: "Failed to claim listing" });
    } finally {
        client.release();
    }
});

module.exports = { transfersRouter };