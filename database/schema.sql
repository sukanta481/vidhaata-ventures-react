-- EstateFlow Real Estate + CRM Database Schema
-- MySQL 8.0+ compatible

CREATE DATABASE IF NOT EXISTS estateflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE estateflow;

-- Users table (for CRM agents/admins)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'agent') DEFAULT 'agent',
    phone VARCHAR(50),
    avatar VARCHAR(500),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type ENUM('house', 'apartment', 'condo', 'townhouse', 'land', 'commercial') NOT NULL,
    status ENUM('for_sale', 'for_rent', 'sold', 'pending') DEFAULT 'for_sale',
    price DECIMAL(15, 2) NOT NULL,
    bedrooms INT DEFAULT 0,
    bathrooms DECIMAL(3, 1) DEFAULT 0,
    square_feet INT,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    featured_image VARCHAR(500),
    images JSON,
    amenities JSON,
    agent_id INT,
    is_featured TINYINT(1) DEFAULT 0,
    is_published TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT,
    source ENUM('website', 'referral', 'social_media', 'email', 'phone', 'walk_in') DEFAULT 'website',
    status ENUM('new', 'contacted', 'qualified', 'proposal', 'visit', 'negotiation', 'closed_won', 'closed_lost') DEFAULT 'new',
    property_interest_id INT,
    assigned_agent_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_interest_id) REFERENCES properties(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_agent_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Lead activities / follow-ups
CREATE TABLE IF NOT EXISTS lead_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_id INT NOT NULL,
    activity_type ENUM('note', 'call', 'email', 'meeting', 'task', 'status_change') NOT NULL,
    description TEXT,
    follow_up_date DATETIME NULL,
    property_interest_id INT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (property_interest_id) REFERENCES properties(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert default admin user (password: admin123)
-- Password hash generated with password_hash('admin123', PASSWORD_BCRYPT)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@estateflow.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin');

-- Insert sample properties
INSERT INTO properties (title, description, property_type, status, price, bedrooms, bathrooms, square_feet, address, city, state, zip_code, is_featured, images, amenities) VALUES
('Luxury Modern Villa', 'Stunning modern villa with panoramic ocean views, infinity pool, and smart home technology throughout.', 'house', 'for_sale', 2850000, 5, 4.5, 4500, '123 Ocean Drive', 'Malibu', 'California', '90265', 1, '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]', '["Pool", "Ocean View", "Smart Home", "Wine Cellar", "Home Theater", "Gym"]'),
('Downtown Penthouse Suite', 'Exclusive penthouse in the heart of downtown with 360-degree city views and private rooftop terrace.', 'apartment', 'for_sale', 1850000, 3, 3, 2800, '456 Tower Ave, PH-1', 'Los Angeles', 'California', '90017', 1, '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]', '["Rooftop Terrace", "Concierge", "Private Elevator", "Wine Storage", "City View"]'),
('Cozy Suburban Family Home', 'Beautiful family home in a quiet neighborhood with a large backyard, updated kitchen, and excellent schools nearby.', 'house', 'for_sale', 785000, 4, 3, 2400, '789 Maple Street', 'Pasadena', 'California', '91101', 0, '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800", "https://images.unsplash.com/photo-1556912173-3db996ea8c4b?w=800"]', '["Backyard", "Garage", "Fireplace", "Updated Kitchen", "Near Schools"]'),
('Waterfront Condo', 'Spacious waterfront condo with private dock access, floor-to-ceiling windows, and resort-style amenities.', 'condo', 'for_sale', 1250000, 2, 2, 1800, '321 Marina Blvd, Unit 1502', 'Marina Del Rey', 'California', '90292', 0, '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"]', '["Waterfront", "Private Dock", "Gym", "Pool", "Concierge"]'),
('Modern Office Space', 'Prime commercial office space in the financial district with modern finishes and flexible layout options.', 'commercial', 'for_rent', 8500, 0, 2, 3200, '555 Finance Way, Suite 200', 'San Francisco', 'California', '94104', 0, '["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800", "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"]', '["Conference Rooms", "Reception Area", "Parking", "Elevator Access"]'),
('Historic Brownstone', 'Beautifully restored historic brownstone with original architectural details and modern updates.', 'townhouse', 'for_sale', 1650000, 4, 3.5, 3200, '888 Heritage Row', 'Boston', 'Massachusetts', '02108', 0, '["https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800", "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800"]', '["Historic Details", "Garden", "Wine Cellar", "Library", "Original Fireplace"]'),
('Secluded Mountain Retreat', 'Private mountain home surrounded by nature with breathtaking views, hot tub, and hiking trail access.', 'house', 'for_sale', 950000, 3, 2.5, 2100, '111 Summit Ridge', 'Aspen', 'Colorado', '81611', 1, '["https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800", "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800"]', '["Mountain View", "Hot Tub", "Hiking Access", "Fire Pit", "Decks"]'),
('Urban Loft Apartment', 'Converted industrial loft with exposed brick, high ceilings, and an open-concept living space in the arts district.', 'apartment', 'for_rent', 3200, 1, 1, 1100, '444 Arts District, Unit 3B', 'New York', 'New York', '10013', 0, '["https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]', '["Exposed Brick", "High Ceilings", "Rooftop Access", "Art Gallery", "Fitness Center"]');

-- Insert sample leads
INSERT INTO leads (first_name, last_name, email, phone, message, source, status, property_interest_id, notes) VALUES
('John', 'Smith', 'john.smith@email.com', '555-0123', 'Interested in the Malibu villa. Would like to schedule a viewing this weekend.', 'website', 'new', 1, 'High budget client, pre-approved for $3M'),
('Sarah', 'Johnson', 'sarah.j@email.com', '555-0456', 'Looking for a family home in Pasadena. The Maple Street property looks perfect.', 'website', 'contacted', 3, 'Needs to be near elementary schools'),
('Michael', 'Chen', 'mchen@email.com', '555-0789', 'Interested in the downtown penthouse for investment purposes.', 'referral', 'qualified', 2, 'Cash buyer, investor client'),
('Emily', 'Rodriguez', 'emily.r@email.com', '555-0321', 'Would like more information about the waterfront condo amenities.', 'social_media', 'new', 4, 'First-time buyer, needs financing guidance'),
('David', 'Williams', 'dwilliams@email.com', '555-0654', 'Looking for commercial space for my law firm. The Finance Way location is ideal.', 'website', 'proposal', 5, 'Needs 5-year lease, wants parking included'),
('Lisa', 'Park', 'lisa.park@email.com', '555-0987', 'Interested in the mountain retreat as a vacation home.', 'email', 'contacted', 7, 'Looking for something within 2 hours of Denver'),
('Robert', 'Taylor', 'rtaylor@email.com', '555-0145', 'Would like to see the historic brownstone. Available next week?', 'phone', 'new', 6, 'History enthusiast, values original details'),
('Amanda', 'Garcia', 'amanda.g@email.com', '555-0278', 'The urban loft looks amazing! Is it pet-friendly?', 'website', 'qualified', 8, 'Has a small dog, works from home');
