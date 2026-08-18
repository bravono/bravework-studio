/*
  Warnings:

  - The primary key for the `todos` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "todos" DROP CONSTRAINT "fk_todos_projects1";

-- AlterTable
ALTER TABLE "todos" DROP CONSTRAINT "todos_pkey",
ADD COLUMN     "completed_at" TIMESTAMPTZ(6),
ADD COLUMN     "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "is_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "milestone_title" VARCHAR(255),
ADD COLUMN     "position_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET DEFAULT 'pending',
ADD CONSTRAINT "todos_pkey" PRIMARY KEY ("todo_id");

-- CreateTable
CREATE TABLE "todo_attachments" (
    "attachment_id" SERIAL NOT NULL,
    "todo_id" INTEGER NOT NULL,
    "file_name" VARCHAR(255),
    "file_url" TEXT NOT NULL,
    "file_type" VARCHAR(50) NOT NULL,
    "file_size" VARCHAR(45),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "todo_attachments_pkey" PRIMARY KEY ("attachment_id")
);

-- CreateTable
CREATE TABLE "todo_comments" (
    "comment_id" SERIAL NOT NULL,
    "todo_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "todo_comments_pkey" PRIMARY KEY ("comment_id")
);

-- CreateIndex
CREATE INDEX "idx_todo_attachments_todo_id" ON "todo_attachments"("todo_id");

-- CreateIndex
CREATE INDEX "idx_todo_comments_todo_id" ON "todo_comments"("todo_id");

-- CreateIndex
CREATE INDEX "idx_todo_comments_user_id" ON "todo_comments"("user_id");

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "fk_todos_projects1" FOREIGN KEY ("project_id") REFERENCES "orders"("order_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "todo_attachments" ADD CONSTRAINT "todo_attachments_todo_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "todos"("todo_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_comments" ADD CONSTRAINT "todo_comments_todo_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "todos"("todo_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_comments" ADD CONSTRAINT "todo_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
