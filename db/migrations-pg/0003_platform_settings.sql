CREATE TABLE IF NOT EXISTS "platformSettings" (
  "id" serial PRIMARY KEY,
  "settingKey" varchar(64) NOT NULL,
  "settingValue" json NOT NULL,
  "updatedBy" varchar(191) NOT NULL,
  "updatedAt" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "platform_settings_key_unique" ON "platformSettings" ("settingKey");
