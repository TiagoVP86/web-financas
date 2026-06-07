-- AlterTable
ALTER TABLE "Lancamento" ADD COLUMN     "parcelamentoId" TEXT;

-- CreateTable
CREATE TABLE "Parcelamento" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorTotal" DECIMAL(10,2) NOT NULL,
    "valorParcela" DECIMAL(10,2) NOT NULL,
    "numeroParcelas" INTEGER NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "categoriaId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parcelamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Parcelamento_userId_idx" ON "Parcelamento"("userId");

-- AddForeignKey
ALTER TABLE "Lancamento" ADD CONSTRAINT "Lancamento_parcelamentoId_fkey" FOREIGN KEY ("parcelamentoId") REFERENCES "Parcelamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcelamento" ADD CONSTRAINT "Parcelamento_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcelamento" ADD CONSTRAINT "Parcelamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
