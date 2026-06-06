-- CreateTable
CREATE TABLE "AnaliseExtrato" (
    "id" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "arquivoUrl" TEXT,
    "resumo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnaliseExtrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransacaoExtrato" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "tipo" "Tipo" NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "categoriaId" TEXT,
    "categoriaNova" TEXT,
    "importado" BOOLEAN NOT NULL DEFAULT false,
    "lancamentoId" TEXT,
    "analiseId" TEXT NOT NULL,

    CONSTRAINT "TransacaoExtrato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnaliseExtrato_userId_idx" ON "AnaliseExtrato"("userId");

-- CreateIndex
CREATE INDEX "TransacaoExtrato_analiseId_idx" ON "TransacaoExtrato"("analiseId");

-- AddForeignKey
ALTER TABLE "AnaliseExtrato" ADD CONSTRAINT "AnaliseExtrato_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransacaoExtrato" ADD CONSTRAINT "TransacaoExtrato_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransacaoExtrato" ADD CONSTRAINT "TransacaoExtrato_analiseId_fkey" FOREIGN KEY ("analiseId") REFERENCES "AnaliseExtrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;
