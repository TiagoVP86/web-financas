// src/components/recorrencias/recorrencia-modal.tsx
"use client"

import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  RecorrenciaItem,
  CriarRecorrenciaBody,
  AtualizarRecorrenciaBody,
  Frequencia,
} from "@/types/recorrencia"

const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
const MESES_NOMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

interface Categoria {
  id: string
  nome: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  recorrencia?: RecorrenciaItem
  categorias: Categoria[]
}

export function RecorrenciaModal({ open, onClose, onSaved, recorrencia, categorias }: Props) {
  const isEdit = !!recorrencia

  const [descricao, setDescricao] = useState(recorrencia?.descricao ?? "")
  const [valor, setValor] = useState(recorrencia ? String(recorrencia.valor) : "")
  const [tipo, setTipo] = useState<"RECEITA" | "DESPESA">(recorrencia?.tipo ?? "DESPESA")
  const [frequencia, setFrequencia] = useState<Frequencia>(recorrencia?.frequencia ?? "MENSAL")
  const [diaVencimento, setDiaVencimento] = useState(recorrencia?.diaVencimento ?? 1)
  const [mes, setMes] = useState(recorrencia?.mes ?? 1)
  const [categoriaId, setCategoriaId] = useState(recorrencia?.categoriaId ?? "")
  const [totalParcelas, setTotalParcelas] = useState(
    recorrencia?.totalParcelas ? String(recorrencia.totalParcelas) : ""
  )
  const [dataInicio, setDataInicio] = useState(() => new Date().toISOString().split("T")[0])
  const [scope, setScope] = useState<"futuros" | "todos">("futuros")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setLoading(true)
    setError(null)

    const base: CriarRecorrenciaBody = {
      descricao,
      valor: parseFloat(valor),
      tipo,
      frequencia,
      diaVencimento,
      mes: frequencia === "ANUAL" ? mes : undefined,
      categoriaId: categoriaId || null,
      totalParcelas: totalParcelas ? parseInt(totalParcelas) : null,
      dataInicio,
    }

    const body: CriarRecorrenciaBody | AtualizarRecorrenciaBody = isEdit
      ? { ...base, scope }
      : base

    const url = isEdit ? `/api/recorrencias/${recorrencia!.id}` : "/api/recorrencias"
    const method = isEdit ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
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
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar recorrência" : "Nova recorrência"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Descrição</Label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Salário, Aluguel, Netflix"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as "RECEITA" | "DESPESA")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECEITA">Receita</SelectItem>
                  <SelectItem value="DESPESA">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Frequência</Label>
              <Select value={frequencia} onValueChange={(v) => setFrequencia(v as Frequencia)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEMANAL">Semanal</SelectItem>
                  <SelectItem value="QUINZENAL">Quinzenal</SelectItem>
                  <SelectItem value="MENSAL">Mensal</SelectItem>
                  <SelectItem value="ANUAL">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {frequencia === "SEMANAL" && (
              <div className="space-y-1">
                <Label>Dia da semana</Label>
                <Select
                  value={String(diaVencimento)}
                  onValueChange={(v) => setDiaVencimento(parseInt(v!))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIAS_SEMANA.map((d, i) => (
                      <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(frequencia === "MENSAL" || frequencia === "ANUAL") && (
              <div className="space-y-1">
                <Label>Dia do mês (1–28)</Label>
                <Input
                  type="number"
                  min={1}
                  max={28}
                  value={diaVencimento}
                  onChange={(e) => setDiaVencimento(Math.min(28, Math.max(1, parseInt(e.target.value) || 1)))}
                />
              </div>
            )}
          </div>

          {frequencia === "ANUAL" && (
            <div className="space-y-1">
              <Label>Mês</Label>
              <Select value={String(mes)} onValueChange={(v) => setMes(parseInt(v!))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MESES_NOMES.map((m, i) => (
                    <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Categoria</Label>
              <Select
                value={categoriaId || "none"}
                onValueChange={(v) => setCategoriaId(v === "none" ? "" : v!)}
              >
                <SelectTrigger><SelectValue placeholder="Sem categoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Parcelas (vazio = indefinido)</Label>
              <Input
                type="number"
                min={1}
                value={totalParcelas}
                onChange={(e) => setTotalParcelas(e.target.value)}
                placeholder="∞"
              />
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-1">
              <Label>Primeira geração em</Label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
          )}

          {isEdit && (
            <div className="space-y-1">
              <Label>Aplicar alterações a</Label>
              <Select value={scope} onValueChange={(v) => setScope(v as "futuros" | "todos")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="futuros">Somente lançamentos futuros</SelectItem>
                  <SelectItem value="todos">Todos os lançamentos pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !descricao.trim() || !valor}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
