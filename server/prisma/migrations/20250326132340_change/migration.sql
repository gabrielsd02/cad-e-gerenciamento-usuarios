-- AlterTable
ALTER TABLE "user" ALTER COLUMN "registration_date" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "user_test" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "email" VARCHAR(60) NOT NULL,
    "password" VARCHAR(120) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "phone" VARCHAR(30),
    "date_birth" DATE,
    "registration_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" CHAR(1) NOT NULL DEFAULT 'S',

    CONSTRAINT "user_test_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_test_email_key" ON "user_test"("email");
