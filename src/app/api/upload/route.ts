import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { extractBillFromText } from "@/lib/groq"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "PDF only" }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 10MB" }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // UUID key prevents path traversal and makes URLs unguessable.
  const blobKey = `pdfs/${session.user.id}/${crypto.randomUUID()}.pdf`

  try {
    const [blob, parsed] = await Promise.all([
      put(blobKey, file, { access: "public" }),
      pdfParse(buffer),
    ])

    const extracted = await extractBillFromText(parsed.text)
    return NextResponse.json({ pdfUrl: blob.url, extracted })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[upload] error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
