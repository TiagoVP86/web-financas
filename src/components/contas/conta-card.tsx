import { Building2, PiggyBank, TrendingUp, CreditCard, Banknote } from "lucide-react"
import { cn } from "@/lib/utils"
import { DeleteContaButton } from "./delete-conta-button"
import type { ContaItem, TipoConta } from "@/types/conta"
import { TIPO_CONTA_LABELS } from "@/types/conta"

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

const TIPO_ICONS: Record<TipoConta, React.ElementType> = {
  CORRENTE:     Building2,
  POUPANCA:     PiggyBank,
  INVESTIMENTO: TrendingUp,
  CARTAO:       CreditCard,
  DINHEIRO:     Banknote,
}

const saldoClass = (saldo: number) =>
  saldo > 0 ? "text-receita" : saldo < 0 ? "text-despesa" : "text-muted-foreground"

export function ContaCard({ conta }: { conta: ContaItem }) {
  const Icon = TIPO_ICONS[conta.tipo]

  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: conta.cor }}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{conta.nome}</p>
            <p className="text-xs text-muted-foreground">{TIPO_CONTA_LABELS[conta.tipo]}</p>
          </div>
        </div>
        <DeleteContaButton id={conta.id} nome={conta.nome} />
      </div>

      <div className="border-t border-border/50 pt-3">
        <p className="text-xs text-muted-foreground mb-0.5">Saldo atual</p>
        <p className={cn("text-xl font-bold tabular-nums", saldoClass(conta.saldo))}>
          {fmt(conta.saldo)}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{conta.totalLancamentos} lançamento{conta.totalLancamentos !== 1 ? "s" : ""}</span>
        {conta.saldoInicial !== 0 && (
          <span>Saldo inicial: {fmt(conta.saldoInicial)}</span>
        )}
      </div>
    </div>
  )
}
