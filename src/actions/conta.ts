"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { TipoConta } from "@/types/conta"

type State = { error: string } | { success: true } | null

const VALID_TIPOS = new Set<TipoConta>(["CORRENTE", "POUPANCA", "INVESTIMENTO", "CARTAO", "DINHEIRO"])

export async function criarConta(_prev: State, formData: FormData): Promise<State> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const nome = (formData.get("nome") as string)?.trim()
  const tipo = formData.get("tipo") as TipoConta
  const saldoInicial = parseFloat((formData.get("saldoInicial") as string) || "0")
  const cor = (formData.get("cor") as string) || "#6366f1"

  if (!nome) return { error: "Nome obrigatório" }
  if (!VALID_TIPOS.has(tipo)) return { error: "Tipo inválido" }
  if (isNaN(saldoInicial)) return { error: "Saldo inicial inválido" }

  const existing = await db.conta.findFirst({ where: { nome, userId } })
  if (existing) return { error: "Já existe uma conta com esse nome" }

  await db.conta.create({ data: { userId, nome, tipo, saldoInicial, cor } })

  revalidatePath("/contas")
  return { success: true }
}

export async function deletarConta(id: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // Detach lancamentos, then delete conta
  await db.$transaction([
    db.lancamento.updateMany({ where: { contaId: id }, data: { contaId: null } }),
    db.conta.deleteMany({ where: { id, userId: session.user.id } }),
  ])
  revalidatePath("/contas")
}
