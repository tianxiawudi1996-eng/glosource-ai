-- Migration: store ToS and data-processing consent timestamps
-- Addresses legal requirement to record explicit consent at point of signup

ALTER TABLE users ADD COLUMN IF NOT EXISTS tos_consent_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_consent_at TIMESTAMP;
