-- Dyouf Al-Busaraya Intercity Transport Database Schema (PostgreSQL / MySQL)
-- Fleet: 7 Luxury Pullman Coaches between Damascus and Deir ez-Zor (Strictly 50-Passenger Capacity)
-- Coaches Strictly Named: باص رقم 1 سعة 50 راكب إلى باص رقم 7 سعة 50 راكب (No Driver Names or Plates)

CREATE TABLE IF NOT EXISTS coaches (
    coach_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    total_capacity INT DEFAULT 50,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS trips (
    trip_id VARCHAR(50) PRIMARY KEY,
    route VARCHAR(150) NOT NULL,
    departure_date DATE NOT NULL,
    departure_time VARCHAR(20) NOT NULL,
    coach_id INT REFERENCES coaches(coach_id),
    ticket_price NUMERIC(10, 2) DEFAULT 150000.00,
    status VARCHAR(50) DEFAULT 'confirmed',
    cancellation_reason TEXT
);

CREATE TABLE IF NOT EXISTS bookings (
    booking_id VARCHAR(50) PRIMARY KEY,
    passenger_name VARCHAR(200) NOT NULL,
    passenger_phone VARCHAR(50) NOT NULL,
    passenger_nid VARCHAR(50),
    trip_id VARCHAR(50) REFERENCES trips(trip_id),
    coach_id INT REFERENCES coaches(coach_id),
    seat_number INT NOT NULL CHECK (seat_number BETWEEN 1 AND 50),
    sham_cash_code VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
    announcement_id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Settings (Sham Cash Account & Support Number)
INSERT INTO settings (setting_key, setting_value) VALUES
('sham_cash_account', '0998765432'),
('support_phone', '0988123456'),
('sham_cash_qr_url', '/assets/sham_cash_qr.svg')
ON CONFLICT (setting_key) DO NOTHING;

-- Seed Initial 7 Pullman Coaches (Strictly: باص رقم 1 سعة 50 راكب إلى باص رقم 7 سعة 50 راكب)
INSERT INTO coaches (coach_id, name, total_capacity, status) VALUES
(1, 'باص رقم 1 سعة 50 راكب', 50, 'active'),
(2, 'باص رقم 2 سعة 50 راكب', 50, 'active'),
(3, 'باص رقم 3 سعة 50 راكب', 50, 'active'),
(4, 'باص رقم 4 سعة 50 راكب', 50, 'active'),
(5, 'باص رقم 5 سعة 50 راكب', 50, 'active'),
(6, 'باص رقم 6 سعة 50 راكب', 50, 'active'),
(7, 'باص رقم 7 سعة 50 راكب', 50, 'active')
ON CONFLICT (coach_id) DO NOTHING;
