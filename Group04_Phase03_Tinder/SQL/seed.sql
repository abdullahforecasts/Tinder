-- ============================================
-- PURRMATCH SEED DATA
-- 150+ Records with Referential Integrity
-- ============================================

-- Clear existing data and reset sequences
TRUNCATE TABLE venue_bookings, meetings, messages, matches, swipes, 
               preferences, cat_photos, cats, venues, users 
RESTART IDENTITY CASCADE;

-- ============================================
-- SEED USERS (30 users)
-- ============================================
INSERT INTO users (email, password_hash, role, full_name, phone) VALUES
-- Owners (20)
('sarah.johnson@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Sarah Johnson', '+1-555-0101'),
('mike.chen@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Mike Chen', '+1-555-0102'),
('emily.rodriguez@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Emily Rodriguez', '+1-555-0103'),
('james.williams@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'James Williams', '+1-555-0104'),
('lisa.brown@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Lisa Brown', '+1-555-0105'),
('david.miller@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'David Miller', '+1-555-0106'),
('jessica.davis@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Jessica Davis', '+1-555-0107'),
('ryan.garcia@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Ryan Garcia', '+1-555-0108'),
('amanda.martinez@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Amanda Martinez', '+1-555-0109'),
('kevin.lopez@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Kevin Lopez', '+1-555-0110'),
('natalie.wilson@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Natalie Wilson', '+1-555-0111'),
('chris.anderson@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Chris Anderson', '+1-555-0112'),
('michelle.taylor@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Michelle Taylor', '+1-555-0113'),
('brandon.thomas@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Brandon Thomas', '+1-555-0114'),
('stephanie.moore@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Stephanie Moore', '+1-555-0115'),
('daniel.jackson@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Daniel Jackson', '+1-555-0116'),
('rebecca.white@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Rebecca White', '+1-555-0117'),
('justin.harris@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Justin Harris', '+1-555-0118'),
('lauren.clark@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Lauren Clark', '+1-555-0119'),
('andrew.lewis@email.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'owner', 'Andrew Lewis', '+1-555-0120'),

-- Breeders (5)
('premium.persians@catbreeder.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'breeder', 'Premium Persian Cattery', '+1-555-0201'),
('bengal.royalty@catbreeder.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'breeder', 'Bengal Royalty Breeders', '+1-555-0202'),
('siamese.elite@catbreeder.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'breeder', 'Elite Siamese Cattery', '+1-555-0203'),
('maine.coon.manor@catbreeder.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'breeder', 'Maine Coon Manor', '+1-555-0204'),
('ragdoll.heaven@catbreeder.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'breeder', 'Ragdoll Heaven Cattery', '+1-555-0205'),

-- Shelters (3)
('info@pawsrescue.org', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'shelter', 'Paws Rescue Center', '+1-555-0301'),
('contact@felinesanctuary.org', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'shelter', 'Feline Sanctuary', '+1-555-0302'),
('adopt@cityanimalshelter.org', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'shelter', 'City Animal Shelter', '+1-555-0303'),

-- Admins (2)
('admin@purrmatch.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'admin', 'System Administrator', '+1-555-0401'),
('support@purrmatch.com', '$2b$10$l2PoJCGymA8h6R5SAbqsTeB/6ftyX5VHyRU4Em4ihglSQ3Oneqzga', 'admin', 'Support Team', '+1-555-0402');

-- ============================================
-- SEED CATS (40 cats)
-- ============================================
INSERT INTO cats (owner_id, name, breed, age, gender, neutered, vaccination_status, bio, location_lat, location_lng, is_active) VALUES
(1, 'Whiskers', 'Persian', 3, 'M', true, 'Up to date', 'Fluffy gentleman seeking companionship', 40.7128, -74.0060, true),
(2, 'Luna', 'Siamese', 2, 'F', true, 'Up to date', 'Chatty girl who loves attention', 40.7580, -73.9855, true),
(3, 'Mittens', 'Maine Coon', 4, 'F', true, 'Up to date', 'Gentle giant looking for friends', 40.7489, -73.9680, true),
(4, 'Shadow', 'British Shorthair', 5, 'M', true, 'Up to date', 'Calm and dignified', 40.7614, -73.9776, true),
(5, 'Bella', 'Ragdoll', 1, 'F', false, 'Up to date', 'Sweet kitten ready to play', 40.7282, -73.7949, true),
(6, 'Oliver', 'Bengal', 3, 'M', true, 'Up to date', 'Active and playful adventurer', 40.7505, -73.9934, true),
(7, 'Chloe', 'Scottish Fold', 2, 'F', true, 'Up to date', 'Adorable with unique ears', 40.7589, -73.9851, true),
(8, 'Simba', 'Abyssinian', 4, 'M', true, 'Up to date', 'Energetic and curious', 40.7306, -73.9352, true),
(9, 'Nala', 'Russian Blue', 3, 'F', true, 'Up to date', 'Elegant and quiet', 40.7484, -73.9857, true),
(10, 'Max', 'Sphynx', 2, 'M', true, 'Up to date', 'Unique and loving', 40.7061, -74.0087, true),
(11, 'Lily', 'Persian', 5, 'F', true, 'Up to date', 'Mature lady seeking gentle friend', 40.7589, -73.9851, true),
(12, 'Tiger', 'Bengal', 2, 'M', true, 'Up to date', 'Wild pattern, sweet personality', 40.7282, -73.7949, true),
(13, 'Daisy', 'Ragdoll', 3, 'F', true, 'Up to date', 'Loves to be held and cuddled', 40.7128, -74.0060, true),
(14, 'Leo', 'Maine Coon', 6, 'M', true, 'Up to date', 'Big boy with bigger heart', 40.7614, -73.9776, true),
(15, 'Sophie', 'Siamese', 2, 'F', true, 'Up to date', 'Talkative and affectionate', 40.7580, -73.9855, true),
(16, 'Charlie', 'British Shorthair', 4, 'M', true, 'Up to date', 'Laid-back gentleman', 40.7489, -73.9680, true),
(17, 'Zoe', 'Scottish Fold', 1, 'F', false, 'Partial', 'Young and playful', 40.7505, -73.9934, true),
(18, 'Milo', 'Abyssinian', 3, 'M', true, 'Up to date', 'Athletic and intelligent', 40.7306, -73.9352, true),
(19, 'Lucy', 'Russian Blue', 5, 'F', true, 'Up to date', 'Reserved but loyal', 40.7484, -73.9857, true),
(20, 'Oscar', 'Sphynx', 2, 'M', true, 'Up to date', 'Warm and cuddly despite no fur', 40.7061, -74.0087, true),
(1, 'Smokey', 'Domestic Shorthair', 7, 'M', true, 'Up to date', 'Senior cat with lots of love', 40.7128, -74.0060, true),
(3, 'Precious', 'Calico', 4, 'F', true, 'Up to date', 'Colorful personality to match', 40.7489, -73.9680, true),
(5, 'Boots', 'Tuxedo', 2, 'M', true, 'Up to date', 'Dapper in his formal attire', 40.7282, -73.7949, true),
(7, 'Princess', 'Himalayan', 3, 'F', true, 'Up to date', 'Royalty seeking her prince', 40.7589, -73.9851, true),
(9, 'Duke', 'Norwegian Forest', 5, 'M', true, 'Up to date', 'Majestic and independent', 40.7484, -73.9857, true),
(21, 'Sapphire', 'Persian', 2, 'F', false, 'Up to date', 'Champion bloodline', 40.7128, -74.0060, true),
(21, 'Diamond', 'Persian', 3, 'F', false, 'Up to date', 'Show quality', 40.7128, -74.0060, true),
(22, 'Raja', 'Bengal', 2, 'M', false, 'Up to date', 'Stunning rosettes', 40.7580, -73.9855, true),
(22, 'Kali', 'Bengal', 1, 'F', false, 'Up to date', 'Glittered coat', 40.7580, -73.9855, true),
(23, 'Coco', 'Siamese', 2, 'F', false, 'Up to date', 'Traditional apple head', 40.7489, -73.9680, true),
(23, 'Mocha', 'Siamese', 3, 'M', false, 'Up to date', 'Seal point champion', 40.7489, -73.9680, true),
(24, 'Bear', 'Maine Coon', 3, 'M', false, 'Up to date', 'Large frame', 40.7614, -73.9776, true),
(24, 'Honey', 'Maine Coon', 2, 'F', false, 'Up to date', 'Sweet personality', 40.7614, -73.9776, true),
(25, 'Cloud', 'Ragdoll', 2, 'M', false, 'Up to date', 'Blue mitted', 40.7505, -73.9934, true),
(25, 'Angel', 'Ragdoll', 1, 'F', false, 'Up to date', 'Seal bicolor', 40.7505, -73.9934, true),
(26, 'Hope', 'Domestic Shorthair', 2, 'F', true, 'Up to date', 'Sweet rescue', 40.7306, -73.9352, true),
(26, 'Lucky', 'Tabby', 3, 'M', true, 'Up to date', 'Friendly boy', 40.7306, -73.9352, true),
(27, 'MittensJr', 'Calico', 1, 'F', true, 'Up to date', 'Playful kitten', 40.7484, -73.9857, true),
(28, 'Buddy', 'Domestic Longhair', 4, 'M', true, 'Up to date', 'Gentle soul', 40.7061, -74.0087, true),
(28, 'Misty', 'Domestic Shorthair', 5, 'F', true, 'Up to date', 'Mature cat', 40.7061, -74.0087, true);

-- ============================================
-- SEED CAT_PHOTOS (80 photos) - Using Cataas API with Image IDs
-- ============================================
INSERT INTO cat_photos (cat_id, photo_url, image_id, is_primary, upload_order) VALUES
(1, 'https://cataas.com/cat/04eEQhDfAL8l5nt3', '04eEQhDfAL8l5nt3', true, 1),
(1, 'https://cataas.com/cat/05Xd4JtN14983pns', '05Xd4JtN14983pns', false, 2),
(2, 'https://cataas.com/cat/09wFxpacQzvf9jfM', '09wFxpacQzvf9jfM', true, 1),
(2, 'https://cataas.com/cat/0B2g7aTANObiqPJJ', '0B2g7aTANObiqPJJ', false, 2),
(3, 'https://cataas.com/cat/0BTTVEVWXNyOgXYd', '0BTTVEVWXNyOgXYd', true, 1),
(3, 'https://cataas.com/cat/0C2bQ39x8kuhx31p', '0C2bQ39x8kuhx31p', false, 2),
(4, 'https://cataas.com/cat/0DVs2d6bIVIt3ehk', '0DVs2d6bIVIt3ehk', true, 1),
(4, 'https://cataas.com/cat/0EsIYDG0at0TPpPD', '0EsIYDG0at0TPpPD', false, 2),
(5, 'https://cataas.com/cat/0F0IKAPOdWiE755P', '0F0IKAPOdWiE755P', true, 1),
(5, 'https://cataas.com/cat/0GC9MRUAqxhBzPyA', '0GC9MRUAqxhBzPyA', false, 2),
(6, 'https://cataas.com/cat/0M0Lo3dsYft79xNd', '0M0Lo3dsYft79xNd', true, 1),
(6, 'https://cataas.com/cat/0mstmOIucwiN80jb', '0mstmOIucwiN80jb', false, 2),
(7, 'https://cataas.com/cat/0mxliw1UgtFdDkU8', '0mxliw1UgtFdDkU8', true, 1),
(7, 'https://cataas.com/cat/0nnJxjVoMK6GVmRS', '0nnJxjVoMK6GVmRS', false, 2),
(8, 'https://cataas.com/cat/0oJmiPshaDZD54M8', '0oJmiPshaDZD54M8', true, 1),
(8, 'https://cataas.com/cat/0PJwXcTrNzNIzGBJ', '0PJwXcTrNzNIzGBJ', false, 2),
(9, 'https://cataas.com/cat/0RU7ZkgzyvWv8UJG', '0RU7ZkgzyvWv8UJG', true, 1),
(9, 'https://cataas.com/cat/0TnOAMpokjANBFVk', '0TnOAMpokjANBFVk', false, 2),
(10, 'https://cataas.com/cat/0U4jE41oGuUWThFX', '0U4jE41oGuUWThFX', true, 1),
(10, 'https://cataas.com/cat/0VlkBO6ValjaoeEw', '0VlkBO6ValjaoeEw', false, 2),
(11, 'https://cataas.com/cat/0w0AIO9enndfLoko', '0w0AIO9enndfLoko', true, 1),
(11, 'https://cataas.com/cat/0wKeoafTJoIbcem8', '0wKeoafTJoIbcem8', false, 2),
(12, 'https://cataas.com/cat/0wPxI2kqnJ4DoAI8', '0wPxI2kqnJ4DoAI8', true, 1),
(12, 'https://cataas.com/cat/0XykxsO1fUAZRtPp', '0XykxsO1fUAZRtPp', false, 2),
(13, 'https://cataas.com/cat/0y2qESHWnriH1CyH', '0y2qESHWnriH1CyH', true, 1),
(13, 'https://cataas.com/cat/0ycVeWWOWgDcGsYC', '0ycVeWWOWgDcGsYC', false, 2),
(14, 'https://cataas.com/cat/0YOo8tXUKraccqJl', '0YOo8tXUKraccqJl', true, 1),
(14, 'https://cataas.com/cat/0ztFbDrgDV2K7yJ1', '0ztFbDrgDV2K7yJ1', false, 2),
(15, 'https://cataas.com/cat/11yW0nVicWb0fZzo', '11yW0nVicWb0fZzo', true, 1),
(15, 'https://cataas.com/cat/14ksbtRkMqKUHxfY', '14ksbtRkMqKUHxfY', false, 2),
(16, 'https://cataas.com/cat/18MD6byVC1yKGpXp', '18MD6byVC1yKGpXp', true, 1),
(16, 'https://cataas.com/cat/18T0wqXpU3OiGrUb', '18T0wqXpU3OiGrUb', false, 2),
(17, 'https://cataas.com/cat/19Ykh6wwZdgIEL2D', '19Ykh6wwZdgIEL2D', true, 1),
(17, 'https://cataas.com/cat/1AKMzDtX4nlk6w5I', '1AKMzDtX4nlk6w5I', false, 2),
(18, 'https://cataas.com/cat/1ANDs65qm2hR9o55', '1ANDs65qm2hR9o55', true, 1),
(18, 'https://cataas.com/cat/1bJraW0IwSPm3MVd', '1bJraW0IwSPm3MVd', false, 2),
(19, 'https://cataas.com/cat/1CF7xZmlX0t8QpgP', '1CF7xZmlX0t8QpgP', true, 1),
(19, 'https://cataas.com/cat/1ddeGQUlgfQggW6N', '1ddeGQUlgfQggW6N', false, 2),
(20, 'https://cataas.com/cat/1DrcyohjhwcNaRIz', '1DrcyohjhwcNaRIz', true, 1),
(20, 'https://cataas.com/cat/1DvnD0NaGHwHMoml', '1DvnD0NaGHwHMoml', false, 2),
(21, 'https://cataas.com/cat/1eGEsddyKNwtBJFP', '1eGEsddyKNwtBJFP', true, 1),
(21, 'https://cataas.com/cat/1Egt9OiLoKACJHPw', '1Egt9OiLoKACJHPw', false, 2),
(22, 'https://cataas.com/cat/1frqP6ajw0JzkR1o', '1frqP6ajw0JzkR1o', true, 1),
(22, 'https://cataas.com/cat/1gROXVBHMQ8nLxCQ', '1gROXVBHMQ8nLxCQ', false, 2),
(23, 'https://cataas.com/cat/1ihNtm9HkcOub9Li', '1ihNtm9HkcOub9Li', true, 1),
(23, 'https://cataas.com/cat/1JcOo3LnevDdZlcq', '1JcOo3LnevDdZlcq', false, 2),
(24, 'https://cataas.com/cat/1KCTvPEcpY7ryO34', '1KCTvPEcpY7ryO34', true, 1),
(24, 'https://cataas.com/cat/1KeQpy7eHqi0SFmc', '1KeQpy7eHqi0SFmc', false, 2),
(25, 'https://cataas.com/cat/1KSwqj0a2mTz5ZrF', '1KSwqj0a2mTz5ZrF', true, 1),
(25, 'https://cataas.com/cat/1LlIgMhb3DfoW4qw', '1LlIgMhb3DfoW4qw', false, 2),
(26, 'https://cataas.com/cat/1N2AH31jiY6N9TYc', '1N2AH31jiY6N9TYc', true, 1),
(26, 'https://cataas.com/cat/1NMuf7YAebEz6VTD', '1NMuf7YAebEz6VTD', false, 2),
(27, 'https://cataas.com/cat/1ntkA1kLWffNS2xN', '1ntkA1kLWffNS2xN', true, 1),
(27, 'https://cataas.com/cat/1ozkXaGbz1CriQiG', '1ozkXaGbz1CriQiG', false, 2),
(28, 'https://cataas.com/cat/1pV0B3MW24cNSOHg', '1pV0B3MW24cNSOHg', true, 1),
(28, 'https://cataas.com/cat/1q1Ce6mM714NrMKf', '1q1Ce6mM714NrMKf', false, 2),
(29, 'https://cataas.com/cat/1RFXsaXoyCZdplFx', '1RFXsaXoyCZdplFx', true, 1),
(29, 'https://cataas.com/cat/1si02A2ZNdeNH3yo', '1si02A2ZNdeNH3yo', false, 2),
(30, 'https://cataas.com/cat/1sUjl4nEmh9OHwJz', '1sUjl4nEmh9OHwJz', true, 1),
(30, 'https://cataas.com/cat/1t9Z9QMPYhu5gBDV', '1t9Z9QMPYhu5gBDV', false, 2),
(31, 'https://cataas.com/cat/1TYt4A7YqwaeMUEF', '1TYt4A7YqwaeMUEF', true, 1),
(31, 'https://cataas.com/cat/1wpap8yckt96vOoU', '1wpap8yckt96vOoU', false, 2),
(32, 'https://cataas.com/cat/1y0sv9lnCIIiOiiT', '1y0sv9lnCIIiOiiT', true, 1),
(32, 'https://cataas.com/cat/1Y3dpssxcbHPEkfO', '1Y3dpssxcbHPEkfO', false, 2),
(33, 'https://cataas.com/cat/1Y7TMLfxRN6HmCv0', '1Y7TMLfxRN6HmCv0', true, 1),
(33, 'https://cataas.com/cat/1ZfGU7z1uIdnehgj', '1ZfGU7z1uIdnehgj', false, 2),
(34, 'https://cataas.com/cat/1ZJqBeUSx5hXK3J8', '1ZJqBeUSx5hXK3J8', true, 1),
(34, 'https://cataas.com/cat/1ZYN5WA7oCyQpy8h', '1ZYN5WA7oCyQpy8h', false, 2),
(35, 'https://cataas.com/cat/22aAuf1dsGT4uSOi', '22aAuf1dsGT4uSOi', true, 1),
(35, 'https://cataas.com/cat/22tTAaFI1Q33YBGO', '22tTAaFI1Q33YBGO', false, 2),
(36, 'https://cataas.com/cat/24WlaURCbtQyC5qN', '24WlaURCbtQyC5qN', true, 1),
(36, 'https://cataas.com/cat/25esBUofRVePPAN5', '25esBUofRVePPAN5', false, 2),
(37, 'https://cataas.com/cat/28ZtVybuyptnWzTM', '28ZtVybuyptnWzTM', true, 1),
(37, 'https://cataas.com/cat/299YJTAQz9R6cfGP', '299YJTAQz9R6cfGP', false, 2),
(38, 'https://cataas.com/cat/2AjkEyDta2fk44NE', '2AjkEyDta2fk44NE', true, 1),
(38, 'https://cataas.com/cat/2Bb8z8bR1w5EFHhz', '2Bb8z8bR1w5EFHhz', false, 2),
(39, 'https://cataas.com/cat/2bnPzTo1hBCSo4rz', '2bnPzTo1hBCSo4rz', true, 1),
(39, 'https://cataas.com/cat/2bPYDRuvU70sbgja', '2bPYDRuvU70sbgja', false, 2),
(40, 'https://cataas.com/cat/2ChLbdjUjjwehaHV', '2ChLbdjUjjwehaHV', true, 1),
(40, 'https://cataas.com/cat/2e0FOizQ3iNfwgMh', '2e0FOizQ3iNfwgMh', false, 2);

-- ============================================
-- SEED PREFERENCES (40)
-- ============================================
INSERT INTO preferences (cat_id, looking_for, preferred_gender, preferred_age_min, preferred_age_max, max_distance_km) VALUES
(1, 'playmate', 'F', 2, 5, 10),
(2, 'playmate', 'M', 1, 4, 15),
(3, 'playmate', 'A', 3, 7, 20),
(4, 'playmate', 'F', 3, 6, 10),
(5, 'playmate', 'M', 1, 3, 25),
(6, 'playmate', 'F', 2, 5, 15),
(7, 'playmate', 'M', 1, 4, 10),
(8, 'playmate', 'F', 3, 6, 20),
(9, 'playmate', 'M', 2, 5, 15),
(10, 'playmate', 'F', 1, 4, 10),
(11, 'playmate', 'M', 3, 7, 15),
(12, 'playmate', 'F', 1, 4, 20),
(13, 'playmate', 'M', 2, 6, 10),
(14, 'playmate', 'F', 4, 8, 25),
(15, 'playmate', 'M', 1, 4, 15),
(16, 'playmate', 'F', 3, 6, 10),
(17, 'playmate', 'M', 1, 3, 20),
(18, 'playmate', 'F', 2, 5, 15),
(19, 'playmate', 'M', 3, 7, 10),
(20, 'playmate', 'F', 1, 4, 15),
(21, 'playmate', 'A', 5, 10, 20),
(22, 'playmate', 'M', 2, 6, 15),
(23, 'playmate', 'F', 1, 4, 10),
(24, 'playmate', 'M', 2, 5, 20),
(25, 'playmate', 'F', 3, 8, 15),
(26, 'breeding', 'M', 2, 4, 50),
(27, 'breeding', 'M', 2, 5, 50),
(28, 'breeding', 'F', 1, 3, 40),
(29, 'breeding', 'M', 1, 3, 40),
(30, 'breeding', 'M', 1, 4, 30),
(31, 'breeding', 'F', 2, 5, 30),
(32, 'breeding', 'F', 2, 4, 50),
(33, 'breeding', 'M', 1, 4, 50),
(34, 'breeding', 'F', 1, 3, 40),
(35, 'breeding', 'M', 1, 3, 40),
(36, 'adoption', 'A', 0, 10, 100),
(37, 'adoption', 'A', 0, 10, 100),
(38, 'adoption', 'A', 0, 10, 100),
(39, 'adoption', 'A', 0, 10, 100),
(40, 'adoption', 'A', 0, 10, 100);

-- ============================================
-- SEED SWIPES
-- Strategy: insert all one-sided swipes first,
-- then insert the second side of each mutual pair
-- so the trigger fires only once per match.
-- This keeps match IDs clean: 1,2,3...10
-- ============================================

-- Step 1: First side of each future mutual pair (no match created yet)
INSERT INTO swipes (swiper_cat_id, swiped_cat_id, direction) VALUES
(1, 2, 'right'),   -- pair A
(3, 4, 'right'),   -- pair B
(5, 6, 'right'),   -- pair C
(7, 8, 'right'),   -- pair D
(9, 10, 'right'),  -- pair E
(11, 12, 'right'), -- pair F
(13, 14, 'right'), -- pair G
(15, 16, 'right'), -- pair H
(17, 18, 'right'), -- pair I
(19, 20, 'right'); -- pair J

-- Step 2: One-sided swipes (no reciprocal, no match)
INSERT INTO swipes (swiper_cat_id, swiped_cat_id, direction) VALUES
(1, 3, 'right'),
(1, 5, 'left'),
(2, 4, 'right'),
(3, 5, 'left'),
(4, 6, 'right'),
(5, 7, 'right'),
(6, 8, 'left'),
(7, 9, 'right'),
(8, 10, 'right'),
(9, 11, 'left');

-- Step 3: Second side of each mutual pair — trigger fires here, creating matches 1-10
INSERT INTO swipes (swiper_cat_id, swiped_cat_id, direction) VALUES
(2, 1, 'right'),   -- creates match 1  (cats 1,2)
(4, 3, 'right'),   -- creates match 2  (cats 3,4)
(6, 5, 'right'),   -- creates match 3  (cats 5,6)
(8, 7, 'right'),   -- creates match 4  (cats 7,8)
(10, 9, 'right'),  -- creates match 5  (cats 9,10)
(12, 11, 'right'), -- creates match 6  (cats 11,12)
(14, 13, 'right'), -- creates match 7  (cats 13,14)
(16, 15, 'right'), -- creates match 8  (cats 15,16)
(18, 17, 'right'), -- creates match 9  (cats 17,18)
(20, 19, 'right'); -- creates match 10 (cats 19,20)

-- ============================================
-- SEED VENUES (10)
-- ============================================
INSERT INTO venues (name, address, city, capacity, hourly_rate, contact_email, contact_phone) VALUES
('Purrfect Paws Cafe', '123 Cat Street', 'New York', 8, 25.00, 'info@purrfectpaws.com', '+1-555-1001'),
('Meow Manor Park', '456 Feline Avenue', 'New York', 12, 20.00, 'bookings@meowmanor.com', '+1-555-1002'),
('Whiskers Lounge', '789 Kitty Lane', 'New York', 6, 30.00, 'reservations@whiskerslounge.com', '+1-555-1003'),
('Cat Haven Playroom', '321 Pet Plaza', 'New York', 10, 22.00, 'info@cathaven.com', '+1-555-1004'),
('Feline Friends Center', '654 Animal Way', 'New York', 15, 18.00, 'hello@felinefriends.com', '+1-555-1005'),
('Kitty Sanctuary Garden', '987 Garden Road', 'Brooklyn', 20, 15.00, 'reservations@kittygarden.com', '+1-555-1006'),
('Paws & Brew Coffee', '234 Brew Avenue', 'Manhattan', 8, 28.00, 'contact@pawsbrew.com', '+1-555-1007'),
('Felinity Lounge', '567 Luxury Lane', 'Manhattan', 5, 35.00, 'vip@felinitylounge.com', '+1-555-1008'),
('Sunny Paws Park', '890 Park Drive', 'Queens', 18, 16.00, 'info@sunnypawspark.com', '+1-555-1009'),
('Cat Cafe Serenity', '111 Calm Street', 'Bronx', 12, 19.00, 'peace@catcafeserenity.com', '+1-555-1010');

-- ============================================
-- SEED MESSAGES (20 messages)
-- Now using correct match IDs: 1-10
-- sender_id must be owner of one of the cats in that match
-- ============================================
INSERT INTO messages (match_id, sender_id, content, sent_at) VALUES
-- match 1: cats 1(owner 1) & 2(owner 2)
(1, 1, 'Hi! Whiskers would love to meet Luna!', NOW() - INTERVAL '2 hours'),
(1, 2, 'That sounds great! Luna is very friendly.', NOW() - INTERVAL '1 hour 50 minutes'),
(1, 1, 'Should we meet at a cat cafe?', NOW() - INTERVAL '1 hour 30 minutes'),
(1, 2, 'Perfect idea!', NOW() - INTERVAL '1 hour'),
-- match 2: cats 3(owner 3) & 4(owner 4)
(2, 3, 'Mittens is excited to meet Shadow!', NOW() - INTERVAL '3 hours'),
(2, 4, 'Shadow is a bit shy but warms up fast.', NOW() - INTERVAL '2 hours 30 minutes'),
-- match 3: cats 5(owner 5) & 6(owner 6)
(3, 5, 'Bella is very playful, hope Oliver can keep up!', NOW() - INTERVAL '4 hours'),
(3, 6, 'Oliver loves energy, they will get along great!', NOW() - INTERVAL '3 hours 30 minutes'),
-- match 4: cats 7(owner 7) & 8(owner 8)
(4, 7, 'Chloe has unique ears, everyone loves them.', NOW() - INTERVAL '5 hours'),
(4, 8, 'Simba is very curious, he will love Chloe.', NOW() - INTERVAL '4 hours 30 minutes'),
-- match 5: cats 9(owner 9) & 10(owner 10)
(5, 9, 'Nala is quite gentle, is Max comfortable with that?', NOW() - INTERVAL '6 hours'),
(5, 10, 'Max might seem unusual but he loves everyone.', NOW() - INTERVAL '5 hours 30 minutes'),
-- match 6: cats 11(owner 11) & 12(owner 12)
(6, 11, 'Lily is a mature lady, hoping Tiger is respectful!', NOW() - INTERVAL '7 hours'),
(6, 12, 'Tiger looks wild but has a sweet personality.', NOW() - INTERVAL '6 hours 30 minutes'),
-- match 7: cats 13(owner 13) & 14(owner 14)
(7, 13, 'Daisy loves being held, is Leo gentle?', NOW() - INTERVAL '8 hours'),
(7, 14, 'Leo is a total teddy bear, no worries!', NOW() - INTERVAL '7 hours 30 minutes'),
-- match 8: cats 15(owner 15) & 16(owner 16)
(8, 15, 'Sophie is talkative, hope Charlie does not mind.', NOW() - INTERVAL '9 hours'),
(8, 16, 'Charlie is very laid-back, he will love the company.', NOW() - INTERVAL '8 hours 30 minutes'),
-- match 9: cats 17(owner 17) & 18(owner 18)
(9, 17, 'Zoe is still learning her manners as a kitten.', NOW() - INTERVAL '10 hours'),
(9, 18, 'Milo is very patient, he is great with kittens.', NOW() - INTERVAL '9 hours 30 minutes');

-- ============================================
-- SEED MEETINGS (5 meetings on matches 1-5)
-- ============================================
INSERT INTO meetings (match_id, venue_id, scheduled_time, duration_hours, total_cost, status) VALUES
(1, 1, NOW() + INTERVAL '1 day', 2, 50.00, 'confirmed'),
(2, 2, NOW() + INTERVAL '2 days', 3, 60.00, 'pending'),
(3, 3, NOW() + INTERVAL '3 days', 2, 60.00, 'confirmed'),
(4, 4, NOW() + INTERVAL '4 days', 2, 44.00, 'pending'),
(5, 5, NOW() + INTERVAL '5 days', 3, 54.00, 'confirmed');

-- ============================================
-- SEED VENUE_BOOKINGS (5)
-- meeting_ids will be 1-5 since sequence was reset
-- ============================================
INSERT INTO venue_bookings (venue_id, meeting_id, time_slot, slots_reserved, status) VALUES
(1, 1, NOW() + INTERVAL '1 day', 2, 'confirmed'),
(2, 2, NOW() + INTERVAL '2 days', 2, 'reserved'),
(3, 3, NOW() + INTERVAL '3 days', 2, 'confirmed'),
(4, 4, NOW() + INTERVAL '4 days', 2, 'reserved'),
(5, 5, NOW() + INTERVAL '5 days', 2, 'confirmed');

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Users' AS table_name, COUNT(*) AS record_count FROM users
UNION ALL SELECT 'Cats', COUNT(*) FROM cats
UNION ALL SELECT 'Photos', COUNT(*) FROM cat_photos
UNION ALL SELECT 'Preferences', COUNT(*) FROM preferences
UNION ALL SELECT 'Swipes', COUNT(*) FROM swipes
UNION ALL SELECT 'Matches', COUNT(*) FROM matches
UNION ALL SELECT 'Messages', COUNT(*) FROM messages
UNION ALL SELECT 'Venues', COUNT(*) FROM venues
UNION ALL SELECT 'Meetings', COUNT(*) FROM meetings
UNION ALL SELECT 'Bookings', COUNT(*) FROM venue_bookings;

-- Quick sanity check on match IDs
SELECT match_id, cat1_id, cat2_id, status FROM matches ORDER BY match_id;