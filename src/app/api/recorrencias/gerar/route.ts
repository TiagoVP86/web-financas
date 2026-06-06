import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { gerarLancamentos } from "@/lib/recorrencia"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const result = await gerarLancamentos(session.user.id)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
