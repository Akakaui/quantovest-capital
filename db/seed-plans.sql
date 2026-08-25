-- Seed plans with fixed daily ROI percentages
-- Starter: 15% daily, Growth: 25% daily, Elite: 35% daily

INSERT INTO "plans" ("name", "minimumDepositCents", "maximumDepositCents", "minRoiBps", "maxRoiBps", "active")
VALUES
  ('Starter', 150000, 749999, 1500, 1500, 1),
  ('Growth', 750000, 4499999, 2500, 2500, 1),
  ('Elite', 4500000, NULL, 3500, 3500, 1)
ON CONFLICT DO NOTHING;
