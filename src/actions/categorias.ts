"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  return session.user.id
}

const categoriaSchema = z.object({
  nome:  z.string().min(1).max(30),
  cor:   z.string().regex(/^#[0-9a-fA-F]{6}$/),
  icone: z.string().optional(),
})

export async function criarCategoria(formData: FormData) {
  const userId = await getUserId()
  const parsed = categoriaSchema.safeParse({
    nome:  formData.get("nome"),
    cor:   formData.get("cor"),
    icone: formData.get("icone") || undefined,
  })
  if (!parsed.success) return { error: "Dados inválidos" }

  try {
    await db.categoria.create({ data: { ...parsed.data, userId } })
  } catch {
    return { error: "Categoria já existe" }
  }
  revalidatePath("/configuracoes")
}

export async function deletarCategoria(id: string) {
  const userId = await getUserId()
  await db.categoria.deleteMany({ where: { id, userId } })
  revalidatePath("/configuracoes")
}
