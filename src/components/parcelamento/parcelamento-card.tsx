"use client"

import { cn } from "@/lib/utils"
import { Trash2, CreditCard } from "lucide-react"
import { toast } from "sonner"
import type { ParcelamentoItem } from "@/types/parcelamento"

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

interface Props {
  item: ParcelamentoItem
  onDelete: (id: string) => void
}

export function ParcelamentoCard({ item, onDelete }: Props) {
  const pct = Math.round((item.pagas / item.numeroParcelas) * 100)
  const pendentes = item.numeroParcelas - item.pagas
  const gastas = item.pagas * item.valorParcela
  const restante = item.valorTotal - gastas
  const concluido = item.pagas >= item.numeroParcelas

  async function handleDelete() {
    if (!confirm(`Excluir "${item.descricao}" e todos os lançamentos associados?`)) return
    const res = await fetch(`/api/parcelamentos/${item.id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Parcelamento excluído")
      onDelete(item.id)
    } else {
      toast.error("Erro ao excluir")
    }
  }

  return (
    <div className={cn(
      "rounded-xl bg-card ring-1 ring-foreground/10 p-4 space-y-3",
      concluido && "opacity-70"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <p className="text-sm font-medium truncate">{item.descricao}</p>
          </div>
          {item.categoriaNome && (
            <p className="text-xs text-muted-foreground pl-5">{item.categoriaNome}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {concluido ? (
            <span className="text-xs font-medium text-receita">Concluído</span>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">
              {item.pagas}/{item.numeroParcelas}
            </span>
          )}
          <button
            onClick={handleDelete}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Excluir parcelamento"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", concluido ? "bg-receita" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>{fmt(item.valorParcela)}/mês</span>
          <span className="text-foreground font-medium">{fmt(item.valorTotal)} total</span>
        </div>
        {!concluido && pendentes > 0 && (
          <div className="flex justify-between">
            <span>
              {pendentes} parcela{pendentes !== 1 ? "s" : ""} restante{pendentes !== 1 ? "s" : ""}
            </span>
            <span className="text-despesa font-medium">{fmt(restante)} a pagar</span>
          </div>
        )}
        {!concluido && item.proximaData && (
          <p>Próxima: {fmtDate(item.proximaData)}</p>
        )}
      </div>
    </div>
  )
}
