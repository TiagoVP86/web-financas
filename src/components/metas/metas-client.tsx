"use client"

import { useState } from "react"
import { Plus, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MetaCard } from "./meta-card"
import { CriarMetaModal } from "./criar-meta-modal"
import type { MetaItem } from "@/types/meta"

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

interface Props {
  initialMetas: MetaItem[]
}

export function MetasClient({ initialMetas }: Props) {
  const [metas, setMetas] = useState(initialMetas)
  const [modalOpen, setModalOpen] = useState(false)

  function handleDelete(id: string) {
    setMetas((prev) => prev.filter((m) => m.id !== id))
  }

  function handleProgress(id: string, novoValor: number) {
    setMetas((prev) =>
      prev.map((m) => (m.id === id ? { ...m, valorAtual: novoValor } : m))
    )
  }

  async function handleCreated() {
    const res = await fetch("/api/metas")
    if (res.ok) setMetas(await res.json())
  }

  const ativas = metas.filter((m) => m.valorAtual < m.valorAlvo)
  const concluidas = metas.filter((m) => m.valorAtual >= m.valorAlvo)
  const totalAlvo = ativas.reduce((s, m) => s + m.valorAlvo, 0)
  const totalSalvo = ativas.reduce((s, m) => s + m.valorAtual, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Metas</h1>
          <p className="text-sm text-muted-foreground">
            {ativas.length > 0
              ? `${ativas.length} ativa${ativas.length !== 1 ? "s" : ""} · ${fmt(totalSalvo)} de ${fmt(totalAlvo)} poupados`
              : "Defina objetivos de economia com prazo e acompanhe o progresso"}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova meta
        </Button>
      </div>

      {/* Empty state */}
      {metas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-card p-12 text-center ring-1 ring-foreground/10">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Target className="h-6 w-6" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium">Nenhuma meta ainda</p>
            <p className="text-sm text-muted-foreground">
              Crie uma meta para acompanhar seu progresso de economia.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="mt-1">
            <Plus className="mr-2 h-4 w-4" />
            Nova meta
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {ativas.length > 0 && (
            <section className="space-y-3">
              {concluidas.length > 0 && (
                <h2 className="text-sm font-medium text-muted-foreground">Em andamento</h2>
              )}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ativas.map((m) => (
                  <MetaCard
                    key={m.id}
                    meta={m}
                    onDelete={handleDelete}
                    onProgress={handleProgress}
                  />
                ))}
              </div>
            </section>
          )}
          {concluidas.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Concluídas</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {concluidas.map((m) => (
                  <MetaCard
                    key={m.id}
                    meta={m}
                    onDelete={handleDelete}
                    onProgress={handleProgress}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <CriarMetaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
