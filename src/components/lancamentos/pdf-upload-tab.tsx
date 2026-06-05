"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { criarLancamento } from "@/actions/lancamentos"
import { toast } from "sonner"
import { Upload, Loader2 } from "lucide-react"
import type { ExtractedBill } from "@/lib/groq"

interface Categoria {
  id: string
  nome: string
}

interface PdfUploadTabProps {
  categorias: Categoria[]
  onSuccess: () => void
}

export function PdfUploadTab({ categorias, onSuccess }: PdfUploadTabProps) {
  const [loading, setLoading] = useState(false)
  const [extracted, setExtracted] = useState<ExtractedBill | null>(null)
  const [pdfUrl, setPdfUrl] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: form })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Erro no upload")
        return
      }
      const data = await res.json()
      setExtracted(data.extracted)
      setPdfUrl(data.pdfUrl)
      toast.success("PDF processado! Revise e confirme.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao processar PDF")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(formData: FormData) {
    formData.append("pdfUrl", pdfUrl)
    const result = await criarLancamento(formData)
    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success("Lançamento criado!")
    setExtracted(null)
    setPdfUrl("")
    onSuccess()
  }

  if (!extracted) {
    return (
      <div className="space-y-4">
        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {loading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Processando PDF com IA...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Clique ou arraste um PDF aqui</p>
              <p className="text-xs text-muted-foreground">Máximo 10MB</p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleUpload}
        />
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Dados extraídos pelo Gemini — revise antes de salvar:
      </p>

      <div className="space-y-1">
        <Label>Descrição</Label>
        <Input name="descricao" defaultValue={extracted.descricao} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Valor (R$)</Label>
          <Input
            name="valor"
            type="number"
            step="0.01"
            defaultValue={extracted.valor ?? ""}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Vencimento</Label>
          <Input name="data" type="date" defaultValue={extracted.data ?? ""} required />
        </div>
      </div>

      <input type="hidden" name="tipo" value="DESPESA" />
      <input type="hidden" name="status" value="PENDENTE" />

      {extracted.codigoBarras && (
        <div className="space-y-1">
          <Label>Código de Barras</Label>
          <Input name="codigoBarras" defaultValue={extracted.codigoBarras} />
        </div>
      )}

      {extracted.chavePix && (
        <div className="space-y-1">
          <Label>Chave PIX</Label>
          <Input name="chavePix" defaultValue={extracted.chavePix} />
        </div>
      )}

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

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => { setExtracted(null); setPdfUrl("") }}
          className="flex-1"
        >
          Voltar
        </Button>
        <Button type="submit" className="flex-1">Confirmar e Salvar</Button>
      </div>
    </form>
  )
}
