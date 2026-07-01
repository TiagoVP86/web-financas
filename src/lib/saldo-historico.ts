import { db } from "@/lib/db"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { acumularSaldo, type SaldoPonto } from "./saldo-historico-calc"

export type { SaldoPonto }

/**
 * Série de saldo acumulado dos últimos 12 meses.
 * - Sem contaId: patrimônio consolidado (todas as contas + todos os lançamentos).
 * - Com contaId: saldo daquela conta (saldoInicial dela + lançamentos com aquele contaId).
 */
export async function computeSaldoHistorico(
  userId: string,
  opts?: { contaId?: string },
): Promise<SaldoPonto[]> {
  const contaId = opts?.contaId
  const now = new Date()

  const historyMonths = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, 11 - i)
    return {
      start: startOfMonth(d),
      end: endOfMonth(d),
      label: format(d, "MMM/yy", { locale: ptBR }),
    }
  })
  const windowStart = historyMonths[0].start

  const contaWhere = contaId ? { id: contaId } : {}
  const lancWhere = contaId ? { contaId } : {}

  const [contasAgg, baseLancs, historyMonthly] = await Promise.all([
    db.conta.aggregate({ _sum: { saldoInicial: true }, where: { userId, ...contaWhere } }),
    db.lancamento.groupBy({
      by: ["tipo"],
      where: { userId, ...lancWhere, data: { lt: windowStart } },
      _sum: { valor: true },
    }),
    Promise.all(
      historyMonths.map(({ start, end }) =>
        db.lancamento.groupBy({
          by: ["tipo"],
          where: { userId, ...lancWhere, data: { gte: start, lte: end } },
          _sum: { valor: true },
        }),
      ),
    ),
  ])

  const base =
    Number(contasAgg._sum.saldoInicial ?? 0) +
    Number(baseLancs.find((r) => r.tipo === "RECEITA")?._sum.valor ?? 0) -
    Number(baseLancs.find((r) => r.tipo === "DESPESA")?._sum.valor ?? 0)

  const meses = historyMonths.map(({ label }, i) => {
    const rows = historyMonthly[i]
    return {
      label,
      linha: {
        receitas: Number(rows.find((r) => r.tipo === "RECEITA")?._sum.valor ?? 0),
        despesas: Number(rows.find((r) => r.tipo === "DESPESA")?._sum.valor ?? 0),
      },
    }
  })

  return acumularSaldo(base, meses)
}
