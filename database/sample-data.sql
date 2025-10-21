-- Sample location_currency data for testing FINM
-- Run this AFTER running the main schema.sql

-- Create location_currency table if it doesn't exist (managed by central system)
CREATE TABLE IF NOT EXISTS location_currency (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    country_code VARCHAR(3) UNIQUE NOT NULL, -- ISO 3166-1 alpha-3
    country_name VARCHAR(255) NOT NULL,
    currency_code VARCHAR(3) NOT NULL, -- ISO 4217
    currency_name VARCHAR(255) NOT NULL,
    currency_symbol VARCHAR(10),
    decimal_places INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample location currency data
INSERT INTO location_currency (country_code, country_name, currency_code, currency_name, currency_symbol, decimal_places) 
VALUES 
    ('USA', 'United States', 'USD', 'US Dollar', '$', 2),
    ('CAN', 'Canada', 'CAD', 'Canadian Dollar', 'C$', 2),
    ('GBR', 'United Kingdom', 'GBP', 'British Pound Sterling', '£', 2),
    ('EUR', 'European Union', 'EUR', 'Euro', '€', 2),
    ('AUS', 'Australia', 'AUD', 'Australian Dollar', 'A$', 2),
    ('JPN', 'Japan', 'JPY', 'Japanese Yen', '¥', 0),
    ('CHN', 'China', 'CNY', 'Chinese Yuan', '¥', 2),
    ('IND', 'India', 'INR', 'Indian Rupee', '₹', 2),
    ('SGP', 'Singapore', 'SGD', 'Singapore Dollar', 'S$', 2),
    ('MYS', 'Malaysia', 'MYR', 'Malaysian Ringgit', 'RM', 2)
ON CONFLICT (country_code) DO NOTHING;

-- Note: Organizations and hospitals tables already exist in the database
-- This file just adds sample data to existing tables

-- Add sample data to organizations table (if it exists)
-- If organizations table doesn't exist, these will be ignored
INSERT INTO organizations (platform_id, name, description, country_code, created_by) VALUES
    ('O123456789', 'Furfield Veterinary Group', 'Leading veterinary care provider', 'USA', 'e7b8c9d0-1234-5678-9abc-def012345678'),
    ('OABCDEF123', 'PetCare Networks Inc', 'Multi-location pet healthcare', 'CAN', 'e7b8c9d0-1234-5678-9abc-def012345678'),
    ('OXYZ789ABC', 'Global Pet Solutions', 'International pet care services', 'GBR', 'e7b8c9d0-1234-5678-9abc-def012345678')
ON CONFLICT DO NOTHING;