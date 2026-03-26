-- ==============================================================
--  CampusX Portal — Extended Seed Data (Events + Registrations)
--  Run this script: Get-Content seed_events.sql | mysql -u root -proot campusx
-- ==============================================================

USE campusx;

-- ─────────────────────────────────────────────────────────────
-- NOTE: banner_url, prize_pool, organizer, contact_email columns
-- are added automatically by Hibernate (ddl-auto=update) when
-- the Spring Boot app starts with the updated Event entity.
-- Run this script AFTER starting the app at least once.
-- ─────────────────────────────────────────────────────────────


-- ── Clear old data safely ─────────────────────────────────────
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE activity_log;
TRUNCATE TABLE notifications;
TRUNCATE TABLE certificates;
TRUNCATE TABLE wishlist;
TRUNCATE TABLE registrations;
TRUNCATE TABLE events;
SET FOREIGN_KEY_CHECKS = 1;

-- ── Ensure demo users exist for seeded registrations ──────────
INSERT IGNORE INTO users
  (id, first_name, last_name, email, roll_number, department, year, phone,
   password_hash, avatar_initials, is_active)
VALUES
  (1, 'Arjun', 'Sharma', 'cs22001@college.edu', 'CS22001', 'Computer Science', '2nd Year',
   '+91 98765 43210', 'demo-hash', 'AS', 1),
  (2, 'Bhanu', 'Prasad', 'vtu24464@veltech.edu.in', 'VTU24464', 'Computer Science', '3rd Year',
   NULL, 'demo-hash', 'BP', 1),
  (5, 'Student', 'Five', 'vtu24463@veltech.edu.in', 'VTU24463', 'Electronics', '3rd Year',
   NULL, 'demo-hash', 'SF', 1),
  (7, 'Student', 'Seven', 'vtu24446@veltech.edu.in', 'VTU24446', 'Information Technology', '2nd Year',
   NULL, 'demo-hash', 'S7', 1);

-- ── 12 Diverse Campus Events ──────────────────────────────────
-- Only use columns that exist in the current `events` table.
-- Other fields (registration_fee, payment_required, timestamps)
-- rely on their default values.
INSERT INTO events
  (title, description, category, event_date, venue,
   capacity, seats_filled, status, icon_emoji, is_featured,
   organizer, contact_email, banner_url, prize_pool)
VALUES

-- 1. Technical (filling)
('Annual Tech Symposium 2026',
 'A 2-day conference featuring the latest breakthroughs in AI, Machine Learning, Cloud Computing, and Cybersecurity. Keynotes by industry leaders from Google, Microsoft, and Amazon.',
 'technical', '2026-03-15', 'Main Auditorium',
 300, 245, 'filling', '💻', 1,
 'Tech Club', 'techclub@college.edu',
 '/banners/technical.png', NULL),

-- 2. Hackathon (full)
('24-Hour Hackathon 2026',
 'Build innovative solutions to real-world problems in just 24 hours. Open to all branches. Cash prizes worth ₹1,00,000. Cross-team collaboration encouraged.',
 'hackathon', '2026-04-02', 'Innovation Lab Complex',
 150, 150, 'full', '⚡', 1,
 'CSE Department', 'cse@college.edu',
 '/banners/hackathon.png', '₹1,00,000'),

-- 3. Workshop (open)
('UI/UX Design Masterclass',
 'Intensive hands-on workshop covering user research, wireframing, Figma prototyping, and usability testing. Certificate provided on completion.',
 'workshop', '2026-04-15', 'Design & Media Lab',
 60, 38, 'open', '🎨', 0,
 'Design Society', 'design@college.edu',
 '/banners/workshop.png', NULL),

-- 4. Sports (open)
('Inter-College Sports Meet 2026',
 'Annual inter-college athletic competition featuring track & field, football, cricket, basketball, and badminton. Representing 20+ colleges across the state.',
 'sports', '2026-04-10', 'College Sports Ground',
 500, 310, 'open', '🏆', 1,
 'Sports Committee', 'sports@college.edu',
 '/banners/sports.png', '₹50,000'),

-- 5. Academic (full / past)
('Web Development Bootcamp',
 'Intensive 3-day full-stack bootcamp covering React, Node.js, Express, and MongoDB. Build a production-ready project by the end.',
 'academic', '2026-01-28', 'Computer Lab 3',
 80, 80, 'full', '🌐', 0,
 'IEEE Student Chapter', 'ieee@college.edu',
 '/banners/academic.png', NULL),

-- 6. Academic (open)
('Research Paper Presentation',
 'Present your research paper to a panel of faculty members and industry experts. Best papers will be recommended for IEEE publication.',
 'academic', '2026-05-20', 'Seminar Hall A',
 100, 22, 'open', '📄', 0,
 'Research Cell', 'research@college.edu',
 '/banners/academic.png', NULL),

-- 7. Cultural (open / featured)
('Annual Music & Arts Festival',
 'A vibrant cultural extravaganza featuring live music, classical dance, street art, photography contest, and food stalls from 15+ student clubs.',
 'cultural', '2026-05-12', 'Open Air Theatre',
 800, 540, 'open', '🎵', 1,
 'Student Council', 'council@college.edu',
 '/banners/cultural.png', '₹25,000'),

-- 8. Technical (open)
('AI & Machine Learning Summit',
 'Deep dive into AI research trends with guest speakers from IIT and IISC. Topics include LLMs, Computer Vision, Reinforcement Learning, and MLOps.',
 'technical', '2026-05-05', 'CS Department Auditorium',
 200, 120, 'open', '🤖', 0,
 'AI Club', 'aiclub@college.edu',
 '/banners/technical.png', NULL),

-- 9. Workshop (open / featured)
('Data Science with Python Workshop',
 'Master pandas, NumPy, matplotlib, seaborn, and scikit-learn through hands-on exercises using real-world datasets from healthcare, finance, and sports.',
 'workshop', '2026-03-22', 'Computer Lab 1',
 70, 45, 'open', '📊', 1,
 'Data Science Club', 'ds@college.edu',
 '/banners/workshop.png', NULL),

-- 10. Cultural (open)
('Drama & Theatre Fest',
 'Annual inter-departmental drama competition with one-act plays, mime acts, and stand-up comedy. Audience voting determines the winner. Cash prize ₹50,000.',
 'cultural', '2026-04-25', 'College Amphitheatre',
 400, 180, 'open', '🎭', 0,
 'Cultural Committee', 'cultural@college.edu',
 '/banners/cultural.png', '₹50,000'),

-- 11. Sports (open / featured)
('Intra-College Cricket Tournament',
 'T20 tournament among 16 department teams. Professional umpires, live scoring, and trophies for the top 3 teams. Each team must have 15 players.',
 'sports', '2026-04-18', 'Main Cricket Ground',
 1000, 620, 'open', '🏏', 1,
 'Sports Committee', 'sports@college.edu',
 '/banners/sports.png', '₹75,000'),

-- 12. Hackathon (open)
('Smart Campus IoT Hackathon',
 'Build IoT solutions to make campus life smarter — smart parking, energy monitoring, attendance automation. Raspberry Pi and Arduino kits provided to all teams.',
 'hackathon', '2026-06-07', 'Electronics Lab',
 120, 55, 'open', '📡', 0,
 'ECE Department', 'ece@college.edu',
 '/banners/hackathon.png', '₹80,000');

INSERT INTO registrations (user_id, event_id, phone, status) VALUES
(1,  1, '+91 98765 43210', 'confirmed'),   -- Tech Symposium
(1,  2, '+91 98765 43210', 'confirmed'),   -- Hackathon
(1,  3, '+91 98765 43210', 'pending'),     -- UI/UX Masterclass
(1,  4, '+91 98765 43210', 'confirmed'),   -- Sports Meet
(1,  5, '+91 98765 43210', 'attended'),    -- Web Dev Bootcamp (past)
(1,  6, '+91 98765 43210', 'pending'),     -- Research Presentation
(1,  7, '+91 98765 43210', 'confirmed'),   -- Music & Arts Festival
(1,  8, '+91 98765 43210', 'confirmed'),   -- AI & ML Summit
(1,  9, '+91 98765 43210', 'confirmed'),   -- Data Science Workshop
(1, 10, '+91 98765 43210', 'pending'),     -- Drama & Theatre Fest
(1, 11, '+91 98765 43210', 'confirmed'),   -- Cricket Tournament
(1, 12, '+91 98765 43210', 'pending');     -- IoT Hackathon

-- ── Wishlist ─────────────────────────────────────────────────
INSERT INTO wishlist (user_id, event_id) VALUES
(1,  3), (1,  7), (1,  8), (1, 10), (1, 12);

INSERT INTO certificates (user_id, event_id, certificate_url) VALUES
(1, 5, '/certificates/cs22001_webdev_bootcamp.pdf'),
(5, 4, '/certificates/vtu24463_sports_meet.pdf'),
(7, 2, '/certificates/vtu24446_hackathon.pdf');


-- ── Notifications for demo user ──────────────────────────────
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(1, 'Registration Confirmed',    'Your registration for Annual Tech Symposium 2026 is confirmed!',           'success',  0),
(1, 'Hackathon — You''re In!',   '24-Hour Hackathon 2026 confirmed. Prepare your team!',                     'success',  0),
(1, 'Event Reminder',            'Inter-College Sports Meet starts in 3 days. Venue: College Sports Ground.', 'reminder', 0),
(1, 'Seats Filling Fast!',       'UI/UX Design Masterclass is 63% full. Confirm your spot soon!',            'warning',  0),
(1, 'Certificate Ready!',        'Your Web Dev Bootcamp certificate is ready to download.',                   'info',     1),
(1, 'New Event Added',           'Smart Campus IoT Hackathon opened for registration. Kits included!',        'info',     0),
(1, 'Registration Confirmed',    'You are registered for Annual Music & Arts Festival on 2026-05-12.',        'success',  0),
(1, 'AI Summit Confirmed',       'AI & Machine Learning Summit registration confirmed.',                      'success',  0),
(1, 'Registration Confirmed',    'Data Science with Python Workshop — you are confirmed!',                    'success',  0),
(1, 'Cricket Tournament',        'Intra-College Cricket Tournament registration confirmed. Game on!',          'success',  0);

-- ── Activity Log ─────────────────────────────────────────────
INSERT INTO activity_log (user_id, action_type, description, event_id) VALUES
(1, 'registered',         'Registered for Annual Tech Symposium 2026',        1),
(1, 'registered',         'Registered for 24-Hour Hackathon 2026',             2),
(1, 'wishlist_add',       'Added UI/UX Design Masterclass to wishlist',        3),
(1, 'registered',         'Registered for Inter-College Sports Meet 2026',     4),
(1, 'attended',           'Attended Web Development Bootcamp',                  5),
(1, 'certificate_earned', 'Certificate earned for Web Dev Bootcamp',           5),
(1, 'registered',         'Registered for Annual Music & Arts Festival',       7),
(1, 'wishlist_add',       'Added Annual Music & Arts Festival to wishlist',    7),
(1, 'registered',         'Registered for AI & Machine Learning Summit',       8),
(1, 'wishlist_add',       'Added AI & Machine Learning Summit to wishlist',    8),
(1, 'registered',         'Registered for Data Science with Python Workshop',  9),
(1, 'registered',         'Registered for Drama & Theatre Fest',               10),
(1, 'wishlist_add',       'Added Drama & Theatre Fest to wishlist',            10),
(1, 'registered',         'Registered for Intra-College Cricket Tournament',   11),
(1, 'registered',         'Registered for Smart Campus IoT Hackathon',         12),
(1, 'wishlist_add',       'Added Smart Campus IoT Hackathon to wishlist',      12);
