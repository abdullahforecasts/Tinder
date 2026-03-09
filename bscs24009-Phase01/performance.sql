-- ============================================
-- PURRMATCH PERFORMANCE TESTING
-- ============================================

-- ====== SECTION A: WITH INDEXES (After) ======

\echo '--- Q1: Find Swipeable Cats (WITH indexes) ---'
EXPLAIN ANALYZE
SELECT c.cat_id, c.name, c.breed, c.age, c.bio,
       cp.photo_url, p.looking_for
FROM cats c
JOIN cat_photos cp ON c.cat_id = cp.cat_id AND cp.is_primary = true
JOIN preferences p ON c.cat_id = p.cat_id
WHERE c.is_active = true
  AND c.cat_id NOT IN (
      SELECT swiped_cat_id FROM swipes WHERE swiper_cat_id = 1
  )
  AND p.looking_for = 'playmate'
ORDER BY c.created_at DESC
LIMIT 20;

\echo '--- Q2: Mutual Match Detection (WITH indexes) ---'
EXPLAIN ANALYZE
SELECT EXISTS(
    SELECT 1 FROM swipes
    WHERE swiper_cat_id = 15
      AND swiped_cat_id = 16
      AND direction = 'right'
) AS reciprocal_exists;

\echo '--- Q3: Chat Messages (WITH indexes) ---'
EXPLAIN ANALYZE
SELECT m.message_id, m.content, m.sent_at, m.read_at,
       u.full_name AS sender_name
FROM messages m
JOIN users u ON m.sender_id = u.user_id
WHERE m.match_id = 1
ORDER BY m.sent_at DESC
LIMIT 50;

\echo '--- Q4: Venue Availability (WITH indexes) ---'
EXPLAIN ANALYZE
SELECT v.venue_id, v.name, v.capacity,
       COALESCE(SUM(vb.slots_reserved), 0) AS booked_slots,
       v.capacity - COALESCE(SUM(vb.slots_reserved), 0) AS available_slots
FROM venues v
LEFT JOIN venue_bookings vb
    ON v.venue_id = vb.venue_id
    AND vb.time_slot BETWEEN NOW() + INTERVAL '1 day' AND NOW() + INTERVAL '1 day 3 hours'
    AND vb.status IN ('reserved', 'confirmed')
WHERE v.venue_id = 1
GROUP BY v.venue_id, v.name, v.capacity;

\echo '--- Q5: Match Analytics (WITH indexes) ---'
EXPLAIN ANALYZE
SELECT * FROM match_statistics
ORDER BY total_matches DESC, likes_received DESC
LIMIT 10;


-- ====== DROP INDEXES ======

DROP INDEX IF EXISTS idx_cats_active;
DROP INDEX IF EXISTS idx_cat_photos_cat_id;
DROP INDEX IF EXISTS idx_preferences_cat_id;
DROP INDEX IF EXISTS idx_preferences_looking_for;
DROP INDEX IF EXISTS idx_swipes_swiper;
DROP INDEX IF EXISTS idx_swipes_swiped;
DROP INDEX IF EXISTS idx_swipes_direction;
DROP INDEX IF EXISTS idx_matches_cat1;
DROP INDEX IF EXISTS idx_matches_cat2;
DROP INDEX IF EXISTS idx_matches_cats;
DROP INDEX IF EXISTS idx_matches_active;
DROP INDEX IF EXISTS idx_messages_match;
DROP INDEX IF EXISTS idx_messages_sender;
DROP INDEX IF EXISTS idx_messages_match_time;
DROP INDEX IF EXISTS idx_messages_unread;
DROP INDEX IF EXISTS idx_venue_bookings_venue;
DROP INDEX IF EXISTS idx_venue_bookings_meeting;
DROP INDEX IF EXISTS idx_venue_bookings_timeslot;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_cats_breed;
DROP INDEX IF EXISTS idx_venues_city;
DROP INDEX IF EXISTS idx_cats_owner_id;
DROP INDEX IF EXISTS idx_meetings_match;
DROP INDEX IF EXISTS idx_meetings_venue;

\echo 'Indexes dropped.'


-- ====== SECTION B: WITHOUT INDEXES (Before) ======

\echo '--- Q1: Find Swipeable Cats (WITHOUT indexes) ---'
EXPLAIN ANALYZE
SELECT c.cat_id, c.name, c.breed, c.age, c.bio,
       cp.photo_url, p.looking_for
FROM cats c
JOIN cat_photos cp ON c.cat_id = cp.cat_id AND cp.is_primary = true
JOIN preferences p ON c.cat_id = p.cat_id
WHERE c.is_active = true
  AND c.cat_id NOT IN (
      SELECT swiped_cat_id FROM swipes WHERE swiper_cat_id = 1
  )
  AND p.looking_for = 'playmate'
ORDER BY c.created_at DESC
LIMIT 20;

\echo '--- Q2: Mutual Match Detection (WITHOUT indexes) ---'
EXPLAIN ANALYZE
SELECT EXISTS(
    SELECT 1 FROM swipes
    WHERE swiper_cat_id = 15
      AND swiped_cat_id = 16
      AND direction = 'right'
) AS reciprocal_exists;

\echo '--- Q3: Chat Messages (WITHOUT indexes) ---'
EXPLAIN ANALYZE
SELECT m.message_id, m.content, m.sent_at, m.read_at,
       u.full_name AS sender_name
FROM messages m
JOIN users u ON m.sender_id = u.user_id
WHERE m.match_id = 1
ORDER BY m.sent_at DESC
LIMIT 50;

\echo '--- Q4: Venue Availability (WITHOUT indexes) ---'
EXPLAIN ANALYZE
SELECT v.venue_id, v.name, v.capacity,
       COALESCE(SUM(vb.slots_reserved), 0) AS booked_slots,
       v.capacity - COALESCE(SUM(vb.slots_reserved), 0) AS available_slots
FROM venues v
LEFT JOIN venue_bookings vb
    ON v.venue_id = vb.venue_id
    AND vb.time_slot BETWEEN NOW() + INTERVAL '1 day' AND NOW() + INTERVAL '1 day 3 hours'
    AND vb.status IN ('reserved', 'confirmed')
WHERE v.venue_id = 1
GROUP BY v.venue_id, v.name, v.capacity;

\echo '--- Q5: Match Analytics (WITHOUT indexes) ---'
EXPLAIN ANALYZE
SELECT * FROM match_statistics
ORDER BY total_matches DESC, likes_received DESC
LIMIT 10;


-- ====== RESTORE INDEXES ======

CREATE INDEX idx_cats_owner_id ON cats(owner_id);
CREATE INDEX idx_cat_photos_cat_id ON cat_photos(cat_id);
CREATE INDEX idx_preferences_cat_id ON preferences(cat_id);
CREATE INDEX idx_swipes_swiper ON swipes(swiper_cat_id);
CREATE INDEX idx_swipes_swiped ON swipes(swiped_cat_id);
CREATE INDEX idx_matches_cat1 ON matches(cat1_id);
CREATE INDEX idx_matches_cat2 ON matches(cat2_id);
CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_meetings_match ON meetings(match_id);
CREATE INDEX idx_meetings_venue ON meetings(venue_id);
CREATE INDEX idx_venue_bookings_venue ON venue_bookings(venue_id);
CREATE INDEX idx_venue_bookings_meeting ON venue_bookings(meeting_id);
CREATE INDEX idx_swipes_direction ON swipes(swiper_cat_id, swiped_cat_id, direction);
CREATE INDEX idx_messages_match_time ON messages(match_id, sent_at DESC);
CREATE INDEX idx_venue_bookings_timeslot ON venue_bookings(venue_id, time_slot, status);
CREATE INDEX idx_matches_cats ON matches(cat1_id, cat2_id);
CREATE INDEX idx_cats_active ON cats(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_messages_unread ON messages(match_id) WHERE read_at IS NULL;
CREATE INDEX idx_matches_active ON matches(cat1_id, cat2_id) WHERE status = 'active';
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_cats_breed ON cats(breed);
CREATE INDEX idx_preferences_looking_for ON preferences(looking_for);
CREATE INDEX idx_venues_city ON venues(city);

\echo 'Indexes restored.'