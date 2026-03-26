-- ============================================================
--  CampusX Portal — MySQL Database Schema (Complete)
-- ============================================================

CREATE DATABASE IF NOT EXISTS campusx CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campusx;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id              INT            NOT NULL AUTO_INCREMENT,
    first_name      VARCHAR(100)   NOT NULL,
    last_name       VARCHAR(100)   NOT NULL DEFAULT '',
    email           VARCHAR(255)   NOT NULL UNIQUE,
    roll_number     VARCHAR(50)    NOT NULL UNIQUE,
    department      VARCHAR(100)   NOT NULL,
    year            VARCHAR(20)    NOT NULL DEFAULT '1st Year',
    phone           VARCHAR(20)    DEFAULT NULL,
    password_hash   VARCHAR(255)   NOT NULL,
    avatar_initials VARCHAR(5)     DEFAULT NULL,
    is_active       TINYINT(1)     NOT NULL DEFAULT 1,
    created_at      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_users_email (email),
    INDEX idx_users_roll  (roll_number)
) ENGINE=InnoDB;

-- 2. EVENTS
CREATE TABLE IF NOT EXISTS events (
    id                  INT            NOT NULL AUTO_INCREMENT,
    title               VARCHAR(255)   NOT NULL,
    description         TEXT           DEFAULT NULL,
    category            VARCHAR(20)    NOT NULL DEFAULT 'technical',
    event_date          DATE           NOT NULL,
    venue               VARCHAR(255)   NOT NULL,
    capacity            INT            NOT NULL DEFAULT 100,
    seats_filled        INT            NOT NULL DEFAULT 0,
    status              VARCHAR(15)    NOT NULL DEFAULT 'open',
    icon_emoji          VARCHAR(10)    DEFAULT '🎓',
    is_featured         TINYINT(1)     NOT NULL DEFAULT 0,
    banner_url          VARCHAR(500)   DEFAULT NULL,
    prize_pool          VARCHAR(100)   DEFAULT NULL,
    organizer           VARCHAR(200)   DEFAULT NULL,
    contact_email       VARCHAR(200)   DEFAULT NULL,
    registration_fee    DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    payment_required    TINYINT(1)     NOT NULL DEFAULT 0,
    created_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_events_category   (category),
    INDEX idx_events_event_date (event_date),
    INDEX idx_events_status     (status)
) ENGINE=InnoDB;

-- 3. REGISTRATIONS
CREATE TABLE IF NOT EXISTS registrations (
    id               INT            NOT NULL AUTO_INCREMENT,
    user_id          INT            NOT NULL,
    event_id         INT            NOT NULL,
    roll_number      VARCHAR(30)    NOT NULL DEFAULT '',
    phone            VARCHAR(20)    DEFAULT NULL,
    status           VARCHAR(15)    NOT NULL DEFAULT 'confirmed',
    payment_status   VARCHAR(30)    NOT NULL DEFAULT 'not_required',
    transaction_id   VARCHAR(120)   DEFAULT NULL,
    amount_paid      DECIMAL(10,2)  DEFAULT NULL,
    payment_screenshot VARCHAR(500) DEFAULT NULL,
    registered_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_event (user_id, event_id),
    CONSTRAINT fk_reg_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_reg_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_reg_status   (status),
    INDEX idx_reg_event_id (event_id)
) ENGINE=InnoDB;

-- 4. WISHLIST
CREATE TABLE IF NOT EXISTS wishlist (
    id       INT       NOT NULL AUTO_INCREMENT,
    user_id  INT       NOT NULL,
    event_id INT       NOT NULL,
    saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_wishlist (user_id, event_id),
    CONSTRAINT fk_wish_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_wish_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. CERTIFICATES
CREATE TABLE IF NOT EXISTS certificates (
    id                  INT            NOT NULL AUTO_INCREMENT,
    user_id             INT            NOT NULL,
    event_id            INT            NOT NULL,
    certificate_url     VARCHAR(500)   DEFAULT NULL,
    participation_type  VARCHAR(30)    NOT NULL DEFAULT 'participation',
    position            VARCHAR(50)    DEFAULT NULL,
    issued_at           TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cert (user_id, event_id),
    CONSTRAINT fk_cert_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_cert_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id         INT          NOT NULL AUTO_INCREMENT,
    user_id    INT          NOT NULL,
    title      VARCHAR(200) NOT NULL,
    message    TEXT         NOT NULL,
    type       VARCHAR(15)  NOT NULL DEFAULT 'info',
    is_read    TINYINT(1)   NOT NULL DEFAULT 0,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user_read (user_id, is_read)
) ENGINE=InnoDB;

-- 7. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
    id          INT        NOT NULL AUTO_INCREMENT,
    sender_id   INT        NOT NULL,
    receiver_id INT        NOT NULL,
    body        TEXT       NOT NULL,
    is_read     TINYINT(1) NOT NULL DEFAULT 0,
    sent_at     TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_msg_sender   FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. ACTIVITY_LOG
CREATE TABLE IF NOT EXISTS activity_log (
    id          INT          NOT NULL AUTO_INCREMENT,
    user_id     INT          NOT NULL,
    action_type VARCHAR(30)  NOT NULL,
    description VARCHAR(500) NOT NULL,
    event_id    INT          DEFAULT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_act_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_act_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
    INDEX idx_act_user (user_id, created_at)
) ENGINE=InnoDB;

-- 9. ADMIN PAYMENT SETTINGS
CREATE TABLE IF NOT EXISTS admin_payment_settings (
    id            INT           NOT NULL DEFAULT 1,
    upi_id        VARCHAR(100)  DEFAULT 'admin@okaxis',
    upi_phone     VARCHAR(20)   DEFAULT '9876543210',
    bank_name     VARCHAR(100)  DEFAULT 'State Bank of India',
    bank_account  VARCHAR(30)   DEFAULT '12345678901',
    ifsc_code     VARCHAR(15)   DEFAULT 'SBIN0001234',
    account_name  VARCHAR(100)  DEFAULT 'COLLEGE ADMIN',
    qr_code_path  VARCHAR(500)  DEFAULT '/banners/payment_qr.png',
    pay_note      VARCHAR(1000) DEFAULT NULL,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT IGNORE INTO admin_payment_settings (id) VALUES (1);
