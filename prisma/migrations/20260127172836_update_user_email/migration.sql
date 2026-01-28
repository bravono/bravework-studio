/*
  Warnings:

  - The primary key for the `budget_ranges` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `range_label` on the `budget_ranges` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pending_email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "orders_user_category_idx";

-- AlterTable
ALTER TABLE "budget_ranges" DROP CONSTRAINT "budget_ranges_pkey",
DROP COLUMN "range_label";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "pending_email" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "users_pending_email_key" ON "users"("pending_email");

-- AddForeignKey
ALTER TABLE "product_budget_ranges" ADD CONSTRAINT "constraint_1" FOREIGN KEY ("project_category_id") REFERENCES "product_categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
