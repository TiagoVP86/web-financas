import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteCategoriaButton } from "@/components/configuracoes/delete-categoria-button"
import { ProfileForm } from "@/components/configuracoes/profile-form"
import { CriarCategoriaForm } from "@/components/configuracoes/criar-categoria-form"
import { UserRound, Tags } from "lucide-react"
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
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie seu perfil e suas categorias.</p>
      </div>

      {/* Perfil */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound className="h-4 w-4" />
          </span>
          <CardTitle className="text-base">Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm name={user?.name ?? ""} />
        </CardContent>
      </Card>

      {/* Categorias */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Tags className="h-4 w-4" />
          </span>
          <CardTitle className="text-base">Categorias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categorias.length === 0 ? (
            <p className="rounded-lg bg-muted/40 px-3 py-6 text-center text-sm text-muted-foreground">
              Nenhuma categoria ainda. Crie a primeira abaixo.
            </p>
          ) : (
            <div className="space-y-2">
              {categorias.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block h-4 w-4 rounded-full ring-1 ring-foreground/15"
                      style={{ background: c.cor }}
                    />
                    <span className="text-sm font-medium">{c.nome}</span>
                  </div>
                  <DeleteCategoriaButton id={c.id} nome={c.nome} />
                </div>
              ))}
            </div>
          )}

          <CriarCategoriaForm />
        </CardContent>
      </Card>
    </div>
  )
}

