-- ==========================================
-- MIGRATION: Add match_order and city columns to matches table
-- Run this in Supabase SQL Editor if you already have the database created
-- ==========================================

-- Add city column if not exists
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT NULL;

-- Add match_order column if not exists
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS match_order INT DEFAULT NULL;

-- Create unique index for match_order
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_order ON matches(match_order);

-- Update existing matches with order if needed
-- UPDATE matches SET match_order = id::text::int WHERE match_order IS NULL;

-- ==========================================
-- SEED DATA: Real World Cup 2026 Calendar (Guatemala Time)
-- ==========================================
-- This data is loaded via the /api/seed endpoint
-- Run: curl -X POST http://localhost:3000/api/seed
-- Or execute the SQL below manually in Supabase SQL Editor

-- Note: To insert matches manually, first ensure teams are inserted:
-- The teams are defined in lib/seed/teams.ts and inserted automatically via the seed endpoint
