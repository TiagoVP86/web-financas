"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Pencil, Trash2, Pause, Play } from "lucide-react"
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
    if (!confirm(`Excluir "${r.descricao}"? Os lançamentos já gerados não serão removidos.`)) return
    setLoading(true)
    await fetch(`/api/recorrencias/${r.id}`, { method: "DELETE" })
    setLoading(false)
    onRefresh()
  }

  async function handleToggle() {
    setLoading(true)
    await fetch(`/api/recorrencias/${r.id}/toggle`, { method: "POST" })
    setLoading(false)
    onRefresh()
  }

  const parcelas = r.totalParcelas
    ? `Parcela ${r.parcelaAtual}/${r.totalParcelas}`
    : "Indefinida"

  return (
    <Card className={r.ativa ? "" : "opacity-50"}>
      <CardContent className="pt-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium truncate">{r.descricao}</p>
            <p className={`text-lg font-bold ${r.tipo === "RECEITA" ? "text-green-500" : "text-red-500"}`}>
              {fmt(r.valor)}
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 text-xs">
            {FREQUENCIA_LABEL[r.frequencia]}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{parcelas}</span>
          <span>
            Próxima: {format(new Date(r.proximaGeracao), "dd/MM/yyyy", { locale: ptBR })}
          </span>
        </div>

        {r.categoriaNome && (
          <div className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: r.categoriaCor ?? "#94a3b8" }}
            />
            <span className="text-xs text-muted-foreground">{r.categoriaNome}</span>
          </div>
        )}

        <div className="flex items-center gap-1 pt-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(r)} disabled={loading}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleToggle} disabled={loading}>
            {r.ativa
              ? <Pause className="h-3.5 w-3.5" />
              : <Play className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
