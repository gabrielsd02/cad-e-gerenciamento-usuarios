/*
  Warnings:

  - You are about to drop the column `data_birth` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "data_birth",
ADD COLUMN     "date_birth" DATE,
ALTER COLUMN "registration_date" SET DEFAULT CURRENT_TIMESTAMP;
