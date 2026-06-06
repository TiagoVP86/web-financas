"use server"

import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { signIn } from "@/lib/auth"
import { redirect } from "next/navigation"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { AuthError } from "next-auth"

const cadastroSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function cadastrar(formData: FormData) {
  const registrationSecret = process.env.REGISTRATION_SECRET
  if (registrationSecret) {
    const code = formData.get("registrationCode") as string
    if (code !== registrationSecret) return { error: "Código de convite inválido" }
  }

  const parsed = cadastroSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) return { error: "Dados inválidos" }

  const exists = await db.user.findUnique({ where: { email: parsed.data.email } })
  if (exists) return { error: "Email já cadastrado" }

  const hash = await bcrypt.hash(parsed.data.password, 12)
  const user = await db.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, password: hash },
  })

  await seedDefaultCategorias(user.id)
  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/dashboard",
  })
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
    if (e instanceof AuthError) return { error: "Email ou senha incorretos" }
    throw e // re-throw redirect errors so Next.js handles navigation
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

export async function seedDefaultCategorias(userId: string) {
  const defaults = [
    { nome: "Moradia",     cor: "#6366f1", icone: "home" },
    { nome: "Alimentação", cor: "#f59e0b", icone: "utensils" },
    { nome: "Saúde",       cor: "#22c55e", icone: "heart-pulse" },
    { nome: "Transporte",  cor: "#3b82f6", icone: "car" },
    { nome: "Lazer",       cor: "#ec4899", icone: "smile" },
    { nome: "Educação",    cor: "#8b5cf6", icone: "book-open" },
    { nome: "Outros",      cor: "#94a3b8", icone: "more-horizontal" },
  ]
  await db.categoria.createMany({ data: defaults.map((d) => ({ ...d, userId })) })
}
