import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })

  const metas = await db.meta.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(
    metas.map((m) => ({
      id: m.id,
      titulo: m.titulo,
      valorAlvo: Number(m.valorAlvo),
      valorAtual: Number(m.valorAtual),
      prazo: m.prazo?.toISOString() ?? null,
      cor: m.cor,
      createdAt: m.createdAt.toISOString(),
    }))
  )
}
