import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { extractBillFromPdf } from "@/lib/gemini"

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
  const base64 = Buffer.from(arrayBuffer).toString("base64")

  // UUID key prevents path traversal and makes URLs unguessable.
  // TODO: upgrade to access:"private" + signed-URL proxy route for production multi-user deployments.
  const blobKey = `pdfs/${session.user.id}/${crypto.randomUUID()}.pdf`

  const [blob, extracted] = await Promise.all([
    put(blobKey, file, { access: "public" }),
    extractBillFromPdf(base64),
  ])

  return NextResponse.json({ pdfUrl: blob.url, extracted })
}
