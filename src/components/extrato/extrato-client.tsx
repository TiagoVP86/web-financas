"use client"

import { useState } from "react"
import { toast } from "sonner"
import { UploadZone } from "./upload-zone"
import { ExtratoResumoCard } from "./extrato-resumo-card"
import { TransacoesTable } from "./transacoes-table"
import { SenhaPdfDialog } from "./senha-pdf-dialog"
import { CategoryPieChart } from "@/components/relatorios/category-pie-chart"
import { PDF_SENHA_INCORRETA, PDF_SENHA_NECESSARIA } from "@/lib/pdf-password"
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
  // `tentativa` remonta o dialog (limpa o campo) a cada senha errada
  const [senhaPendente, setSenhaPendente] = useState<{
    file: File
    incorreta: boolean
    tentativa: number
  } | null>(null)

  async function handleFile(file: File, senha?: string) {
    setIsUploading(true)
    setUploadError(null)
    setAnalise(null)

    const formData = new FormData()
    formData.append("file", file)
    if (senha) formData.append("senha", senha)

    try {
      const res = await fetch("/api/extrato/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.code === PDF_SENHA_NECESSARIA || data.code === PDF_SENHA_INCORRETA) {
          setSenhaPendente((prev) => ({
            file,
            incorreta: data.code === PDF_SENHA_INCORRETA,
            tentativa: (prev?.tentativa ?? 0) + 1,
          }))
          return
        }
        setSenhaPendente(null)
        setUploadError(data.error ?? "Erro ao analisar extrato.")
        return
      }
      setSenhaPendente(null)
      setAnalise(data as AnaliseExtratoResponse)
    } catch {
      setSenhaPendente(null)
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
      <UploadZone onFile={(file) => handleFile(file)} isLoading={isUploading} />

      {senhaPendente && (
        <SenhaPdfDialog
          key={senhaPendente.tentativa}
          nomeArquivo={senhaPendente.file.name}
          incorreta={senhaPendente.incorreta}
          isLoading={isUploading}
          onSubmit={(senha) => handleFile(senhaPendente.file, senha)}
          onCancel={() => setSenhaPendente(null)}
        />
      )}

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
