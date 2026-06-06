-- CreateEnum
CREATE TYPE "Frequencia" AS ENUM ('SEMANAL', 'QUINZENAL', 'MENSAL', 'ANUAL');

-- AlterTable
ALTER TABLE "Lancamento" ADD COLUMN     "recorrenciaId" TEXT;

-- CreateTable
CREATE TABLE "Recorrencia" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "tipo" "Tipo" NOT NULL,
    "frequencia" "Frequencia" NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "mes" INTEGER,
    "categoriaId" TEXT,
    "totalParcelas" INTEGER,
    "parcelaAtual" INTEGER NOT NULL DEFAULT 0,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "proximaGeracao" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recorrencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recorrencia_userId_idx" ON "Recorrencia"("userId");

-- CreateIndex
CREATE INDEX "Recorrencia_userId_ativa_proximaGeracao_idx" ON "Recorrencia"("userId", "ativa", "proximaGeracao");

-- AddForeignKey
ALTER TABLE "Lancamento" ADD CONSTRAINT "Lancamento_recorrenciaId_fkey" FOREIGN KEY ("recorrenciaId") REFERENCES "Recorrencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recorrencia" ADD CONSTRAINT "Recorrencia_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recorrencia" ADD CONSTRAINT "Recorrencia_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
