-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "parent_course_id" INTEGER;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_parent_course_id_fkey" FOREIGN KEY ("parent_course_id") REFERENCES "courses"("course_id") ON DELETE SET NULL ON UPDATE CASCADE;
