/*
  Warnings:

  - The `role` column on the `UserBand` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserBandRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "UserBand" DROP COLUMN "role",
ADD COLUMN     "role" "UserBandRole" NOT NULL DEFAULT 'MEMBER';
