import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { MetasClient } from "@/components/metas/metas-client"
import type { MetaItem } from "@/types/meta"

export const metadata: Metadata = { title: "Metas" }

export default async function MetasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const metasRaw = await db.meta.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  })

  const metas: MetaItem[] = metasRaw.map((m) => ({
    id: m.id,
    titulo: m.titulo,
    valorAlvo: Number(m.valorAlvo),
    valorAtual: Number(m.valorAtual),
    prazo: m.prazo?.toISOString() ?? null,
    cor: m.cor,
    createdAt: m.createdAt.toISOString(),
  }))

  return <MetasClient initialMetas={metas} />
}
