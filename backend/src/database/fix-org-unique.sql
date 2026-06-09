-- Remove unique constraint on inbound_email to allow
-- multiple organisations without email configured
ALTER TABLE organisations
  DROP CONSTRAINT IF EXISTS organisations_inbound_email_key;
