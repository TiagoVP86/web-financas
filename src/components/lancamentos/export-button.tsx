"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Props {
  exportUrl: string
  filename: string
}

export function ExportButton({ exportUrl, filename }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const res = await fetch(exportUrl)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      toast.success("CSV exportado")
    } catch {
      toast.error("Erro ao exportar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {loading ? "Exportando..." : "Exportar CSV"}
    </Button>
  )
}
