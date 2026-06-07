import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const { id } = await params

  const p = await db.parcelamento.findFirst({ where: { id, userId } })
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await db.$transaction([
    db.lancamento.deleteMany({ where: { parcelamentoId: id } }),
    db.parcelamento.delete({ where: { id } }),
  ])

  return NextResponse.json({ ok: true })
}
