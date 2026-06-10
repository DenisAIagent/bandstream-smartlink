/*
  Warnings:

  - You are about to drop the column `published` on the `Band` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Band" DROP COLUMN "published",
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "unpublishedAt" TIMESTAMP(3);
