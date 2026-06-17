"use client"

import { criarLancamento } from "@/actions/lancamentos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRef, useState } from "react"
import { toast } from "sonner"

interface Categoria {
  id: string
  nome: string
}

interface Conta {
  id: string
  nome: string
}

interface ManualFormTabProps {
  categorias: Categoria[]
  contas: Conta[]
  onSuccess: () => void
}

interface DuplicateMatch {
  id: string
  descricao: string
  data: string
  valor: number
}

export function ManualFormTab({ categorias, contas, onSuccess }: ManualFormTabProps) {
  const ref = useRef<HTMLFormElement>(null)
  const pendingData = useRef<FormData | null>(null)
  const [duplicatas, setDuplicatas] = useState<DuplicateMatch[] | null>(null)

  async function submit(formData: FormData) {
    const result = await criarLancamento(formData)
    if (result?.duplicateWarning) {
      pendingData.current = formData
      setDuplicatas(result.duplicateWarning)
      return
    }
    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success("Lançamento criado!")
    ref.current?.reset()
    onSuccess()
  }

  async function confirmarForcado() {
    const fd = pendingData.current
    setDuplicatas(null)
    if (!fd) return
    fd.set("forcar", "true")
    await submit(fd)
    pendingData.current = null
  }

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  return (
    <>
      <form ref={ref} action={submit} className="space-y-4">
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

        {contas.length > 0 && (
          <div className="space-y-1">
            <Label>Conta</Label>
            <select
              name="contaId"
              className="h-9 w-full appearance-none rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Sem conta</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
        )}

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

      <AlertDialog open={duplicatas !== null} onOpenChange={(o) => !o && setDuplicatas(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Possível lançamento duplicado</AlertDialogTitle>
            <AlertDialogDescription>
              Já existe lançamento parecido. Deseja criar mesmo assim?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {(duplicatas ?? []).map((d) => (
              <li key={d.id}>
                {d.descricao} — {fmt(d.valor)} em {new Date(d.data).toLocaleDateString("pt-BR")}
              </li>
            ))}
          </ul>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarForcado}>Criar mesmo assim</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
