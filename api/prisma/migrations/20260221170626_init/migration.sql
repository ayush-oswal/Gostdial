-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('PENDING', 'SENT', 'ERROR');

-- CreateTable
CREATE TABLE "Calls" (
    "id" SERIAL NOT NULL,
    "to" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "humanNumber" TEXT,
    "transcription" TEXT,
    "status" "CallStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Calls_pkey" PRIMARY KEY ("id")
);
