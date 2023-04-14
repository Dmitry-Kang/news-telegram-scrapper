/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `text` on the `Post` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Post_text_key";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "text",
ADD COLUMN     "text" JSONB NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Post_title_key" ON "Post"("title");
