/*
  Warnings:

  - Changed the type of `type` on the `outboxEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OutboxType" AS ENUM ('USER_CREAATED');

-- AlterTable
ALTER TABLE "outboxEvent" DROP COLUMN "type",
ADD COLUMN     "type" "OutboxType" NOT NULL;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "createdById" DROP NOT NULL,
ALTER COLUMN "updatedById" DROP NOT NULL;
