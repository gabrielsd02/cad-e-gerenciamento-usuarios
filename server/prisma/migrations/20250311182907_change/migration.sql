/*
  Warnings:

  - You are about to drop the column `telephone` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "telephone",
ADD COLUMN     "phone" VARCHAR(30),
ALTER COLUMN "registration_date" SET DEFAULT CURRENT_TIMESTAMP;
