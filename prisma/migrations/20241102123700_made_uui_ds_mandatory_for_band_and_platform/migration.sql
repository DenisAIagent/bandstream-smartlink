/*
  Warnings:

  - Made the column `uuid` on table `Band` required. This step will fail if there are existing NULL values in that column.
  - Made the column `uuid` on table `Platform` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Band" ALTER COLUMN "uuid" SET NOT NULL;

-- AlterTable
ALTER TABLE "Platform" ALTER COLUMN "uuid" SET NOT NULL;
