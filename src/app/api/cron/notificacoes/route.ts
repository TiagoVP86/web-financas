import { NextResponse } from "next/server"
import { gerarNotificacoes } from "@/lib/notificacoes"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 })
  }
  const auth = req.headers ? new Headers(req.headers).get("authorization") : null
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await gerarNotificacoes()
  return NextResponse.json({ ok: true, ts: new Date().toISOString() })
}
