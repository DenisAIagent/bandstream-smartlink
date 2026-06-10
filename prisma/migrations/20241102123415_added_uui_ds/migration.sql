/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `Band` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `Platform` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Band" ADD COLUMN     "uuid" TEXT;

-- AlterTable
ALTER TABLE "Platform" ADD COLUMN     "uuid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Band_uuid_key" ON "Band"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Platform_uuid_key" ON "Platform"("uuid");
