/*
  Warnings:

  - You are about to drop the column `ticketingURL` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Band" ADD COLUMN     "ticketingURL" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "ticketingURL";
