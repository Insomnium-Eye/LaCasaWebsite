-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_first_name VARCHAR(100) NOT NULL,
  guest_last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  digital_key VARCHAR(50),
  unit_id VARCHAR(50) NOT NULL,
  unit_name VARCHAR(100),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nightly_rate DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed', -- 'confirmed', 'checked_in', 'checked_out', 'cancelled'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cleaning Requests
CREATE TABLE IF NOT EXISTS cleaning_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  notes TEXT,
  fee DECIMAL(10, 2) DEFAULT 15.00,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transport Destinations configuration
CREATE TABLE IF NOT EXISTS transport_destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  emoji VARCHAR(10),
  base_price DECIMAL(10, 2) NOT NULL,
  estimated_duration_minutes INT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transport Requests
CREATE TABLE IF NOT EXISTS transport_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  destination VARCHAR(100) NOT NULL,
  custom_destination TEXT,
  scheduled_at TIMESTAMP NOT NULL,
  passengers INT DEFAULT 1,
  round_trip BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stay Extensions
CREATE TABLE IF NOT EXISTS stay_extensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  requested_checkout DATE NOT NULL,
  extra_nights INT,
  estimated_cost DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cancellation Requests
CREATE TABLE IF NOT EXISTS cancellation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  reason VARCHAR(100),
  explanation TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  stars INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
  headline VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  anonymous BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Review Images
CREATE TABLE IF NOT EXISTS review_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX idx_reservations_email ON reservations(email);
CREATE INDEX idx_reservations_phone ON reservations(phone);
CREATE INDEX idx_reservations_digital_key ON reservations(digital_key);
CREATE INDEX idx_cleaning_requests_reservation_id ON cleaning_requests(reservation_id);
CREATE INDEX idx_transport_requests_reservation_id ON transport_requests(reservation_id);
CREATE INDEX idx_stay_extensions_reservation_id ON stay_extensions(reservation_id);
CREATE INDEX idx_cancellation_requests_reservation_id ON cancellation_requests(reservation_id);
CREATE INDEX idx_reviews_reservation_id ON reviews(reservation_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_review_images_review_id ON review_images(review_id);

-- Insert default transport destinations
INSERT INTO transport_destinations (name, emoji, base_price, estimated_duration_minutes, notes) VALUES
  ('Oaxaca International Airport (OAX)', '✈️', 50.00, 45, 'Base rate for airport transfers'),
  ('ADO Bus Station', '🚌', 12.00, 12, '10–15 min drive'),
  ('Zócalo (Historic Center)', '🌆', 15.00, 15, '15 min drive'),
  ('Llano Park / Parque El Llano', '🛍️', 12.00, 10, '10 min drive'),
  ('Monte Albán', '⛰️', 35.00, 35, '30–35 min, includes wait time'),
  ('Hierve el Agua', '💧', 65.00, 90, '1.5 hrs each way — day-trip quote'),
  ('Popular Restaurants (city center)', '🍽️', 17.50, 15, '15 min average'),
  ('Bars / Mezcalerías (city center)', '🍹', 17.50, 15, '15 min average'),
  ('Mercado Benito Juárez', '🛒', 15.00, 15, '15 min drive'),
  ('Local Services (pharmacy, etc.)', '💈', 12.50, 15, 'Short trips') 
  ON CONFLICT (name) DO NOTHING;
