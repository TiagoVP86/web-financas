import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { AnaliseCard } from "@/components/ia/analise-card"
import { gerarAnalise } from "@/actions/ia"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { redirect } from "next/navigation"

export default async function IAPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const analises = await db.analiseIA.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Análise Financeira IA</h1>
          <p className="text-sm text-muted-foreground">
            Powered by Gemini 1.5 Flash — análise dos últimos 3 meses
          </p>
        </div>
        <form action={gerarAnalise as unknown as (formData: FormData) => Promise<void>}>
          <Button type="submit">
            <Sparkles className="mr-2 h-4 w-4" />
            Analisar agora
          </Button>
        </form>
      </div>

      {analises.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhuma análise ainda. Clique em &quot;Analisar agora&quot; para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {analises.map((a, i) => (
            <AnaliseCard key={a.id} analise={a} isLatest={i === 0} />
          ))}
        </div>
      )}
    </div>
  )
}

