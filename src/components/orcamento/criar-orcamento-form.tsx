"use client"

import { useActionState, useEffect, useRef } from "react"
import { criarOrcamento } from "@/actions/orcamento"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, Plus } from "lucide-react"

interface Categoria {
  id: string
  nome: string
}

interface Props {
  categorias: Categoria[]
  mes: number
  ano: number
}

const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]

export function CriarOrcamentoForm({ categorias, mes, ano }: Props) {
  const [state, action, pending] = useActionState(criarOrcamento, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state && "success" in state) formRef.current?.reset()
  }, [state])

  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4 space-y-3">
      <p className="text-sm font-medium">Adicionar orçamento — {meses[mes - 1]} {ano}</p>
      <form ref={formRef} action={action} className="space-y-3">
        <input type="hidden" name="mes" value={mes} />
        <input type="hidden" name="ano" value={ano} />
        <div className="space-y-1">
          <Label className="text-xs">Categoria (vazio = geral)</Label>
          <div className="relative">
            <select
              name="categoriaId"
              className="h-9 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Geral (todas as despesas)</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Limite (R$)</Label>
          <Input
            name="limite"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            required
          />
        </div>
        {state && "error" in state && (
          <p className="text-xs text-destructive">{state.error}</p>
        )}
        <Button type="submit" disabled={pending} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          {pending ? "Salvando..." : "Adicionar"}
        </Button>
      </form>
    </div>
  )
}
