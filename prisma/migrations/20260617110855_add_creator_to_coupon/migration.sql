-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "creator_id" INTEGER;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "fk_coupon_creator" FOREIGN KEY ("creator_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
