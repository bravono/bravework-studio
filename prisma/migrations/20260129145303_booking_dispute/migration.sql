-- AlterTable
ALTER TABLE "rental_bookings" ADD COLUMN     "dispute_date" TIMESTAMPTZ(6),
ADD COLUMN     "dispute_reason" TEXT,
ADD COLUMN     "dispute_resolved" BOOLEAN DEFAULT false,
ADD COLUMN     "dispute_resolved_at" TIMESTAMPTZ(6),
ADD COLUMN     "dispute_resolved_by" INTEGER;
