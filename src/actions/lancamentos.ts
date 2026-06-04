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
