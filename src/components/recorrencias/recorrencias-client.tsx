"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Recorrências</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleGerar} disabled={gerando}>
            <RefreshCw className={`mr-2 h-4 w-4 ${gerando ? "animate-spin" : ""}`} />
            Gerar lançamentos
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova
          </Button>
        </div>
      </div>

      {recorrencias.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nenhuma recorrência cadastrada. Clique em "Nova" para começar.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
