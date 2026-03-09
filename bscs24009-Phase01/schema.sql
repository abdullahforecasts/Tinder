
-- ============================================

-- Drop existing tables (for clean setup)
DROP TABLE IF EXISTS venue_bookings CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS swipes CASCADE;
DROP TABLE IF EXISTS preferences CASCADE;
DROP TABLE IF EXISTS cat_photos CASCADE;
DROP TABLE IF EXISTS cats CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- TABLE 1: USERS
-- ============================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'breeder', 'shelter', 'admin')),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ============================================
-- TABLE 2: CATS
-- ============================================
CREATE TABLE cats (
    cat_id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age <= 30),
    gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
    neutered BOOLEAN DEFAULT FALSE,
    vaccination_status VARCHAR(50) DEFAULT 'unknown',
    bio TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_cats_owner FOREIGN KEY (owner_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    
    CONSTRAINT check_location CHECK (
        (location_lat IS NULL AND location_lng IS NULL) OR 
        (location_lat BETWEEN -90 AND 90 AND location_lng BETWEEN -180 AND 180)
    )
);

-- ============================================
-- TABLE 3: CAT_PHOTOS
-- ============================================
CREATE TABLE cat_photos (
    photo_id SERIAL PRIMARY KEY,
    cat_id INTEGER NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    upload_order INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_cat_photos_cat FOREIGN KEY (cat_id) 
        REFERENCES cats(cat_id) ON DELETE CASCADE
);

-- ============================================
-- TABLE 4: PREFERENCES
-- ============================================
CREATE TABLE preferences (
    preference_id SERIAL PRIMARY KEY,
    cat_id INTEGER NOT NULL UNIQUE,
    looking_for VARCHAR(20) NOT NULL CHECK (looking_for IN ('playmate', 'breeding', 'adoption')),
    preferred_gender CHAR(1) CHECK (preferred_gender IN ('M', 'F', 'A')),
    preferred_age_min INTEGER CHECK (preferred_age_min >= 0),
    preferred_age_max INTEGER CHECK (preferred_age_max >= preferred_age_min),
    max_distance_km INTEGER CHECK (max_distance_km > 0),
    
    CONSTRAINT fk_preferences_cat FOREIGN KEY (cat_id) 
        REFERENCES cats(cat_id) ON DELETE CASCADE
);

-- ============================================
-- TABLE 5: SWIPES
-- ============================================
CREATE TABLE swipes (
    swipe_id SERIAL PRIMARY KEY,
    swiper_cat_id INTEGER NOT NULL,
    swiped_cat_id INTEGER NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('left', 'right')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_swipes_swiper FOREIGN KEY (swiper_cat_id) 
        REFERENCES cats(cat_id) ON DELETE CASCADE,
    CONSTRAINT fk_swipes_swiped FOREIGN KEY (swiped_cat_id) 
        REFERENCES cats(cat_id) ON DELETE CASCADE,
    
    CONSTRAINT check_no_self_swipe CHECK (swiper_cat_id != swiped_cat_id),
    CONSTRAINT unique_swipe UNIQUE (swiper_cat_id, swiped_cat_id)
);

-- ============================================
-- TABLE 6: MATCHES
-- ============================================
CREATE TABLE matches (
    match_id SERIAL PRIMARY KEY,
    cat1_id INTEGER NOT NULL,
    cat2_id INTEGER NOT NULL,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'meeting_scheduled')),
    
    CONSTRAINT fk_matches_cat1 FOREIGN KEY (cat1_id) 
        REFERENCES cats(cat_id) ON DELETE CASCADE,
    CONSTRAINT fk_matches_cat2 FOREIGN KEY (cat2_id) 
        REFERENCES cats(cat_id) ON DELETE CASCADE,
    
    CONSTRAINT check_different_cats CHECK (cat1_id != cat2_id),
    CONSTRAINT check_cat_order CHECK (cat1_id < cat2_id),
    CONSTRAINT unique_match UNIQUE (cat1_id, cat2_id)
);

-- ============================================
-- TABLE 7: MESSAGES
-- ============================================
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    
    CONSTRAINT fk_messages_match FOREIGN KEY (match_id) 
        REFERENCES matches(match_id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    
    CONSTRAINT check_message_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

-- ============================================
-- TABLE 8: VENUES
-- ============================================
CREATE TABLE venues (
    venue_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    hourly_rate DECIMAL(10, 2) NOT NULL CHECK (hourly_rate >= 0),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20)
);

-- ============================================
-- TABLE 9: MEETINGS
-- ============================================
CREATE TABLE meetings (
    meeting_id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL UNIQUE,
    venue_id INTEGER NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    duration_hours INTEGER NOT NULL CHECK (duration_hours > 0 AND duration_hours <= 8),
    total_cost DECIMAL(10, 2) NOT NULL CHECK (total_cost >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_meetings_match FOREIGN KEY (match_id) 
        REFERENCES matches(match_id) ON DELETE CASCADE,
    CONSTRAINT fk_meetings_venue FOREIGN KEY (venue_id) 
        REFERENCES venues(venue_id) ON DELETE RESTRICT,
    
    CONSTRAINT check_future_meeting CHECK (scheduled_time > created_at)
);

-- ============================================
-- TABLE 10: VENUE_BOOKINGS
-- ============================================
CREATE TABLE venue_bookings (
    booking_id SERIAL PRIMARY KEY,
    venue_id INTEGER NOT NULL,
    meeting_id INTEGER NOT NULL UNIQUE,
    time_slot TIMESTAMP NOT NULL,
    slots_reserved INTEGER NOT NULL CHECK (slots_reserved > 0),
    status VARCHAR(20) DEFAULT 'reserved' CHECK (status IN ('reserved', 'confirmed', 'cancelled')),
    
    CONSTRAINT fk_venue_bookings_venue FOREIGN KEY (venue_id) 
        REFERENCES venues(venue_id) ON DELETE RESTRICT,
    CONSTRAINT fk_venue_bookings_meeting FOREIGN KEY (meeting_id) 
        REFERENCES meetings(meeting_id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES
-- ============================================

-- Foreign Key Indexes
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

-- Composite Indexes (CRITICAL)
CREATE INDEX idx_swipes_direction ON swipes(swiper_cat_id, swiped_cat_id, direction);
CREATE INDEX idx_messages_match_time ON messages(match_id, sent_at DESC);
CREATE INDEX idx_venue_bookings_timeslot ON venue_bookings(venue_id, time_slot, status);
CREATE INDEX idx_matches_cats ON matches(cat1_id, cat2_id);

-- Partial Indexes
CREATE INDEX idx_cats_active ON cats(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_messages_unread ON messages(match_id) WHERE read_at IS NULL;
CREATE INDEX idx_matches_active ON matches(cat1_id, cat2_id) WHERE status = 'active';

-- Additional Performance Indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_cats_breed ON cats(breed);
CREATE INDEX idx_preferences_looking_for ON preferences(looking_for);
CREATE INDEX idx_venues_city ON venues(city);

-- ============================================
-- VIEWS (3 Complex Views)
-- ============================================

-- VIEW 1: Match Analytics Dashboard
CREATE VIEW match_statistics AS
SELECT 
    c.cat_id,
    c.name AS cat_name,
    c.breed,
    u.full_name AS owner_name,
    COUNT(DISTINCT s.swipe_id) AS total_swipes_made,
    COUNT(DISTINCT CASE WHEN s.direction = 'right' THEN s.swipe_id END) AS likes_given,
    COUNT(DISTINCT sr.swipe_id) AS total_swipes_received,
    COUNT(DISTINCT CASE WHEN sr.direction = 'right' THEN sr.swipe_id END) AS likes_received,
    COUNT(DISTINCT m.match_id) AS total_matches,
    COALESCE(AVG(EXTRACT(EPOCH FROM (m.matched_at - c.created_at))/86400), 0) AS avg_days_to_first_match
FROM cats c
JOIN users u ON c.owner_id = u.user_id
LEFT JOIN swipes s ON c.cat_id = s.swiper_cat_id
LEFT JOIN swipes sr ON c.cat_id = sr.swiped_cat_id
LEFT JOIN matches m ON c.cat_id IN (m.cat1_id, m.cat2_id)
GROUP BY c.cat_id, c.name, c.breed, u.full_name;

-- VIEW 2: Venue Availability
CREATE VIEW venue_availability AS
SELECT 
    v.venue_id,
    v.name AS venue_name,
    v.city,
    v.capacity,
    v.hourly_rate,
    ts.time_slot,
    COALESCE(SUM(vb.slots_reserved), 0) AS slots_booked,
    v.capacity - COALESCE(SUM(vb.slots_reserved), 0) AS slots_available,
    CASE 
        WHEN COALESCE(SUM(vb.slots_reserved), 0) >= v.capacity THEN 'Full'
        WHEN COALESCE(SUM(vb.slots_reserved), 0) > v.capacity * 0.7 THEN 'Almost Full'
        ELSE 'Available'
    END AS availability_status
FROM venues v
CROSS JOIN generate_series(
    date_trunc('hour', CURRENT_TIMESTAMP),
    date_trunc('hour', CURRENT_TIMESTAMP) + INTERVAL '7 days',
    INTERVAL '1 hour'
) AS ts(time_slot)
LEFT JOIN venue_bookings vb ON v.venue_id = vb.venue_id 
    AND date_trunc('hour', vb.time_slot) = ts.time_slot
    AND vb.status IN ('reserved', 'confirmed')
GROUP BY v.venue_id, v.name, v.city, v.capacity, v.hourly_rate, ts.time_slot
ORDER BY v.venue_id, ts.time_slot;

-- VIEW 3: Breed Compatibility Analysis
CREATE VIEW breed_compatibility AS
SELECT 
    c1.breed AS breed1,
    c2.breed AS breed2,
    COUNT(DISTINCT m.match_id) AS match_count,
    AVG(msg_stats.message_count) AS avg_messages_per_match,
    COUNT(DISTINCT CASE WHEN mt.meeting_id IS NOT NULL THEN m.match_id END) AS meetings_scheduled,
    ROUND(
        COUNT(DISTINCT CASE WHEN mt.meeting_id IS NOT NULL THEN m.match_id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT m.match_id), 0) * 100, 
        2
    ) AS meeting_conversion_rate
FROM matches m
JOIN cats c1 ON m.cat1_id = c1.cat_id
JOIN cats c2 ON m.cat2_id = c2.cat_id
LEFT JOIN meetings mt ON m.match_id = mt.match_id
LEFT JOIN (
    SELECT 
        match_id, 
        COUNT(*) AS message_count
    FROM messages 
    GROUP BY match_id
) msg_stats ON m.match_id = msg_stats.match_id
GROUP BY c1.breed, c2.breed
HAVING COUNT(DISTINCT m.match_id) >= 1
ORDER BY match_count DESC;

-- ============================================
-- TRIGGERS (3 Triggers)
-- ============================================

-- TRIGGER 1: Auto-create match on mutual swipe
CREATE OR REPLACE FUNCTION check_and_create_match()
RETURNS TRIGGER AS $$
DECLARE
    reciprocal_swipe_exists BOOLEAN;
    new_match_id INTEGER;
BEGIN
    IF NEW.direction = 'right' THEN
        SELECT EXISTS(
            SELECT 1 FROM swipes
            WHERE swiper_cat_id = NEW.swiped_cat_id
            AND swiped_cat_id = NEW.swiper_cat_id
            AND direction = 'right'
        ) INTO reciprocal_swipe_exists;
        
        IF reciprocal_swipe_exists THEN
            INSERT INTO matches (cat1_id, cat2_id, matched_at, status)
            VALUES (
                LEAST(NEW.swiper_cat_id, NEW.swiped_cat_id),
                GREATEST(NEW.swiper_cat_id, NEW.swiped_cat_id),
                CURRENT_TIMESTAMP,
                'active'
            )
            ON CONFLICT (cat1_id, cat2_id) DO NOTHING
            RETURNING match_id INTO new_match_id;
            
            RAISE NOTICE 'Match created! Match ID: %', new_match_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_match_on_mutual_swipe
AFTER INSERT ON swipes
FOR EACH ROW
EXECUTE FUNCTION check_and_create_match();

-- TRIGGER 2: Prevent venue overbooking
CREATE OR REPLACE FUNCTION validate_venue_capacity()
RETURNS TRIGGER AS $$
DECLARE
    current_bookings INTEGER;
    venue_max_capacity INTEGER;
BEGIN
    SELECT capacity INTO venue_max_capacity
    FROM venues
    WHERE venue_id = NEW.venue_id;
    
    SELECT COALESCE(SUM(slots_reserved), 0) INTO current_bookings
    FROM venue_bookings
    WHERE venue_id = NEW.venue_id
    AND date_trunc('hour', time_slot) = date_trunc('hour', NEW.time_slot)
    AND status IN ('reserved', 'confirmed')
    AND booking_id != COALESCE(NEW.booking_id, -1);
    
    IF (current_bookings + NEW.slots_reserved) > venue_max_capacity THEN
        RAISE EXCEPTION 'Venue capacity exceeded! Available: %, Requested: %', 
            (venue_max_capacity - current_bookings), NEW.slots_reserved;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_venue_overbooking
BEFORE INSERT OR UPDATE ON venue_bookings
FOR EACH ROW
EXECUTE FUNCTION validate_venue_capacity();

-- TRIGGER 3: Update match status when meeting scheduled
CREATE OR REPLACE FUNCTION update_match_status_on_meeting()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('confirmed', 'pending') THEN
        UPDATE matches
        SET status = 'meeting_scheduled'
        WHERE match_id = NEW.match_id;
    END IF;
    
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        UPDATE matches
        SET status = 'active'
        WHERE match_id = NEW.match_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_match_status
AFTER INSERT OR UPDATE ON meetings
FOR EACH ROW
EXECUTE FUNCTION update_match_status_on_meeting();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Stores cat owners, breeders, shelters, and admins';
COMMENT ON TABLE cats IS 'Individual cat profiles with location';
COMMENT ON TABLE swipes IS 'Junction table tracking swipe actions';
COMMENT ON TABLE matches IS 'Junction table for mutual matches';
COMMENT ON TABLE venues IS 'Cat cafes and parks for meetups';
COMMENT ON TABLE venue_bookings IS 'Time slot reservations with capacity tracking';

-- ============================================
-- SCHEMA COMPLETE
-- ============================================





-- abd@abdullah:~$ sudo -u postgres psql -d purrmatch
-- psql (16.11 (Ubuntu 16.11-0ubuntu0.24.04.1))
-- Type "help" for help.

-- purrmatch=# DROP VIEW IF EXISTS venue_availability CASCADE;
-- NOTICE:  view "venue_availability" does not exist, skipping
-- DROP VIEW
-- purrmatch=# CREATE VIEW venue_availability AS
-- SELECT 
--     v.venue_id,
--     v.name AS venue_name,
--     v.city,
--     v.capacity,
--     v.hourly_rate,
--     ts.time_slot,  -- Changed this line
--     COALESCE(SUM(vb.slots_reserved), 0) AS slots_booked,
--     v.capacity - COALESCE(SUM(vb.slots_reserved), 0) AS slots_available,
--     CASE 
--         WHEN COALESCE(SUM(vb.slots_reserved), 0) >= v.capacity THEN 'Full'
--         WHEN COALESCE(SUM(vb.slots_reserved), 0) > v.capacity * 0.7 THEN 'Almost Full'
--         ELSE 'Available'
--     END AS availability_status
-- FROM venues v
-- CROSS JOIN generate_series(
--     date_trunc('hour', CURRENT_TIMESTAMP),
--     date_trunc('hour', CURRENT_TIMESTAMP) + INTERVAL '7 days',
--     INTERVAL '1 hour'
-- ) AS ts(time_slot)  -- Added alias here
-- LEFT JOIN venue_bookings vb ON v.venue_id = vb.venue_id 
--     AND date_trunc('hour', vb.time_slot) = ts.time_slot  -- Changed this line
-- ORDER BY v.venue_id, ts.time_slot;  -- Changed this liney_rate, ts.time_slot  --
-- CREATE VIEW
-- purrmatch=# SELECT * FROM venue_availability LIMIT 10;
-- purrmatch=# 