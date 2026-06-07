// src/lib/recorrencia.ts
import { addDays, addMonths, addYears } from "date-fns"
import { db } from "@/lib/db"
import type { Frequencia } from "@/types/recorrencia"

const MAX_GERACOES_POR_RECORRENCIA = 365

export function calcularProximaGeracao(atual: Date, frequencia: Frequencia): Date {
  switch (frequencia) {
    case "SEMANAL":   return addDays(atual, 7)
    case "QUINZENAL": return addDays(atual, 15)
    case "MENSAL":    return addMonths(atual, 1)
    case "ANUAL":     return addYears(atual, 1)
    default: {
      const _: never = frequencia
      throw new Error(`Frequencia desconhecida: ${_}`)
    }
  }
}

export async function gerarLancamentos(userId?: string): Promise<{ gerados: number }> {
  const now = new Date()

  const recorrencias = await db.recorrencia.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ativa: true,
      proximaGeracao: { lte: now },
    },
  })

  let gerados = 0

  for (const rec of recorrencias) {
    let proxima = rec.proximaGeracao
    let parcelaAtual = rec.parcelaAtual
    let iteracoes = 0

    const lancamentosParaCriar: { data: Date }[] = []

    while (
      proxima <= now &&
      (rec.totalParcelas === null || parcelaAtual < rec.totalParcelas) &&
      iteracoes < MAX_GERACOES_POR_RECORRENCIA
    ) {
      lancamentosParaCriar.push({ data: new Date(proxima) })
      parcelaAtual++
      iteracoes++
      proxima = calcularProximaGeracao(proxima, rec.frequencia as Frequencia)
    }

    if (lancamentosParaCriar.length === 0) continue

    await db.$transaction(async (tx) => {
      for (const { data } of lancamentosParaCriar) {
        await tx.lancamento.create({
          data: {
            descricao: rec.descricao,
            valor: rec.valor,
            tipo: rec.tipo,
            data,
            status: "PENDENTE",
            categoriaId: rec.categoriaId ?? null,
            recorrenciaId: rec.id,
            userId: rec.userId,
          },
        })
      }

      await tx.recorrencia.update({
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
    })

    gerados += lancamentosParaCriar.length
  }

  return { gerados }
}
