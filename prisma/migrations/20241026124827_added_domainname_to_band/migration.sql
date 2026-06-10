/*
  Warnings:

  - A unique constraint covering the columns `[domainname]` on the table `Band` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `domainname` to the `Band` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Band" ADD COLUMN     "domainname" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Band_domainname_key" ON "Band"("domainname");
