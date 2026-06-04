import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { criarCategoria, deletarCategoria } from "@/actions/categorias"
import { atualizarPerfil } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import { redirect } from "next/navigation"

export default async function ConfiguracoesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const [user, categorias] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.categoria.findMany({ where: { userId }, orderBy: { nome: "asc" } }),
  ])

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>

      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={atualizarPerfil as unknown as (formData: FormData) => Promise<void>}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input name="name" defaultValue={user?.name ?? ""} />
            </div>
            <div className="space-y-1">
              <Label>Senha atual (para trocar senha)</Label>
              <Input
                name="currentPassword"
                type="password"
                placeholder="Deixe em branco para não alterar"
              />
            </div>
            <div className="space-y-1">
              <Label>Nova senha</Label>
              <Input
                name="newPassword"
                type="password"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <Button type="submit">Salvar Perfil</Button>
          </form>
        </CardContent>
      </Card>

      {/* Categorias */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Categorias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {categorias.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block h-4 w-4 rounded-full border"
                    style={{ background: c.cor }}
                  />
                  <span className="text-sm">{c.nome}</span>
                </div>
                <form action={deletarCategoria.bind(null, c.id)}>
                  <Button variant="ghost" size="icon" type="submit">
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </form>
              </div>
            ))}
          </div>

          <form
            action={criarCategoria as unknown as (formData: FormData) => Promise<void>}
            className="flex items-end gap-2"
          >
            <div className="flex-1 space-y-1">
              <Label>Nome</Label>
              <Input name="nome" placeholder="Ex: Viagens" required />
            </div>
            <div className="space-y-1">
              <Label>Cor</Label>
              <Input
                name="cor"
                type="color"
                defaultValue="#6366f1"
                className="h-9 w-16 p-1"
                required
              />
            </div>
            <Button type="submit">Adicionar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

