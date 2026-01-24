-- DropIndex
DROP INDEX "orders_user_category_idx";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "two_factor_enabled" BOOLEAN DEFAULT false,
ADD COLUMN     "two_factor_secret" VARCHAR(255);
