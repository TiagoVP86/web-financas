"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Plus, CreditCard } from "lucide-react"
import { ParcelamentoCard } from "./parcelamento-card"
import { ParcelamentoModal } from "./parcelamento-modal"
import type { ParcelamentoItem } from "@/types/parcelamento"

interface Categoria {
  id: string
  nome: string
}

interface Props {
  initialParcelamentos: ParcelamentoItem[]
  categorias: Categoria[]
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export function ParcelamentosClient({ initialParcelamentos, categorias }: Props) {
  const [items, setItems] = useState(initialParcelamentos)
  const [modalOpen, setModalOpen] = useState(false)

  async function refresh() {
    const res = await fetch("/api/parcelamentos")
    if (res.ok) setItems(await res.json())
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }

  const ativos = items.filter((p) => p.pagas < p.numeroParcelas)
  const concluidos = items.filter((p) => p.pagas >= p.numeroParcelas)
  const totalRestante = ativos.reduce(
    (s, p) => s + (p.valorTotal - p.pagas * p.valorParcela),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Parcelamentos</h1>
          <p className="text-sm text-muted-foreground">
            {ativos.length} ativo{ativos.length !== 1 ? "s" : ""}
            {ativos.length > 0 && (
              <>
                {" · "}
                <span className="text-despesa">{fmt(totalRestante)}</span> a pagar no total
              </>
            )}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-card p-12 text-center ring-1 ring-foreground/10">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CreditCard className="h-6 w-6" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium">Nenhum parcelamento cadastrado</p>
            <p className="text-sm text-muted-foreground">
              Registre compras parceladas para acompanhar o que falta pagar.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="mt-1">
            <Plus className="mr-2 h-4 w-4" />
            Novo parcelamento
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {ativos.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Em andamento</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ativos.map((p) => (
                  <ParcelamentoCard key={p.id} item={p} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}
          {concluidos.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Concluídos</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {concluidos.map((p) => (
                  <ParcelamentoCard key={p.id} item={p} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <ParcelamentoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={refresh}
        categorias={categorias}
      />
    </div>
  )
}
