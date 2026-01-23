/*
  Warnings:

  - The primary key for the `budget_ranges` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `range_label` on the `budget_ranges` table. All the data in the column will be lost.

*/

-- AlterTable
ALTER TABLE "budget_ranges" DROP CONSTRAINT "budget_ranges_pkey",
DROP COLUMN "range_label";

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "fk_course_instructor" FOREIGN KEY ("instructor_id") REFERENCES "instructors"("instructor_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

UPDATE "roles"
SET role_name = 'client'
WHERE role_name = 'customer';