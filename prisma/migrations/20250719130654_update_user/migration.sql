/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('HMC Admin', 'Admin', 'FOH Manager', 'FOH', 'BOH Manager', 'BOH');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_createdById_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "company" DROP CONSTRAINT "company_createdById_fkey";

-- DropForeignKey
ALTER TABLE "company" DROP CONSTRAINT "company_updatedById_fkey";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "userName" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "sub" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "updatedById" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_sub_key" ON "user"("sub");

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
