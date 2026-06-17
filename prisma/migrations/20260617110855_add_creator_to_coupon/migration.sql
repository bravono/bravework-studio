/*
  Warnings:

  - You are about to drop the column `processor` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `ram` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `storage` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `system_type` on the `rentals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "creator_id" INTEGER;

-- AlterTable
ALTER TABLE "rentals" DROP COLUMN "processor",
DROP COLUMN "ram",
DROP COLUMN "storage",
DROP COLUMN "system_type";

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "fk_coupon_creator" FOREIGN KEY ("creator_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
