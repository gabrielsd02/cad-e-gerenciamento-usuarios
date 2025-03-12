-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(60) NOT NULL,
    "email" VARCHAR(60) NOT NULL,
    "password" VARCHAR(120) NOT NULL,
    "telefone" VARCHAR(30),
    "data_nascimento" DATE,
    "data_cadastro" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" CHAR(1) NOT NULL DEFAULT 'S',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
