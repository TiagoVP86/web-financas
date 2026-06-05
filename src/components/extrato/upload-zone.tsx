"use client"

import { useRef, useState } from "react"
import { Upload, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  onFile: (file: File) => void
  isLoading: boolean
}

const ACCEPT = ".pdf,.ofx,.csv,.jpg,.jpeg,.png,.webp"

export function UploadZone({ onFile, isLoading }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFile(file: File) {
    if (!isLoading) onFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors cursor-pointer",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50",
        isLoading && "opacity-60 cursor-not-allowed"
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => !isLoading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      {isLoading ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">
            Sofia está analisando o extrato...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Arraste o extrato aqui ou clique para selecionar</p>
            <p className="mt-1 text-xs text-muted-foreground">PDF, OFX, CSV, JPG ou PNG — máx 10MB</p>
          </div>
          <div className="flex items-center gap-1 rounded-md border px-3 py-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            Selecionar arquivo
          </div>
        </div>
      )}
    </div>
  )
}
