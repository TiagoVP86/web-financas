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

export async function marcarComoPago(id: string) {
  const userId = await getUserId()
  await db.lancamento.updateMany({
    where: { id, userId },
    data: { status: "PAGO" },
  })
  revalidatePath("/lancamentos")
  revalidatePath("/dashboard")
}

export async function deletarLancamento(id: string) {
  const userId = await getUserId()
  await db.lancamento.deleteMany({ where: { id, userId } })
  revalidatePath("/lancamentos")
  revalidatePath("/dashboard")
}

const lancamentoSchema = z.object({
  descricao:    z.string().min(1),
  valor:        z.coerce.number().positive(),
  tipo:         z.enum(["RECEITA", "DESPESA"]),
  data:         z.string(),
  status:       z.enum(["PENDENTE", "PAGO", "VENCIDO", "REALIZADO"]),
  codigoBarras: z.string().optional(),
  chavePix:     z.string().optional(),
  categoriaId:  z.string().optional(),
  contaId:      z.string().optional(),
  pdfUrl:       z.string().optional(),
})

export async function criarLancamento(formData: FormData) {
  const userId = await getUserId()
  const parsed = lancamentoSchema.safeParse({
    descricao:    formData.get("descricao"),
    valor:        formData.get("valor"),
    tipo:         formData.get("tipo"),
    data:         formData.get("data"),
    status:       formData.get("status"),
    codigoBarras: formData.get("codigoBarras") || undefined,
    chavePix:     formData.get("chavePix") || undefined,
    categoriaId:  formData.get("categoriaId") || undefined,
    contaId:      formData.get("contaId") || undefined,
    pdfUrl:       formData.get("pdfUrl") || undefined,
  })
  if (!parsed.success) return { error: "Dados inválidos" }

  if (parsed.data.categoriaId) {
    const cat = await db.categoria.findFirst({
      where: { id: parsed.data.categoriaId, userId },
      select: { id: true },
    })
    if (!cat) return { error: "Categoria inválida" }
  }

  if (parsed.data.contaId) {
    const conta = await db.conta.findFirst({ where: { id: parsed.data.contaId, userId }, select: { id: true } })
    if (!conta) return { error: "Conta inválida" }
  }

  await db.lancamento.create({
    data: {
      descricao:    parsed.data.descricao,
      valor:        parsed.data.valor,
      tipo:         parsed.data.tipo,
      data:         new Date(parsed.data.data),
      status:       parsed.data.status,
      codigoBarras: parsed.data.codigoBarras ?? null,
      chavePix:     parsed.data.chavePix ?? null,
      pdfUrl:       parsed.data.pdfUrl ?? null,
      categoriaId:  parsed.data.categoriaId ?? null,
      contaId:      parsed.data.contaId ?? null,
      userId,
    },
  })
  revalidatePath("/lancamentos")
  revalidatePath("/dashboard")
}
