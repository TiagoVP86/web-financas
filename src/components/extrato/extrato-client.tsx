"use client"

import { useState } from "react"
import { toast } from "sonner"
import { UploadZone } from "./upload-zone"
import { ExtratoResumoCard } from "./extrato-resumo-card"
import { TransacoesTable } from "./transacoes-table"
import { CategoryPieChart } from "@/components/relatorios/category-pie-chart"
import type {
  AnaliseExtratoResponse,
  ImportarResponse,
  SelecaoImportar,
} from "@/types/extrato"

export function ExtratoClient() {
  const [isUploading, setIsUploading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [analise, setAnalise] = useState<AnaliseExtratoResponse | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setIsUploading(true)
    setUploadError(null)
    setAnalise(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/extrato/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setUploadError(data.error ?? "Erro ao analisar extrato.")
        return
      }
      setAnalise(data as AnaliseExtratoResponse)
    } catch {
      setUploadError("Falha na conexão. Tente novamente.")
    } finally {
      setIsUploading(false)
    }
  }

  async function handleImport(selecoes: SelecaoImportar[]) {
    if (!analise) return
    setIsImporting(true)

    try {
      const res = await fetch("/api/extrato/importar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selecoes }),
      })
      const data: ImportarResponse = await res.json()

      if (!res.ok) {
        toast.error("Erro ao importar lançamentos.")
        return
      }

      toast.success(
        `${data.imported} lançamento${data.imported !== 1 ? "s" : ""} importado${data.imported !== 1 ? "s" : ""}!`
      )
      if ((data.errors ?? []).length > 0) {
        toast.warning(`${data.errors.length} não importado(s): ${data.errors.join(", ")}`)
      }

      setAnalise((prev) => {
        if (!prev) return prev
        const importedIds = new Set(selecoes.map((s) => s.transacaoId))
        return {
          ...prev,
          transacoes: prev.transacoes.map((t) =>
            importedIds.has(t.id) ? { ...t, importado: true } : t
          ),
        }
      })
    } catch {
      toast.error("Falha na conexão ao importar.")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <UploadZone onFile={handleFile} isLoading={isUploading} />

      {uploadError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {uploadError}
        </div>
      )}

      {analise && (
        <>
          <ExtratoResumoCard analise={analise} />
          {analise.porCategoria.length > 0 && (
            <CategoryPieChart data={analise.porCategoria} />
          )}
          <TransacoesTable
            transacoes={analise.transacoes}
            categorias={analise.categorias}
            onImport={handleImport}
            isImporting={isImporting}
          />
        </>
      )}
    </div>
  )
}
