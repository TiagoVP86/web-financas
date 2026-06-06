"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnaliseExtratoResponse, SelecaoImportar, TransacaoExtratoItem } from "@/types/extrato"

interface TransacoesTableProps {
  transacoes: TransacaoExtratoItem[]
  categorias: AnaliseExtratoResponse["categorias"]
  onImport: (selecoes: SelecaoImportar[]) => void
  isImporting: boolean
}

interface Overrides {
  [transacaoId: string]: {
    categoriaId?: string | null
    categoriaNova?: string | null
  }
}

export function TransacoesTable({
  transacoes,
  categorias,
  onImport,
  isImporting,
}: TransacoesTableProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(transacoes.filter((t) => !t.importado).map((t) => t.id))
  )
  const [overrides, setOverrides] = useState<Overrides>({})

  const disponíveis = transacoes.filter((t) => !t.importado)
  const allSelected = disponíveis.length > 0 && disponíveis.every((t) => selected.has(t.id))

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(disponíveis.map((t) => t.id)))
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function setCategoriaId(transacaoId: string, categoriaId: string) {
    setOverrides((prev) => ({
      ...prev,
      [transacaoId]: { categoriaId, categoriaNova: null },
    }))
  }

  function setCategoriaNova(transacaoId: string, nome: string) {
    setOverrides((prev) => ({
      ...prev,
      [transacaoId]: { categoriaId: null, categoriaNova: nome },
    }))
  }

  function handleImport() {
    const selecoes: SelecaoImportar[] = Array.from(selected).map((id) => {
      const transacao = transacoes.find((t) => t.id === id)!
      const override = overrides[id]
      return {
        transacaoId: id,
        categoriaId: override?.categoriaId ?? transacao.categoriaId,
        categoriaNova: override?.categoriaNova ?? transacao.categoriaNova,
      }
    })
    onImport(selecoes)
  }

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  const selectedCount = Array.from(selected).filter(
    (id) => !transacoes.find((t) => t.id === id)?.importado
  ).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Transações extraídas ({transacoes.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 border-b bg-muted/50">
              <tr>
                <th className="w-10 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Selecionar todas"
                    className="cursor-pointer"
                  />
                </th>
                <th className="px-3 py-2 text-left font-medium">Data</th>
                <th className="px-3 py-2 text-left font-medium">Descrição</th>
                <th className="px-3 py-2 text-right font-medium">Valor</th>
                <th className="px-3 py-2 text-left font-medium min-w-[180px]">Categoria</th>
              </tr>
            </thead>
            <tbody>
              {transacoes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    Nenhuma transação encontrada no extrato.
                  </td>
                </tr>
              )}
              {transacoes.map((t) => {
                const override = overrides[t.id]
                const catId = override?.categoriaId ?? t.categoriaId
                const catNova = override?.categoriaNova ?? t.categoriaNova
                const isNova = !catId && !!catNova

                return (
                  <tr
                    key={t.id}
                    className={cn("border-b last:border-0", t.importado ? "opacity-40" : "hover:bg-muted/20")}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(t.id)}
                        onChange={() => toggle(t.id)}
                        disabled={t.importado}
                        className="cursor-pointer disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                      {format(new Date(t.data), "dd/MM/yy", { locale: ptBR })}
                    </td>
                    <td className="px-3 py-2">
                      <span className={t.tipo === "RECEITA" ? "text-receita" : "text-despesa"}>
                        {t.tipo === "RECEITA" ? "+" : "−"}
                      </span>{" "}
                      {t.descricao}
                      {t.importado && (
                        <Badge variant="secondary" className="ml-2 text-xs">Importado</Badge>
                      )}
                    </td>
                    <td
                      className={cn("px-3 py-2 text-right font-medium whitespace-nowrap", t.tipo === "RECEITA" ? "text-receita" : "text-despesa")}
                    >
                      {fmt(t.valor)}
                    </td>
                    <td className="px-3 py-2">
                      {isNova ? (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs shrink-0">Nova</Badge>
                          <Input
                            value={catNova ?? ""}
                            onChange={(e) => setCategoriaNova(t.id, e.target.value)}
                            className="h-7 text-xs"
                            placeholder="Nome da categoria"
                          />
                        </div>
                      ) : (
                        <Select
                          value={catId ?? "none"}
                          onValueChange={(v) =>
                            v === "none"
                              ? setOverrides((p) => ({ ...p, [t.id]: { categoriaId: null, categoriaNova: null } }))
                              : setCategoriaId(t.id, v!)
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="Sem categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sem categoria</SelectItem>
                            {categorias.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {selectedCount > 0 && (
          <div className="flex justify-end">
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting
                ? "Importando..."
                : `Importar ${selectedCount} lançamento${selectedCount !== 1 ? "s" : ""}`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
