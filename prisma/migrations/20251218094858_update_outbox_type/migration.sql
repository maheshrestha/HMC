/*
  Warnings:

  - The values [USER_CREAATED] on the enum `OutboxType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `version` to the `outboxEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OutboxType_new" AS ENUM ('USER_CREATED');
ALTER TABLE "outboxEvent" ALTER COLUMN "type" TYPE "OutboxType_new" USING ("type"::text::"OutboxType_new");
ALTER TYPE "OutboxType" RENAME TO "OutboxType_old";
ALTER TYPE "OutboxType_new" RENAME TO "OutboxType";
DROP TYPE "OutboxType_old";
COMMIT;

-- AlterTable
ALTER TABLE "outboxEvent" ADD COLUMN     "version" INTEGER NOT NULL;
