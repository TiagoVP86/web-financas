"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Pencil, Trash2, Pause, Play, CalendarClock, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { toast } from "sonner"
import type { RecorrenciaItem } from "@/types/recorrencia"

const FREQUENCIA_LABEL: Record<string, string> = {
  SEMANAL: "Semanal",
  QUINZENAL: "Quinzenal",
  MENSAL: "Mensal",
  ANUAL: "Anual",
}

interface Props {
  recorrencia: RecorrenciaItem
  onEdit: (r: RecorrenciaItem) => void
  onRefresh: () => void
}

export function RecorrenciaCard({ recorrencia: r, onEdit, onRefresh }: Props) {
  const [loading, setLoading] = useState(false)

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/recorrencias/${r.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      await onRefresh()
    } catch {
      toast.error("Erro ao excluir recorrência")
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle() {
    setLoading(true)
    try {
      const res = await fetch(`/api/recorrencias/${r.id}/toggle`, { method: "POST" })
      if (!res.ok) throw new Error()
      toast.success(r.ativa ? "Recorrência pausada" : "Recorrência ativada")
      await onRefresh()
    } catch {
      toast.error("Erro ao atualizar recorrência")
    } finally {
      setLoading(false)
    }
  }

  const parcelas = r.totalParcelas
    ? `Parcela ${r.parcelaAtual}/${r.totalParcelas}`
    : "Contínua"
  const isReceita = r.tipo === "RECEITA"

  return (
    <Card className={cn("flex flex-col gap-0 transition-shadow duration-150 hover:ring-2 hover:ring-primary/30", !r.ativa && "opacity-60")}>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                isReceita ? "bg-receita/10 text-receita" : "bg-despesa/10 text-despesa"
              )}
            >
              {isReceita ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{r.descricao}</p>
              <p className={cn("text-lg font-bold tabular-nums", isReceita ? "text-receita" : "text-despesa")}>
                {fmt(r.valor)}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {FREQUENCIA_LABEL[r.frequencia]}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-2">
          {r.categoriaNome ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: r.categoriaCor ?? "var(--muted-foreground)" }}
              />
              {r.categoriaNome}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Sem categoria</span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              r.ativa ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", r.ativa ? "bg-primary" : "bg-muted-foreground")} />
            {r.ativa ? "Ativa" : "Pausada"}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" />
            {format(new Date(r.proximaGeracao), "dd/MM/yyyy", { locale: ptBR })}
          </span>
          <span>{parcelas}</span>
        </div>

        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(r)} disabled={loading} className="gap-1.5 px-2.5 text-xs">
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button size="sm" variant="ghost" onClick={handleToggle} disabled={loading} className="gap-1.5 px-2.5 text-xs">
            {r.ativa
              ? <><Pause className="h-3.5 w-3.5" />Pausar</>
              : <><Play className="h-3.5 w-3.5" />Ativar</>}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 px-2.5 text-xs text-destructive hover:text-destructive"
                  disabled={loading}
                />
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir recorrência?</AlertDialogTitle>
                <AlertDialogDescription>
                  &ldquo;{r.descricao}&rdquo; será removida permanentemente. Os lançamentos já gerados não serão removidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDelete}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
