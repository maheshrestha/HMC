/*
  Warnings:

  - You are about to drop the `AuthProcessedEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "AuthProcessedEvent";

-- CreateTable
CREATE TABLE "userProcessedEvent" (
    "id" UUID NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userProcessedEvent_pkey" PRIMARY KEY ("id")
);
