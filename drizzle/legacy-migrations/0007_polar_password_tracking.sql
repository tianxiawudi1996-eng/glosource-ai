-- Migration: track Polar.sh auto-provisioned accounts and password-set state
-- Fixes "dead-on-arrival" Polar accounts (paid but never set password because the
-- welcome reset link expired before they clicked it).

ALTER TABLE users ADD COLUMN IF NOT EXISTS polar_provisioned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_set_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_reminder_sent_at TIMESTAMP;
