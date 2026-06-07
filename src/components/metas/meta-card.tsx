"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Target, CalendarClock, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adicionarProgresso, deletarMeta } from "@/actions/meta"
import type { MetaItem } from "@/types/meta"

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

interface Props {
  meta: MetaItem
  onDelete: (id: string) => void
  onProgress: (id: string, novoValor: number) => void
}

export function MetaCard({ meta, onDelete, onProgress }: Props) {
  const pct = meta.valorAlvo > 0 ? Math.min((meta.valorAtual / meta.valorAlvo) * 100, 100) : 0
  const concluida = meta.valorAtual >= meta.valorAlvo
  const falta = Math.max(meta.valorAlvo - meta.valorAtual, 0)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [valor, setValor] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleProgresso() {
    const v = parseFloat(valor.replace(",", "."))
    if (!v || v <= 0) return
    setSaving(true)
    try {
      await adicionarProgresso(meta.id, v)
      const novoValor = Math.min(meta.valorAtual + v, meta.valorAlvo)
      onProgress(meta.id, novoValor)
      toast.success("Progresso adicionado")
      setDialogOpen(false)
      setValor("")
    } catch {
      toast.error("Erro ao salvar progresso")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deletarMeta(meta.id)
      toast.success("Meta excluída")
      onDelete(meta.id)
    } catch {
      toast.error("Erro ao excluir meta")
      setDeleting(false)
    }
  }

  return (
    <>
      <div className={cn("rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden", concluida && "opacity-80")}>
        {/* Color bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: meta.cor }} />

        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${meta.cor}20`, color: meta.cor }}
              >
                <Target className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug truncate">{meta.titulo}</p>
                {meta.prazo && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarClock className="h-3 w-3" />
                    {fmtDate(meta.prazo)}
                  </p>
                )}
              </div>
            </div>
            {concluida ? (
              <span className="shrink-0 text-xs font-medium text-receita">Concluída</span>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      disabled={deleting}
                    />
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir meta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      &ldquo;{meta.titulo}&rdquo; será removida permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleDelete}
                    >
                      Excluir meta
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: meta.cor }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">{fmt(meta.valorAtual)}</span>
                {" / "}{fmt(meta.valorAlvo)}
              </span>
              <span className="font-medium" style={{ color: meta.cor }}>
                {Math.round(pct)}%
              </span>
            </div>
          </div>

          {/* Footer */}
          {!concluida && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Faltam <span className="font-medium text-foreground">{fmt(falta)}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-3 w-3" />
                Adicionar
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Adicionar progresso</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Valor poupado (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleProgresso()}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Faltam {fmt(falta)} para concluir a meta.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleProgresso} disabled={saving || !valor}>
              {saving ? "Salvando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
