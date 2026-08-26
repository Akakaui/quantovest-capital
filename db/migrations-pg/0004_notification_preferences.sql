-- Add the optional preference document used by the investor notification settings.
-- Safe for existing deployments and harmless when the column already exists.
ALTER TABLE public."users"
  ADD COLUMN IF NOT EXISTS "notificationPrefs" json;
