CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    password VARCHAR(60) NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    date_time DATETIME(6) NOT NULL,
    end_date_time DATETIME(6),
    venue VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    registration_link VARCHAR(1000),
    max_capacity INT,
    image_url VARCHAR(1000),
    responses_link VARCHAR(1000)
);

CREATE TABLE IF NOT EXISTS registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_date DATETIME(6),
    status VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    CONSTRAINT fk_registrations_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) REFERENCES events(id),
    CONSTRAINT uk_registration_user_event UNIQUE (user_id, event_id)
);
