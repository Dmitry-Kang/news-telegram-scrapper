/*
  Warnings:

  - You are about to drop the column `lastPost` on the `Site` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSites` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `old` on the `Post` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "UserSites" DROP CONSTRAINT "UserSites_siteid_fkey";

-- DropForeignKey
ALTER TABLE "UserSites" DROP CONSTRAINT "UserSites_userid_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "old",
ADD COLUMN     "old" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Site" DROP COLUMN "lastPost";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UserSites";
