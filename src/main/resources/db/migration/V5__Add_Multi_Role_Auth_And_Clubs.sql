-- V5__Add_Multi_Role_Auth_And_Clubs.sql
-- Multi-Role Authentication, Scoped Club Lead Workspaces & Role-Based Access Control (RBAC)

-- 1. Create Clubs Registry
CREATE TABLE IF NOT EXISTS clubs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    logo_url VARCHAR(255),
    lead_user_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clubs_slug (slug),
    INDEX idx_clubs_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Enhance Users Table for RBAC & Club Affiliation
ALTER TABLE users 
    MODIFY COLUMN role VARCHAR(30) NOT NULL DEFAULT 'ROLE_STUDENT',
    ADD COLUMN club_id BIGINT NULL,
    ADD COLUMN roll_number VARCHAR(50) NULL,
    ADD COLUMN department VARCHAR(100) NULL,
    ADD CONSTRAINT fk_users_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL,
    ADD INDEX idx_users_role (role),
    ADD INDEX idx_users_club_id (club_id),
    ADD INDEX idx_users_roll_number (roll_number);

-- 3. Enhance Events Table for Club Scoping & Status Life-Cycle
ALTER TABLE events
    ADD COLUMN club_id BIGINT NULL,
    MODIFY COLUMN status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    ADD CONSTRAINT fk_events_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL,
    ADD INDEX idx_events_club_id (club_id),
    ADD INDEX idx_events_status (status);

-- 4. Enhance Registrations for Live Check-In Telemetry
ALTER TABLE registrations
    ADD COLUMN checked_in BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN check_in_time TIMESTAMP NULL,
    ADD COLUMN ticket_code VARCHAR(64) NULL,
    ADD INDEX idx_registrations_check_in (checked_in),
    ADD UNIQUE INDEX uq_registrations_ticket_code (ticket_code);

-- 5. Deterministic Seed Data for Testing & Local Orchestration
INSERT INTO clubs (id, name, slug, category, description, logo_url) VALUES
(1, 'ACM Student Chapter', 'acm-klh', 'Technical', 'Official Association for Computing Machinery student chapter.', '/images/clubs/acm.png'),
(2, 'GDSC Campus Community', 'gdsc-klh', 'Technical', 'Google Developer Student Clubs chapter fostering community open-source.', '/images/clubs/gdsc.png'),
(3, 'Viwentiaa Cultural Society', 'viwentiaa', 'Cultural', 'Campus cultural, arts, and music organizing committee.', '/images/clubs/cultural.png')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Seed Accounts with BCrypt Passwords matching 'password123' ($2a$10$wK1GvQhZqF7C0VwU.4FwxeY3V4cI5e9.N7FkOa8m8yW5fQ2iL4k0O)
INSERT INTO users (username, email, password, role, club_id, department, roll_number)
VALUES 
('organizer', 'organizer@campus.edu', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'ROLE_ORGANIZER', 1, 'Computer Science', 'KLH2024CS001'),
('admin_user', 'admin@campus.edu', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'ROLE_ADMIN', NULL, 'Administration', 'ADMIN001')
ON DUPLICATE KEY UPDATE role=VALUES(role), club_id=VALUES(club_id);

-- Update seed user roles if previously created
UPDATE users SET role = 'ROLE_ORGANIZER', club_id = 1 WHERE email = 'organizer@campus.edu';
UPDATE users SET role = 'ROLE_ADMIN' WHERE email = 'admin@campus.edu';
UPDATE users SET role = 'ROLE_ADMIN' WHERE username = 'admin' AND role = 'ADMIN';
UPDATE users SET role = 'ROLE_STUDENT' WHERE username = 'guest' AND role = 'STUDENT';
