import { NextResponse } from "next/server"
import { gerarLancamentos } from "@/lib/recorrencia"

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

  const { gerados } = await gerarLancamentos()
  return NextResponse.json({ ok: true, gerados, ts: new Date().toISOString() })
}
