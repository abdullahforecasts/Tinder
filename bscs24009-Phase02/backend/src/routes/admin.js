const express = require("express");
const { query } = require("../db");
const { authRequired, requireRoles } = require("../middleware/auth");

const adminRouter = express.Router();

// Admin-only: manage venues
adminRouter.post(
  "/venues",
  authRequired,
  requireRoles("admin"),
  async (req, res) => {
    try {
      const { name, address, city, capacity, hourly_rate, contact_email, contact_phone } = req.body;
      if (!name || !address || !city || !capacity || !hourly_rate) {
        return res.status(400).json({
          error: "name, address, city, capacity, hourly_rate are required",
        });
      }

      const result = await query(
        `INSERT INTO venues (name, address, city, capacity, hourly_rate, contact_email, contact_phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING venue_id, name, city, capacity, hourly_rate, contact_email, contact_phone`,
        [name, address, city, capacity, hourly_rate, contact_email || null, contact_phone || null]
      );

      return res.status(201).json({ venue: result.rows[0] });
    } catch (err) {
      console.error("Create venue error:", err);
      return res.status(500).json({ error: "Failed to create venue" });
    }
  }
);

adminRouter.get(
  "/venues",
  authRequired,
  requireRoles("admin"),
  async (req, res) => {
    try {
      const result = await query(
        `SELECT venue_id, name, address, city, capacity, hourly_rate, contact_email, contact_phone
         FROM venues
         ORDER BY venue_id`
      );
      return res.json({ venues: result.rows });
    } catch (err) {
      console.error("List venues error:", err);
      return res.status(500).json({ error: "Failed to list venues" });
    }
  }
);

module.exports = { adminRouter };

