import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { revalidatePath } from "next/cache"

export default async function EditarLancamentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const { id } = await params

  const lancamento = await db.lancamento.findFirst({
    where: { id, userId },
    include: { categoria: true },
  })
  if (!lancamento) notFound()

  const categorias = await db.categoria.findMany({
    where: { userId },
    orderBy: { nome: "asc" },
  })

  async function atualizar(formData: FormData) {
    "use server"
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    await db.lancamento.updateMany({
      where: { id, userId: session.user.id },
      data: {
        descricao:    formData.get("descricao") as string,
        valor:        parseFloat(formData.get("valor") as string),
        tipo:         formData.get("tipo") as "RECEITA" | "DESPESA",
        data:         new Date(formData.get("data") as string),
        status:       formData.get("status") as "PENDENTE" | "PAGO" | "VENCIDO" | "REALIZADO",
        codigoBarras: (formData.get("codigoBarras") as string) || null,
        chavePix:     (formData.get("chavePix") as string) || null,
        categoriaId:  (formData.get("categoriaId") as string) || null,
      },
    })
    revalidatePath("/lancamentos")
    redirect("/lancamentos")
  }

  return (
    <div className="max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Editar Lançamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={atualizar} className="space-y-4">
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Input name="descricao" defaultValue={lancamento.descricao} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Valor (R$)</Label>
                <Input
                  name="valor"
                  type="number"
                  step="0.01"
                  defaultValue={Number(lancamento.valor)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Data</Label>
                <Input
                  name="data"
                  type="date"
                  defaultValue={lancamento.data.toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tipo</Label>
                <select
                  name="tipo"
                  defaultValue={lancamento.tipo}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="DESPESA">Despesa</option>
                  <option value="RECEITA">Receita</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <select
                  name="status"
                  defaultValue={lancamento.status}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="REALIZADO">Realizado</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="PAGO">Pago</option>
                  <option value="VENCIDO">Vencido</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Categoria</Label>
              <select
                name="categoriaId"
                defaultValue={lancamento.categoriaId ?? ""}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Sem categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Código de Barras</Label>
              <Input name="codigoBarras" defaultValue={lancamento.codigoBarras ?? ""} />
            </div>
            <div className="space-y-1">
              <Label>Chave PIX</Label>
              <Input name="chavePix" defaultValue={lancamento.chavePix ?? ""} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" formAction="">
                <a href="/lancamentos">Cancelar</a>
              </Button>
              <Button type="submit" className="flex-1">Salvar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
