"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown } from "lucide-react"
import type { CriarParcelamentoBody } from "@/types/parcelamento"

interface Categoria {
  id: string
  nome: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  categorias: Categoria[]
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const today = () => new Date().toISOString().split("T")[0]

export function ParcelamentoModal({ open, onClose, onSaved, categorias }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [valorTotal, setValorTotal] = useState("")
  const [parcelas, setParcelas] = useState("12")

  useEffect(() => {
    if (!open) {
      setError("")
      setValorTotal("")
      setParcelas("12")
    }
  }, [open])

  const valorParcelaPreview =
    parseFloat(valorTotal) > 0 && parseInt(parcelas) >= 2
      ? parseFloat(valorTotal) / parseInt(parcelas)
      : null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const fd = new FormData(e.currentTarget)
    const body: CriarParcelamentoBody = {
      descricao: fd.get("descricao") as string,
      valorTotal: parseFloat(fd.get("valorTotal") as string),
      numeroParcelas: parseInt(fd.get("numeroParcelas") as string),
      dataInicio: fd.get("dataInicio") as string,
      categoriaId: (fd.get("categoriaId") as string) || null,
    }

    try {
      const res = await fetch("/api/parcelamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar")
        return
      }
      onSaved()
      onClose()
    } catch {
      setError("Falha na conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Parcelamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Descrição</Label>
            <Input name="descricao" placeholder="Ex: iPhone 16 Pro" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Valor total (R$)</Label>
              <Input
                name="valorTotal"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={valorTotal}
                onChange={(e) => setValorTotal(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Parcelas</Label>
              <Input
                name="numeroParcelas"
                type="number"
                min="2"
                max="360"
                value={parcelas}
                onChange={(e) => setParcelas(e.target.value)}
                required
              />
            </div>
          </div>

          {valorParcelaPreview && (
            <p className="text-xs text-muted-foreground">
              {parcelas}x {fmt(valorParcelaPreview)} por mês
            </p>
          )}

          <div className="space-y-1">
            <Label>Data da primeira parcela</Label>
            <Input name="dataInicio" type="date" defaultValue={today()} required />
          </div>

          <div className="space-y-1">
            <Label>Categoria (opcional)</Label>
            <div className="relative">
              <select
                name="categoriaId"
                className="h-9 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Sem categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Criar parcelamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
