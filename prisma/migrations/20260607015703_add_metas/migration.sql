-- CreateTable
CREATE TABLE "Meta" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "valorAlvo" DECIMAL(12,2) NOT NULL,
    "valorAtual" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "prazo" TIMESTAMP(3),
    "cor" TEXT NOT NULL DEFAULT '#6366f1',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Meta_userId_idx" ON "Meta"("userId");

-- AddForeignKey
ALTER TABLE "Meta" ADD CONSTRAINT "Meta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
