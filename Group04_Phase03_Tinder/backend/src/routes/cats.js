const express = require("express");
const { query, getClient } = require("../db");
const { authRequired } = require("../middleware/auth");

const catsRouter = express.Router();

async function catBelongsToUser(catId, userId) {
  const ownership = await query("SELECT 1 FROM cats WHERE cat_id = $1 AND owner_id = $2", [
    catId,
    userId,
  ]);
  return ownership.rows.length > 0;
}

// GET /api/v1/cats/mine
catsRouter.get("/mine", authRequired, async (req, res) => {
  try {
    const sql = `
      SELECT
        c.cat_id,
        c.name,
        c.breed,
        c.age,
        c.gender,
        c.is_active,
        COALESCE(p.looking_for, NULL) AS looking_for,
        cp.photo_url
      FROM cats c
      LEFT JOIN preferences p ON c.cat_id = p.cat_id
      LEFT JOIN cat_photos cp ON c.cat_id = cp.cat_id AND cp.is_primary = true
      WHERE c.owner_id = $1
      ORDER BY c.cat_id ASC;
    `;

    const result = await query(sql, [req.user.user_id]);
    return res.json({ cats: result.rows, count: result.rows.length });
  } catch (err) {
    console.error("My cats error:", err);
    return res.status(500).json({ error: "Failed to fetch your cats" });
  }
});

// POST /api/v1/cats/mine
catsRouter.post("/mine", authRequired, async (req, res) => {
  const {
    name,
    breed,
    age,
    gender,
    neutered,
    vaccination_status,
    bio,
    location_lat,
    location_lng,
    is_active,
    photo_url,
    looking_for,
    preferred_gender,
    preferred_age_min,
    preferred_age_max,
    max_distance_km,
  } = req.body;

  if (!name || !breed || age === undefined || !gender) {
    return res.status(400).json({
      error: "name, breed, age, gender are required",
    });
  }

  const parsedAge = Number(age);
  if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 30) {
    return res.status(400).json({ error: "age must be an integer between 1 and 30" });
  }

  if (!["M", "F"].includes(gender)) {
    return res.status(400).json({ error: "gender must be M or F" });
  }

  if ((location_lat == null) !== (location_lng == null)) {
    return res.status(400).json({
      error: "location_lat and location_lng must both be provided or both omitted",
    });
  }

  if (location_lat != null && location_lng != null) {
    const lat = Number(location_lat);
    const lng = Number(location_lng);
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ error: "location_lat must be between -90 and 90" });
    }
    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ error: "location_lng must be between -180 and 180" });
    }
  }

  if (looking_for && !["playmate", "breeding", "adoption"].includes(looking_for)) {
    return res.status(400).json({ error: "looking_for must be playmate, breeding, or adoption" });
  }

  if (preferred_gender && !["M", "F", "A"].includes(preferred_gender)) {
    return res.status(400).json({ error: "preferred_gender must be M, F, or A" });
  }

  const parsedMinAge = preferred_age_min == null ? null : Number(preferred_age_min);
  const parsedMaxAge = preferred_age_max == null ? null : Number(preferred_age_max);
  if (parsedMinAge != null && (!Number.isInteger(parsedMinAge) || parsedMinAge < 0)) {
    return res.status(400).json({ error: "preferred_age_min must be an integer >= 0" });
  }
  if (parsedMaxAge != null && (!Number.isInteger(parsedMaxAge) || parsedMaxAge < 0)) {
    return res.status(400).json({ error: "preferred_age_max must be an integer >= 0" });
  }
  if (parsedMinAge != null && parsedMaxAge != null && parsedMaxAge < parsedMinAge) {
    return res.status(400).json({ error: "preferred_age_max must be >= preferred_age_min" });
  }

  const parsedMaxDistance = max_distance_km == null ? null : Number(max_distance_km);
  if (parsedMaxDistance != null && (!Number.isInteger(parsedMaxDistance) || parsedMaxDistance <= 0)) {
    return res.status(400).json({ error: "max_distance_km must be an integer > 0" });
  }

  const client = await getClient();
  try {
    await client.query("BEGIN");

    const catInsertSql = `
      INSERT INTO cats (
        owner_id,
        name,
        breed,
        age,
        gender,
        neutered,
        vaccination_status,
        bio,
        location_lat,
        location_lng,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING
        cat_id,
        owner_id,
        name,
        breed,
        age,
        gender,
        neutered,
        vaccination_status,
        bio,
        location_lat,
        location_lng,
        is_active,
        created_at;
    `;

    const catResult = await client.query(catInsertSql, [
      req.user.user_id,
      name,
      breed,
      parsedAge,
      gender,
      neutered == null ? false : Boolean(neutered),
      vaccination_status || "unknown",
      bio || null,
      location_lat == null ? null : Number(location_lat),
      location_lng == null ? null : Number(location_lng),
      is_active == null ? true : Boolean(is_active),
    ]);

    const createdCat = catResult.rows[0];
    const finalLookingFor = looking_for || "playmate";

    const prefInsertSql = `
      INSERT INTO preferences (
        cat_id,
        looking_for,
        preferred_gender,
        preferred_age_min,
        preferred_age_max,
        max_distance_km
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        preference_id,
        looking_for,
        preferred_gender,
        preferred_age_min,
        preferred_age_max,
        max_distance_km;
    `;

    const prefResult = await client.query(prefInsertSql, [
      createdCat.cat_id,
      finalLookingFor,
      preferred_gender || null,
      parsedMinAge,
      parsedMaxAge,
      parsedMaxDistance,
    ]);

    let createdPhoto = null;
    if (photo_url) {
      const { image_id } = req.body;
      const photoResult = await client.query(
        `
          INSERT INTO cat_photos (cat_id, photo_url, image_id, is_primary, upload_order)
          VALUES ($1, $2, $3, true, 1)
          RETURNING photo_id, photo_url, image_id, is_primary, upload_order;
        `,
        [createdCat.cat_id, photo_url, image_id || null]
      );
      createdPhoto = photoResult.rows[0];
    }

    await client.query("COMMIT");
    return res.status(201).json({
      cat: createdCat,
      preference: prefResult.rows[0],
      photo: createdPhoto,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create cat error:", err);
    if (err.code === "23514") {
      return res.status(400).json({ error: "Provided values violate constraints" });
    }
    return res.status(500).json({ error: "Failed to create cat" });
  } finally {
    client.release();
  }
});

// GET /api/v1/cats/feed?swiper_cat_id=1
catsRouter.get("/feed", authRequired, async (req, res) => {
  try {
    const swiperCatId = Number(req.query.swiper_cat_id);
    if (!swiperCatId) {
      return res.status(400).json({ error: "swiper_cat_id query param is required" });
    }

    const ownsSwiperCat = await catBelongsToUser(swiperCatId, req.user.user_id);
    if (!ownsSwiperCat) {
      return res.status(403).json({ error: "You can only use your own cat as swiper" });
    }

    const sql = `
      SELECT c.cat_id, c.name, c.breed, c.age, c.gender, c.bio,
             cp.photo_url, p.looking_for
      FROM cats c
      LEFT JOIN cat_photos cp 
        ON c.cat_id = cp.cat_id AND cp.is_primary = true
      LEFT JOIN preferences p 
        ON c.cat_id = p.cat_id
      WHERE c.is_active = true
        AND c.cat_id != $1
        -- Apply swiper's preferences to filter candidates
        AND c.cat_id IN (
          SELECT c2.cat_id
          FROM cats c2
          WHERE (
            -- Gender filter: 'A' = Any, 'M' = Male, 'F' = Female
            (SELECT preferred_gender FROM preferences WHERE cat_id = $1) = 'A'
            OR (SELECT preferred_gender FROM preferences WHERE cat_id = $1) = c2.gender
          )
          AND (
            -- Age filter: min/max age range
            (SELECT preferred_age_min FROM preferences WHERE cat_id = $1) IS NULL
            OR c2.age >= (SELECT preferred_age_min FROM preferences WHERE cat_id = $1)
          )
          AND (
            -- Age filter: max age range
            (SELECT preferred_age_max FROM preferences WHERE cat_id = $1) IS NULL
            OR c2.age <= (SELECT preferred_age_max FROM preferences WHERE cat_id = $1)
          )
        )
      ORDER BY c.created_at DESC
      LIMIT 20;
    `;

    const result = await query(sql, [swiperCatId]);
    return res.json({ cats: result.rows, hasMore: result.rows.length === 20 });
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

    const ownsSwiperCat = await catBelongsToUser(Number(swiper_cat_id), req.user.user_id);
    if (!ownsSwiperCat) {
      return res.status(403).json({ error: "You can only swipe as your own cat" });
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

    const ownsCat = await catBelongsToUser(catId, req.user.user_id);
    if (!ownsCat) {
      return res.status(403).json({ error: "You can only view matches for your own cats" });
    }

    const sql = `
      SELECT 
        m.match_id,
        m.matched_at,
        m.status,
        c1.cat_id AS cat1_id,
        c1.name AS cat1_name,
        c2.cat_id AS cat2_id,
        c2.name AS cat2_name,
        cp1.photo_url AS cat1_photo,
        cp1.image_id AS cat1_image_id,
        cp2.photo_url AS cat2_photo,
        cp2.image_id AS cat2_image_id,
        mtg.meeting_id,
        mtg.scheduled_time,
        mtg.duration_hours,
        v.name AS venue_name
      FROM matches m
      JOIN cats c1 ON m.cat1_id = c1.cat_id
      JOIN cats c2 ON m.cat2_id = c2.cat_id
      LEFT JOIN cat_photos cp1 ON c1.cat_id = cp1.cat_id AND cp1.is_primary = true
      LEFT JOIN cat_photos cp2 ON c2.cat_id = cp2.cat_id AND cp2.is_primary = true
      LEFT JOIN meetings mtg ON m.match_id = mtg.match_id
      LEFT JOIN venues v ON mtg.venue_id = v.venue_id
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

