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

export async function realizarTransferencia(_: unknown, formData: FormData) {
  const userId = await getUserId()

  const contaOrigemId = formData.get("contaOrigemId") as string
  const contaDestinoId = formData.get("contaDestinoId") as string
  const valor = parseFloat(formData.get("valor") as string)
  const dataStr = formData.get("data") as string
  const descricao = (formData.get("descricao") as string)?.trim() || "Transferência"

  if (!contaOrigemId || !contaDestinoId) return { error: "Selecione as duas contas." }
  if (contaOrigemId === contaDestinoId) return { error: "Contas de origem e destino devem ser diferentes." }
  if (!valor || valor <= 0) return { error: "Valor deve ser maior que zero." }

  const [origem, destino] = await Promise.all([
    db.conta.findFirst({ where: { id: contaOrigemId, userId }, select: { id: true, nome: true } }),
    db.conta.findFirst({ where: { id: contaDestinoId, userId }, select: { id: true, nome: true } }),
  ])
  if (!origem || !destino) return { error: "Conta inválida." }

  const data = dataStr ? new Date(dataStr + "T12:00:00") : new Date()

  await db.$transaction(async (tx) => {
    const lancOrigem = await tx.lancamento.create({
      data: {
        descricao: `${descricao} → ${destino.nome}`,
        valor,
        tipo: "DESPESA",
        status: "REALIZADO",
        data,
        contaId: contaOrigemId,
        userId,
      },
    })

    const lancDestino = await tx.lancamento.create({
      data: {
        descricao: `${descricao} ← ${origem.nome}`,
        valor,
        tipo: "RECEITA",
        status: "REALIZADO",
        data,
        contaId: contaDestinoId,
        userId,
      },
    })

    await tx.transferencia.create({
      data: {
        userId,
        valor,
        data,
        descricao,
        contaOrigemId,
        contaDestinoId,
        lancamentoOrigemId: lancOrigem.id,
        lancamentoDestinoId: lancDestino.id,
      },
    })
  })

  revalidatePath("/contas")
  revalidatePath("/lancamentos")
  return { success: true }
}

export async function deletarTransferencia(id: string) {
  const userId = await getUserId()

  const t = await db.transferencia.findFirst({
    where: { id, userId },
    select: { lancamentoOrigemId: true, lancamentoDestinoId: true },
  })
  if (!t) return

  await db.$transaction([
    db.lancamento.deleteMany({
      where: { id: { in: [t.lancamentoOrigemId, t.lancamentoDestinoId] }, userId },
    }),
    db.transferencia.delete({ where: { id } }),
  ])

  revalidatePath("/contas")
  revalidatePath("/lancamentos")
}
