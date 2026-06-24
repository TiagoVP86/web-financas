"use server"

import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { signIn } from "@/lib/auth"
import { redirect } from "next/navigation"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { AuthError } from "next-auth"
import { sendVerificationEmail } from "@/lib/email"

const cadastroSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  })

export async function cadastrar(
  _: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean; emailSent?: boolean }> {
  const parsed = cadastroSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const exists = await db.user.findUnique({ where: { email: parsed.data.email } })
  if (exists) return { error: "Email já cadastrado" }

  const hash = await bcrypt.hash(parsed.data.password, 12)
  const token = crypto.randomUUID()

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hash,
      emailVerified: false,
      verificationToken: token,
    },
  })

  await seedDefaultCategorias(user.id)
  const emailSent = await sendVerificationEmail(
    parsed.data.email,
    parsed.data.name,
    token
  )

  return { success: true, emailSent }
}

export async function reenviarVerificacao(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const parsed = z.string().email().safeParse(email)
  if (!parsed.success) return { success: false, error: "Email inválido" }

  const user = await db.user.findUnique({ where: { email: parsed.data } })
  if (!user || user.emailVerified) {
    // não revela se a conta existe / já está verificada
    return { success: true }
  }

  const token = user.verificationToken ?? crypto.randomUUID()
  if (!user.verificationToken) {
    await db.user.update({ where: { id: user.id }, data: { verificationToken: token } })
  }

  const sent = await sendVerificationEmail(user.email, user.name ?? "", token)
  if (!sent) return { success: false, error: "Não foi possível enviar o email agora" }
  return { success: true }
}

export async function verificarEmail(
  token: string
): Promise<{ success: boolean; error?: string }> {
  if (!token) return { success: false, error: "Token inválido" }

  const user = await db.user.findUnique({ where: { verificationToken: token } })
  if (!user) return { success: false, error: "Link inválido ou já utilizado" }

  // Idempotente: scanners de email corporativo fazem prefetch do link (GET) e
  // consumiriam o token antes do usuário clicar. Mantemos o token e só atualizamos
  // se ainda não verificado, então cliques repetidos continuam retornando sucesso.
  if (!user.emailVerified) {
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    })
  }

  return { success: true }
}

export async function login(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    })
  } catch (e) {
    if (e instanceof AuthError) {
      const cause = e.cause as { err?: Error } | undefined
      if (cause?.err?.message === "EMAIL_NOT_VERIFIED") {
        return { error: "Confirme seu email antes de fazer login" }
      }
      return { error: "Email ou senha incorretos" }
    }
    throw e
  }
  return null
}

export async function atualizarPerfil(
  _prevState: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true } | null> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const name = formData.get("name") as string
  const newPassword = formData.get("newPassword") as string | null
  const currentPassword = formData.get("currentPassword") as string | null

  const updateData: { name?: string; password?: string } = {}

  if (name?.trim()) updateData.name = name.trim()

  if (newPassword && currentPassword) {
    if (newPassword.length < 6) return { error: "Nova senha muito curta" }
    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user) return { error: "Usuário não encontrado" }
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) return { error: "Senha atual incorreta" }
    updateData.password = await bcrypt.hash(newPassword, 12)
  }

  if (Object.keys(updateData).length > 0) {
    await db.user.update({ where: { id: session.user.id }, data: updateData })
  }
  return { success: true }
}

export async function atualizarNotifDias(
  _: unknown,
  formData: FormData
): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const dias = parseInt(formData.get("notifDias") as string)
  if (!dias || dias < 1 || dias > 30) return { error: "Valor deve ser entre 1 e 30 dias." }

  await db.user.update({ where: { id: session.user.id }, data: { notifDias: dias } })
  return { success: true }
}

export async function seedDefaultCategorias(userId: string) {
  const defaults = [
    { nome: "Moradia",     cor: "#059669", icone: "moradia" },
    { nome: "Alimentação", cor: "#f59e0b", icone: "alimentacao" },
    { nome: "Saúde",       cor: "#22c55e", icone: "saude" },
    { nome: "Transporte",  cor: "#3b82f6", icone: "transporte" },
    { nome: "Lazer",       cor: "#ec4899", icone: "lazer" },
    { nome: "Educação",    cor: "#8b5cf6", icone: "educacao" },
    { nome: "Outros",      cor: "#94a3b8", icone: "outros" },
  ]
  await db.categoria.createMany({ data: defaults.map((d) => ({ ...d, userId })) })
}
