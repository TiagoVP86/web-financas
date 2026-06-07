"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

type State = { error: string } | { success: true } | null

export async function criarOrcamento(_prev: State, formData: FormData): Promise<State> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const categoriaId = (formData.get("categoriaId") as string) || null
  const limite = parseFloat(formData.get("limite") as string)
  const mes = parseInt(formData.get("mes") as string)
  const ano = parseInt(formData.get("ano") as string)

  if (!limite || limite <= 0) return { error: "Limite deve ser maior que zero" }
  if (!mes || mes < 1 || mes > 12) return { error: "Mês inválido" }
  if (!ano || ano < 2000) return { error: "Ano inválido" }

  const existing = await db.orcamento.findFirst({
    where: { userId, categoriaId, mes, ano },
  })
  if (existing) return { error: "Já existe um orçamento para essa categoria nesse mês" }

  await db.orcamento.create({
    data: { userId, categoriaId, limite, mes, ano },
  })

  revalidatePath("/orcamento")
  return { success: true }
}

export async function atualizarLimite(id: string, limite: number): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  await db.orcamento.updateMany({
    where: { id, userId: session.user.id },
    data: { limite },
  })
  revalidatePath("/orcamento")
}

export async function deletarOrcamento(id: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  await db.orcamento.deleteMany({ where: { id, userId: session.user.id } })
  revalidatePath("/orcamento")
}
