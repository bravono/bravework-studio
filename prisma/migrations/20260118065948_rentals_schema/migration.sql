/*
  Warnings:

  - The primary key for the `budget_ranges` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `range_label` on the `budget_ranges` table. All the data in the column will be lost.
  - You are about to drop the column `hourly_rate` on the `rentals` table. All the data in the column will be lost.
  - You are about to alter the column `approval_status` on the `rentals` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(20)`.
  - Added the required column `hourly_rate_kobo` to the `rentals` table without a default value. This is not possible if the table is not empty.

*/

-- DropIndex
DROP INDEX IF EXISTS "orders_user_category_idx";

-- AlterTable
ALTER TABLE IF EXISTS "rentals" DROP COLUMN "hourly_rate",
ADD COLUMN     "hourly_rate_kobo" INTEGER NOT NULL,
ALTER COLUMN "approval_status" DROP NOT NULL,
ALTER COLUMN "approval_status" SET DEFAULT 'active',
ALTER COLUMN "approval_status" SET DATA TYPE VARCHAR(20);

-- CreateTable
CREATE TABLE "rental_bookings" (
    "rental_booking_id" SERIAL NOT NULL,
    "rental_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "total_amount_kobo" INTEGER NOT NULL,
    "payment_reference" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "rejection_reason" TEXT,
    "cancellation_reason" TEXT,
    "escrow_released" BOOLEAN DEFAULT false,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(20),
    "payment_status_id" SMALLINT DEFAULT 3,
    "proposed_start_time" TIMESTAMPTZ(6),
    "proposed_end_time" TIMESTAMPTZ(6),

    CONSTRAINT "rental_bookings_pkey" PRIMARY KEY ("rental_booking_id")
);

-- CreateTable
CREATE TABLE "rental_demands" (
    "rental_demand_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "location_lat" DECIMAL(10,8),
    "location_lng" DECIMAL(11,8),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rental_demands_pkey" PRIMARY KEY ("rental_demand_id")
);

-- CreateTable
CREATE TABLE "rental_reviews" (
    "rental_review_id" SERIAL NOT NULL,
    "rental_booking_id" INTEGER NOT NULL,
    "reviewer_id" INTEGER NOT NULL,
    "reviewee_id" INTEGER NOT NULL,
    "rating" INTEGER,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rental_reviews_pkey" PRIMARY KEY ("rental_review_id")
);

-- CreateTable
CREATE TABLE "student_sessions" (
    "student_session_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "session_id" INTEGER NOT NULL,
    "finished" BOOLEAN DEFAULT false,
    "completed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_sessions_pkey" PRIMARY KEY ("student_session_id")
);

-- CreateIndex
CREATE INDEX "idx_student_sessions_finished" ON "student_sessions"("finished");

-- CreateIndex
CREATE INDEX "idx_student_sessions_session_id" ON "student_sessions"("session_id");

-- CreateIndex
CREATE INDEX "idx_student_sessions_user_id" ON "student_sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_sessions_user_id_session_id_key" ON "student_sessions"("user_id", "session_id");

-- AddForeignKey
ALTER TABLE IF EXISTS "payments" ADD CONSTRAINT "constraint_1" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE IF EXISTS "rental_bookings" ADD CONSTRAINT "rental_bookings_rental_id_fkey" FOREIGN KEY ("rental_id") REFERENCES "rentals"("rental_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE IF EXISTS "rental_reviews" ADD CONSTRAINT "rental_reviews_rental_booking_id_fkey" FOREIGN KEY ("rental_booking_id") REFERENCES "rental_bookings"("rental_booking_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE IF EXISTS "student_sessions" ADD CONSTRAINT "student_sessions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("session_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE IF EXISTS "student_sessions" ADD CONSTRAINT "student_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
