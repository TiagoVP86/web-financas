import { cn } from "@/lib/utils"
import { Trash2 } from "lucide-react"
import { deletarOrcamento } from "@/actions/orcamento"
import type { OrcamentoItem } from "@/types/orcamento"

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

function barColor(pct: number) {
  if (pct >= 100) return "bg-despesa"
  if (pct >= 80) return "bg-[oklch(var(--alerta))]"
  return "bg-receita"
}

function statusTextClass(pct: number) {
  if (pct >= 100) return "text-despesa"
  if (pct >= 80) return "text-[oklch(var(--alerta))]"
  return "text-receita"
}

export function OrcamentoCard({ item }: { item: OrcamentoItem }) {
  const pctRaw = item.limite > 0 ? (item.gasto / item.limite) * 100 : 0
  const pct = Math.min(pctRaw, 100)
  const pctDisplay = Math.round(pctRaw)
  const restante = item.limite - item.gasto

  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <p className="text-sm font-medium truncate">
            {item.categoriaNome ?? "Geral (todas as despesas)"}
          </p>
          <p className="text-xs text-muted-foreground">
            Limite: {fmt(item.limite)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("text-xs font-medium", statusTextClass(pctDisplay))}>
            {pctDisplay >= 100 ? "Estourado" : pctDisplay >= 80 ? "Atenção" : `${pctDisplay}%`}
          </span>
          <form action={deletarOrcamento.bind(null, item.id)}>
            <button
              type="submit"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Excluir orçamento"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", barColor(pctDisplay))}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Gasto:{" "}
          <span className={cn("font-medium", statusTextClass(pctDisplay))}>{fmt(item.gasto)}</span>
        </span>
        <span>
          {restante >= 0 ? (
            <>Restante: <span className="font-medium text-foreground">{fmt(restante)}</span></>
          ) : (
            <>Excesso: <span className="font-medium text-despesa">{fmt(-restante)}</span></>
          )}
        </span>
      </div>
    </div>
  )
}
