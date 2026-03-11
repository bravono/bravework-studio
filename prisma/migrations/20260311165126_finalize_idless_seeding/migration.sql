/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `courses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[course_id,session_number]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "courses_title_key" ON "courses"("title");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_course_id_session_number_key" ON "sessions"("course_id", "session_number");
