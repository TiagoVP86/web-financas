"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plus, RefreshCw } from "lucide-react"
import { RecorrenciaCard } from "./recorrencia-card"
import { RecorrenciaModal } from "./recorrencia-modal"
import type { RecorrenciaItem, GerarResponse } from "@/types/recorrencia"

interface Categoria {
  id: string
  nome: string
}

interface Props {
  initialRecorrencias: RecorrenciaItem[]
  categorias: Categoria[]
}

export function RecorrenciasClient({ initialRecorrencias, categorias }: Props) {
  const [recorrencias, setRecorrencias] = useState(initialRecorrencias)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<RecorrenciaItem | undefined>()
  const [gerando, setGerando] = useState(false)

  async function refresh() {
    const res = await fetch("/api/recorrencias")
    if (res.ok) setRecorrencias(await res.json())
  }

  async function handleGerar() {
    setGerando(true)
    try {
      const res = await fetch("/api/recorrencias/gerar", { method: "POST" })
      const data: GerarResponse = await res.json()
      if (!res.ok) {
        toast.error("Erro ao gerar lançamentos")
        return
      }
      toast.success(
        data.gerados === 0
          ? "Nenhum lançamento a gerar no momento"
          : `${data.gerados} lançamento${data.gerados !== 1 ? "s" : ""} gerado${data.gerados !== 1 ? "s" : ""}!`
      )
      await refresh()
    } catch {
      toast.error("Falha na conexão")
    } finally {
      setGerando(false)
    }
  }

  function openCreate() {
    setEditTarget(undefined)
    setModalOpen(true)
  }

  function openEdit(r: RecorrenciaItem) {
    setEditTarget(r)
    setModalOpen(true)
  }

  const ativas = recorrencias.filter((r) => r.ativa)
  const totalMensal = ativas
    .filter((r) => r.frequencia === "MENSAL")
    .reduce((s, r) => s + (r.tipo === "RECEITA" ? r.valor : -r.valor), 0)
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Recorrências</h1>
          <p className="text-sm text-muted-foreground">
            {ativas.length} ativa{ativas.length !== 1 ? "s" : ""} · {recorrencias.length} no total
            {totalMensal !== 0 && (
              <>
                {" · saldo mensal "}
                <span className={totalMensal >= 0 ? "text-receita" : "text-despesa"}>{fmt(totalMensal)}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleGerar} disabled={gerando}>
            <RefreshCw className={cn("mr-2 h-4 w-4", gerando && "animate-spin")} />
            Gerar lançamentos
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova
          </Button>
        </div>
      </div>

      {recorrencias.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-card p-12 text-center ring-1 ring-foreground/10">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <RefreshCw className="h-6 w-6" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium">Nenhuma recorrência cadastrada</p>
            <p className="text-sm text-muted-foreground">Clique em “Nova” para automatizar seus lançamentos.</p>
          </div>
          <Button onClick={openCreate} className="mt-1">
            <Plus className="mr-2 h-4 w-4" />
            Nova recorrência
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recorrencias.map((r) => (
            <RecorrenciaCard
              key={r.id}
              recorrencia={r}
              onEdit={openEdit}
              onRefresh={refresh}
            />
          ))}
        </div>
      )}

      <RecorrenciaModal
        key={editTarget?.id ?? "new"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={refresh}
        recorrencia={editTarget}
        categorias={categorias}
      />
    </div>
  )
}
