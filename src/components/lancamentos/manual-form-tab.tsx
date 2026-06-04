"use client"

import { criarLancamento } from "@/actions/lancamentos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRef } from "react"
import { toast } from "sonner"

interface Categoria {
  id: string
  nome: string
}

interface ManualFormTabProps {
  categorias: Categoria[]
  onSuccess: () => void
}

export function ManualFormTab({ categorias, onSuccess }: ManualFormTabProps) {
  const ref = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    const result = await criarLancamento(formData)
    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success("Lançamento criado!")
    ref.current?.reset()
    onSuccess()
  }

  return (
    <form ref={ref} action={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>Descrição</Label>
        <Input name="descricao" placeholder="Ex: Conta de Luz" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Valor (R$)</Label>
          <Input name="valor" type="number" step="0.01" min="0.01" placeholder="0,00" required />
        </div>
        <div className="space-y-1">
          <Label>Data</Label>
          <Input
            name="data"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Tipo</Label>
          <select
            name="tipo"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            required
          >
            <option value="DESPESA">Despesa</option>
            <option value="RECEITA">Receita</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>Status</Label>
          <select
            name="status"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            required
          >
            <option value="REALIZADO">Realizado</option>
            <option value="PENDENTE">Pendente</option>
            <option value="PAGO">Pago</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Categoria</Label>
        <select
          name="categoriaId"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">Sem categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label>Código de Barras (opcional)</Label>
        <Input name="codigoBarras" placeholder="Linha digitável" />
      </div>

      <div className="space-y-1">
        <Label>Chave PIX (opcional)</Label>
        <Input name="chavePix" placeholder="CPF, email, telefone ou chave aleatória" />
      </div>

      <Button type="submit" className="w-full">Salvar Lançamento</Button>
    </form>
  )
}
