-- Add structured PC spec columns to the rentals table
ALTER TABLE "rentals"
  ADD COLUMN IF NOT EXISTS "ram" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "storage" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "processor" VARCHAR(150),
  ADD COLUMN IF NOT EXISTS "system_type" VARCHAR(10);

