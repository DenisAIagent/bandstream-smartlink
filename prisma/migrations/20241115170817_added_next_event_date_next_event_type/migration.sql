-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('CONCERT', 'SHOW', 'FESTIVAL');

-- AlterTable
ALTER TABLE "Band" ADD COLUMN     "nextEventDate" TIMESTAMP(3),
ADD COLUMN     "nextEventType" "EventType";
