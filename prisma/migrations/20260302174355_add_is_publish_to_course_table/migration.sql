/*
  Warnings:

  - The primary key for the `budget_ranges` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `range_label` on the `budget_ranges` table. All the data in the column will be lost.
  - You are about to drop the column `dispute_date` on the `rental_bookings` table. All the data in the column will be lost.
  - You are about to drop the column `dispute_reason` on the `rental_bookings` table. All the data in the column will be lost.
  - You are about to drop the column `dispute_resolved` on the `rental_bookings` table. All the data in the column will be lost.
  - You are about to drop the column `dispute_resolved_at` on the `rental_bookings` table. All the data in the column will be lost.
  - You are about to drop the column `dispute_resolved_by` on the `rental_bookings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "budget_ranges" DROP CONSTRAINT "budget_ranges_pkey",
DROP COLUMN "range_label";

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "is_published" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "rental_bookings" DROP COLUMN "dispute_date",
DROP COLUMN "dispute_reason",
DROP COLUMN "dispute_resolved",
DROP COLUMN "dispute_resolved_at",
DROP COLUMN "dispute_resolved_by";

-- AddForeignKey
ALTER TABLE "product_budget_ranges" ADD CONSTRAINT "constraint_1" FOREIGN KEY ("project_category_id") REFERENCES "product_categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
