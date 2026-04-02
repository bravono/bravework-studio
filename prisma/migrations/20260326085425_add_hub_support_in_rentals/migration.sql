-- AlterTable
ALTER TABLE "rentals" ADD COLUMN     "is_office" BOOLEAN DEFAULT false,
ADD COLUMN     "is_partner" BOOLEAN DEFAULT false,
ADD COLUMN     "rental_type" VARCHAR(20) DEFAULT 'p2p';
