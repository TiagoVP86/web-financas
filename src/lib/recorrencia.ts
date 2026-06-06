// src/lib/recorrencia.ts
import { addDays, addMonths, addYears } from "date-fns"
import { db } from "@/lib/db"
import type { Frequencia } from "@/types/recorrencia"

export function calcularProximaGeracao(atual: Date, frequencia: Frequencia): Date {
  switch (frequencia) {
    case "SEMANAL":   return addDays(atual, 7)
    case "QUINZENAL": return addDays(atual, 15)
    case "MENSAL":    return addMonths(atual, 1)
    case "ANUAL":     return addYears(atual, 1)
  }
}

export async function gerarLancamentos(userId: string): Promise<{ gerados: number }> {
  const now = new Date()

  const recorrencias = await db.recorrencia.findMany({
    where: {
      userId,
      ativa: true,
      proximaGeracao: { lte: now },
    },
  })

  let gerados = 0

  for (const rec of recorrencias) {
    let proxima = rec.proximaGeracao
    let parcelaAtual = rec.parcelaAtual

    while (
      proxima <= now &&
      (rec.totalParcelas === null || parcelaAtual < rec.totalParcelas)
    ) {
      await db.lancamento.create({
        data: {
          descricao: rec.descricao,
          valor: rec.valor,
          tipo: rec.tipo,
          data: proxima,
          status: "PENDENTE",
          categoriaId: rec.categoriaId ?? null,
          recorrenciaId: rec.id,
          userId,
        },
      })

      parcelaAtual++
      gerados++
      proxima = calcularProximaGeracao(proxima, rec.frequencia as Frequencia)
    }

    await db.recorrencia.update({
      where: { id: rec.id },
      data: {
        parcelaAtual,
        proximaGeracao: proxima,
        ativa:
          rec.totalParcelas !== null && parcelaAtual >= rec.totalParcelas
            ? false
            : rec.ativa,
      },
    })
  }

  return { gerados }
}
