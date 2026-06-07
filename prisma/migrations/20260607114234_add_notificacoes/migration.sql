-- CreateEnum
CREATE TYPE "TipoNotificacao" AS ENUM ('VENCIMENTO_PROXIMO', 'VENCIDO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifDias" INTEGER NOT NULL DEFAULT 3;

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "lancamentoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notificacao_userId_lida_idx" ON "Notificacao"("userId", "lida");

-- CreateIndex
CREATE INDEX "Notificacao_userId_lancamentoId_tipo_idx" ON "Notificacao"("userId", "lancamentoId", "tipo");

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
