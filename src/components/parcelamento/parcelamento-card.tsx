"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Trash2, CreditCard } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
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
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/parcelamentos/${item.id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Parcelamento excluído")
      onDelete(item.id)
    } else {
      toast.error("Erro ao excluir")
      setDeleting(false)
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
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  title="Excluir parcelamento"
                  disabled={deleting}
                />
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir parcelamento?</AlertDialogTitle>
                <AlertDialogDescription>
                  &ldquo;{item.descricao}&rdquo; e todos os lançamentos associados serão removidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDelete}
                >
                  Excluir parcelamento
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
