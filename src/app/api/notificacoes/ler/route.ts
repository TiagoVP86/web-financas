import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// Mark all as read
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await db.notificacao.updateMany({
    where: { userId: session.user.id, lida: false },
    data: { lida: true },
  })

  return NextResponse.json({ ok: true })
}
