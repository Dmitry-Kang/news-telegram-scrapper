-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "is_img" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "istochnik" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "video" TEXT[];
