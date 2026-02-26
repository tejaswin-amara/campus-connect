-- V1__Initial_Schema.sql
-- Security remediated schema based on Zero-Trust audit

-- 1. Users table; VARCHAR(255) accommodates BCrypt (60 chars) and any future encoder (e.g. DelegatingPasswordEncoder, Argon2)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    email VARCHAR(254) UNIQUE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Events table with robust URL lengths
CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date_time DATETIME NOT NULL,
    end_date_time DATETIME,
    venue VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    registration_link VARCHAR(1000),
    max_capacity INT,
    CONSTRAINT chk_max_capacity_positive CHECK (max_capacity > 0),
    image_url VARCHAR(1000),
    responses_link VARCHAR(1000)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Registrations with UNIQUE constraint to prevent race condition duplicates
-- NOTE: ON DELETE CASCADE is intentional for simplicity in early development.
-- Deleting a user or event removes all associated registrations permanently.
-- Application-layer audit logging (SecurityAuditLogger) compensates for the
-- lack of soft deletes. Revisit if data retention / analytics requirements grow.
CREATE TABLE IF NOT EXISTS registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'INTERESTED',
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    CONSTRAINT uk_user_event UNIQUE (user_id, event_id),
    CONSTRAINT fk_registration_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_registration_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
