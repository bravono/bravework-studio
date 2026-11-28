/*
  Warnings:

  - A unique constraint covering the columns `[category_name]` on the table `course_categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tag_name]` on the table `tags` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `tools` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "course_categories_category_name_key" ON "course_categories"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_tag_name_key" ON "tags"("tag_name");

-- CreateIndex
CREATE UNIQUE INDEX "tools_name_key" ON "tools"("name");
