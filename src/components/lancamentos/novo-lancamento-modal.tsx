"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { buttonVariants } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ManualFormTab } from "./manual-form-tab"
import { PdfUploadTab } from "./pdf-upload-tab"

interface Categoria {
  id: string
  nome: string
}

interface NovoLancamentoModalProps {
  categorias: Categoria[]
}

export function NovoLancamentoModal({ categorias }: NovoLancamentoModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
      <DialogTrigger className={buttonVariants()}>
        <Plus className="mr-2 h-4 w-4" />
        Novo Lançamento
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Lançamento</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="manual">
          <TabsList className="w-full">
            <TabsTrigger value="manual" className="flex-1">Manual</TabsTrigger>
            <TabsTrigger value="pdf" className="flex-1">Upload PDF</TabsTrigger>
          </TabsList>
          <TabsContent value="manual" className="mt-4">
            <ManualFormTab categorias={categorias} onSuccess={() => setOpen(false)} />
          </TabsContent>
          <TabsContent value="pdf" className="mt-4">
            <PdfUploadTab categorias={categorias} onSuccess={() => setOpen(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
