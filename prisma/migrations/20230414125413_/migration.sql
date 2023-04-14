/*
  Warnings:

  - A unique constraint covering the columns `[text]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Post_url_key";

-- CreateIndex
CREATE UNIQUE INDEX "Post_text_key" ON "Post"("text");
