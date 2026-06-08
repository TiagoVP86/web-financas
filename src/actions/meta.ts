"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  return session.user.id
}

export async function criarMeta(_: unknown, formData: FormData) {
  const userId = await getUserId()

  const titulo = (formData.get("titulo") as string)?.trim()
  const valorAlvo = parseFloat(formData.get("valorAlvo") as string)
  const prazoRaw = formData.get("prazo") as string
  const cor = (formData.get("cor") as string) || "#059669"

  if (!titulo) return { error: "Título obrigatório." }
  if (!valorAlvo || valorAlvo <= 0) return { error: "Valor alvo deve ser maior que zero." }

  const prazo = prazoRaw ? new Date(prazoRaw) : null

  await db.meta.create({
    data: { titulo, valorAlvo, prazo, cor, userId },
  })

  revalidatePath("/metas")
  return { success: true }
}

export async function adicionarProgresso(id: string, valor: number) {
  const userId = await getUserId()

  const meta = await db.meta.findFirst({ where: { id, userId } })
  if (!meta) return

  const novoValor = Math.min(
    Number(meta.valorAtual) + valor,
    Number(meta.valorAlvo)
  )

  await db.meta.update({
    where: { id },
    data: { valorAtual: novoValor },
  })

  revalidatePath("/metas")
}

export async function deletarMeta(id: string) {
  const userId = await getUserId()
  await db.meta.deleteMany({ where: { id, userId } })
  revalidatePath("/metas")
}
