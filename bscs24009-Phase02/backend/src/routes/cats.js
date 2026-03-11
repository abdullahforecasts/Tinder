const express = require("express");
const { query } = require("../db");
const { authRequired } = require("../middleware/auth");

const catsRouter = express.Router();

// GET /api/v1/cats/feed?swiper_cat_id=1
catsRouter.get("/feed", authRequired, async (req, res) => {
  try {
    const swiperCatId = Number(req.query.swiper_cat_id);
    if (!swiperCatId) {
      return res.status(400).json({ error: "swiper_cat_id query param is required" });
    }

    const sql = `
      SELECT c.cat_id, c.name, c.breed, c.age, c.bio,
             cp.photo_url, p.looking_for
      FROM cats c
      JOIN cat_photos cp 
        ON c.cat_id = cp.cat_id AND cp.is_primary = true
      JOIN preferences p 
        ON c.cat_id = p.cat_id
      WHERE c.is_active = true
        AND c.cat_id != $1
        AND c.cat_id NOT IN (
          SELECT swiped_cat_id 
          FROM swipes 
          WHERE swiper_cat_id = $1
        )
      ORDER BY c.created_at DESC
      LIMIT 20;
    `;

    const result = await query(sql, [swiperCatId]);
    return res.json({ cats: result.rows });
  } catch (err) {
    console.error("Feed error:", err);
    return res.status(500).json({ error: "Failed to fetch feed" });
  }
});

// POST /api/v1/cats/swipe
catsRouter.post("/swipe", authRequired, async (req, res) => {
  try {
    const { swiper_cat_id, swiped_cat_id, direction } = req.body;
    if (!swiper_cat_id || !swiped_cat_id || !direction) {
      return res
        .status(400)
        .json({ error: "swiper_cat_id, swiped_cat_id, direction are required" });
    }
    if (!["left", "right"].includes(direction)) {
      return res.status(400).json({ error: "direction must be left or right" });
    }

    const insertSql = `
      INSERT INTO swipes (swiper_cat_id, swiped_cat_id, direction)
      VALUES ($1, $2, $3)
      RETURNING swipe_id, swiper_cat_id, swiped_cat_id, direction, timestamp;
    `;
    const result = await query(insertSql, [swiper_cat_id, swiped_cat_id, direction]);

    return res.status(201).json({ swipe: result.rows[0] });
  } catch (err) {
    console.error("Swipe error:", err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Swipe already exists" });
    }
    if (err.code === "23514") {
      return res.status(400).json({ error: "Swipe violates constraints" });
    }
    return res.status(500).json({ error: "Failed to record swipe" });
  }
});

// GET /api/v1/cats/matches?cat_id=1
catsRouter.get("/matches", authRequired, async (req, res) => {
  try {
    const catId = Number(req.query.cat_id);
    if (!catId) {
      return res.status(400).json({ error: "cat_id query param is required" });
    }

    const sql = `
      SELECT 
        m.match_id,
        m.matched_at,
        m.status,
        c1.cat_id AS cat1_id,
        c1.name AS cat1_name,
        c2.cat_id AS cat2_id,
        c2.name AS cat2_name
      FROM matches m
      JOIN cats c1 ON m.cat1_id = c1.cat_id
      JOIN cats c2 ON m.cat2_id = c2.cat_id
      WHERE m.cat1_id = $1 OR m.cat2_id = $1
      ORDER BY m.matched_at DESC;
    `;

    const result = await query(sql, [catId]);
    return res.json({ matches: result.rows });
  } catch (err) {
    console.error("Matches error:", err);
    return res.status(500).json({ error: "Failed to fetch matches" });
  }
});

module.exports = { catsRouter };

