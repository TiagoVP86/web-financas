-- CreateTable
CREATE TABLE "Orcamento" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoriaId" TEXT,
    "limite" DECIMAL(10,2) NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orcamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Orcamento_userId_idx" ON "Orcamento"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Orcamento_userId_categoriaId_mes_ano_key" ON "Orcamento"("userId", "categoriaId", "mes", "ano");

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
