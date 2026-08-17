-- Seed plans with fixed daily ROI percentages
-- Starter: 15% daily, Growth: 25% daily, Elite: 35% daily

INSERT INTO "plans" ("name", "minimumDepositCents", "maximumDepositCents", "minRoiBps", "maxRoiBps", "active")
VALUES
  ('Starter', 50000, 4999999, 1500, 1500, 1),
  ('Growth', 500000, 14999999, 2500, 2500, 1),
  ('Elite', 1500000, NULL, 3500, 3500, 1)
ON CONFLICT DO NOTHING;
