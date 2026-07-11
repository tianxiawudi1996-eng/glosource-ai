-- Migration: age confirmation and marketing consent timestamps

ALTER TABLE users ADD COLUMN IF NOT EXISTS age_confirmed_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMP;
