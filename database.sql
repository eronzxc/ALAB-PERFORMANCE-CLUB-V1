-- ════════════════════════════════════════════════════
--  Alab Performance Club — Database Setup
--  I-run ito sa phpMyAdmin o MySQL CLI
--  mysql -u root -p < database.sql
-- ════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS alab_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE alab_db;

-- ──────────────────────────────────────────────────
--  MEMBERS
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS members (
  id          VARCHAR(20)  PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100),
  phone       VARCHAR(20),
  plan        ENUM('Monthly','Quarterly','Annual') NOT NULL,
  start_date  DATE,
  end_date    DATE,
  join_date   DATE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────────
--  ATTENDANCE
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  member_id   VARCHAR(20)  NOT NULL,
  member_name VARCHAR(100) NOT NULL,
  timestamp   DATETIME     NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- ──────────────────────────────────────────────────
--  PAYMENTS
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id          VARCHAR(20)  PRIMARY KEY,
  member_id   VARCHAR(20)  NOT NULL,
  member_name VARCHAR(100) NOT NULL,
  amount      DECIMAL(10,2) NOT NULL,
  plan        ENUM('Monthly','Quarterly','Annual') NOT NULL,
  date        DATE         NOT NULL,
  method      ENUM('Cash','GCash','Card','Bank Transfer') NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- ──────────────────────────────────────────────────
--  CLASSES
-- ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id        VARCHAR(20)  PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  trainer   VARCHAR(100) NOT NULL,
  day       ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  time      VARCHAR(20)  NOT NULL,
  capacity  INT          NOT NULL DEFAULT 20,
  enrolled  INT          NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ════════════════════════════════════════════════════
--  SAMPLE DATA (Galing sa store.js)
-- ════════════════════════════════════════════════════

INSERT IGNORE INTO members (id, name, email, phone, plan, start_date, end_date, join_date) VALUES
('APC-001', 'Juan dela Cruz',  'juan@email.com',  '09171234567', 'Monthly',   '2026-05-16', '2026-07-16', '2026-01-15'),
('APC-002', 'Maria Santos',    'maria@email.com', '09281234567', 'Quarterly', '2026-03-01', '2026-09-01', '2026-03-01'),
('APC-003', 'Carlo Reyes',     'carlo@email.com', '09391234567', 'Annual',    '2026-01-01', '2027-01-01', '2026-01-01'),
('APC-004', 'Ana Lim',         'ana@email.com',   '09451234567', 'Monthly',   '2026-06-01', '2026-06-24', '2026-02-20'),
('APC-005', 'Rico Manalo',     'rico@email.com',  '09561234567', 'Quarterly', '2026-04-01', '2026-06-20', '2026-04-01');

INSERT IGNORE INTO payments (id, member_id, member_name, amount, plan, date, method) VALUES
('PAY-001', 'APC-001', 'Juan dela Cruz', 1500,  'Monthly',   '2026-06-01', 'Cash'),
('PAY-002', 'APC-002', 'Maria Santos',   4000,  'Quarterly', '2026-06-03', 'GCash'),
('PAY-003', 'APC-003', 'Carlo Reyes',    14000, 'Annual',    '2026-06-10', 'Cash');

INSERT IGNORE INTO classes (id, name, trainer, day, time, capacity, enrolled) VALUES
('CLS-001', 'Power Lifting',       'Coach Bogs', 'Monday',    '6:00 AM',  20, 14),
('CLS-002', 'HIIT Cardio',         'Coach Lea',  'Tuesday',   '7:00 AM',  25, 25),
('CLS-003', 'Yoga Flow',           'Coach Tina', 'Wednesday', '8:00 AM',  15,  8),
('CLS-004', 'Boxing Fundamentals', 'Coach Jojo', 'Thursday',  '5:30 PM',  18, 12),
('CLS-005', 'Functional Training', 'Coach Bogs', 'Friday',    '6:00 AM',  20, 17);
