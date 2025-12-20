-- CreateTable
CREATE TABLE "AuthProcessedEvent" (
    "eventId" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthProcessedEvent_pkey" PRIMARY KEY ("eventId")
);
