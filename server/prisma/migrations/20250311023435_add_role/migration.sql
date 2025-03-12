/*
  Warnings:

  - You are about to drop the column `ativo` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `data_cadastro` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `data_nascimento` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `user` table. All the data in the column will be lost.
  - Added the required column `name` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'USER');

-- AlterTable
ALTER TABLE "user" DROP COLUMN "ativo",
DROP COLUMN "data_cadastro",
DROP COLUMN "data_nascimento",
DROP COLUMN "nome",
DROP COLUMN "telefone",
ADD COLUMN     "active" CHAR(1) NOT NULL DEFAULT 'S',
ADD COLUMN     "data_birth" DATE,
ADD COLUMN     "name" VARCHAR(60) NOT NULL,
ADD COLUMN     "registration_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ADD COLUMN     "telephone" VARCHAR(30);
