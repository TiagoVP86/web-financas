# web-financas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal finance web app with PDF bill extraction via Gemini AI, expense/income tracking, charts, and AI financial health analysis.

**Architecture:** Next.js 14 App Router monolith with Server Actions for all mutations. Prisma ORM connects to Neon (PostgreSQL). Gemini 1.5 Flash handles both PDF data extraction and financial analysis. All protected routes gated by NextAuth v5 middleware.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Prisma, Neon (PostgreSQL), NextAuth v5, Google Gemini API (`gemini-1.5-flash`), Vercel Blob, Recharts, react-hook-form, zod

---

## Task 1: Project Scaffold

**Files:**
- Create: `C:/Projetos/web-financas/` (Next.js project root)
- Create: `.env.local`
- Create: `tailwind.config.ts`

- [ ] **Step 1: Create Next.js project**

```bash
cd C:/Projetos
npx create-next-app@latest web-financas --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*"
cd web-financas
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @prisma/client @auth/prisma-adapter next-auth@beta bcryptjs
npm install @google/generative-ai @vercel/blob
npm install recharts react-hook-form @hookform/resolvers zod
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install -D prisma @types/bcryptjs
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init
```

Quando perguntar:
- Style: Default
- Base color: Slate
- CSS variables: Yes

- [ ] **Step 4: Add shadcn components usados no projeto**

```bash
npx shadcn@latest add button input label card badge table dialog tabs select dropdown-menu separator avatar tooltip sheet
```

- [ ] **Step 5: Criar `.env.local`**

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=
BLOB_READ_WRITE_TOKEN=
```

- [ ] **Step 6: Configurar dark mode no `tailwind.config.ts`**

Substituir o conteúdo gerado por:

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
```

```bash
npm install -D tailwindcss-animate
```

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js project with shadcn/ui and dependencies"
```

---

## Task 2: Prisma Schema + Neon

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/db.ts`

- [ ] **Step 1: Inicializar Prisma**

```bash
npx prisma init
```

- [ ] **Step 2: Escrever `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_URL")
}

model User {
  id          String      @id @default(cuid())
  email       String      @unique
  password    String
  name        String?
  createdAt   DateTime    @default(now())
  lancamentos Lancamento[]
  categorias  Categoria[]
  analisesIA  AnaliseIA[]
}

model Categoria {
  id          String      @id @default(cuid())
  nome        String
  cor         String
  icone       String?
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  lancamentos Lancamento[]

  @@unique([nome, userId])
}

model Lancamento {
  id           String    @id @default(cuid())
  descricao    String
  valor        Decimal   @db.Decimal(10, 2)
  tipo         Tipo
  data         DateTime
  status       Status    @default(REALIZADO)
  codigoBarras String?
  chavePix     String?
  pdfUrl       String?
  categoriaId  String?
  categoria    Categoria? @relation(fields: [categoriaId], references: [id])
  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime  @default(now())
}

model AnaliseIA {
  id        String   @id @default(cuid())
  conteudo  String   @db.Text
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

enum Tipo   { RECEITA DESPESA }
enum Status { PENDENTE PAGO VENCIDO REALIZADO }
```

- [ ] **Step 3: Configurar `DATABASE_URL` no `.env.local`**

Obter connection string no painel do Neon (neon.tech → New Project → Connection String). Colar em `DATABASE_URL=`.

- [ ] **Step 4: Criar e rodar migration**

```bash
npx prisma migrate dev --name init
```

Esperado: `✔ Your database is now in sync with your schema.`

- [ ] **Step 5: Criar `lib/db.ts`**

```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["error"] : [] })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```

- [ ] **Step 6: Commit**

```bash
git add prisma/ lib/db.ts .env.local
git commit -m "feat: add Prisma schema and Neon database connection"
```

---

## Task 3: NextAuth v5 — Credentials

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Criar `lib/auth.ts`**

```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
})
```

- [ ] **Step 2: Criar `app/api/auth/[...nextauth]/route.ts`**

```typescript
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

- [ ] **Step 3: Criar `middleware.ts` na raiz do projeto**

```typescript
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/cadastro")

  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

- [ ] **Step 4: Adicionar `id` ao tipo de sessão — criar `types/next-auth.d.ts`**

```typescript
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
    }
  }
}
```

- [ ] **Step 5: Adicionar `NEXTAUTH_SECRET` ao `.env.local`**

```bash
# Gerar secret:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Colar o resultado em `NEXTAUTH_SECRET=` no `.env.local`.

- [ ] **Step 6: Commit**

```bash
git add lib/auth.ts app/api/ middleware.ts types/
git commit -m "feat: add NextAuth v5 credentials authentication and route middleware"
```

---

## Task 4: Server Actions de Autenticação

**Files:**
- Create: `actions/auth.ts`
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/cadastro/page.tsx`
- Create: `app/(auth)/layout.tsx`

- [ ] **Step 1: Criar `actions/auth.ts`**

```typescript
"use server"

import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { signIn } from "@/lib/auth"
import { redirect } from "next/navigation"
import { z } from "zod"

const cadastroSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function cadastrar(formData: FormData) {
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
  redirect("/dashboard")
}

export async function login(formData: FormData) {
  await signIn("credentials", {
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: "/dashboard",
  })
}

async function seedDefaultCategorias(userId: string) {
  const defaults = [
    { nome: "Moradia",      cor: "#6366f1", icone: "home" },
    { nome: "Alimentação",  cor: "#f59e0b", icone: "utensils" },
    { nome: "Saúde",        cor: "#22c55e", icone: "heart-pulse" },
    { nome: "Transporte",   cor: "#3b82f6", icone: "car" },
    { nome: "Lazer",        cor: "#ec4899", icone: "smile" },
    { nome: "Educação",     cor: "#8b5cf6", icone: "book-open" },
    { nome: "Outros",       cor: "#94a3b8", icone: "more-horizontal" },
  ]
  await db.categoria.createMany({ data: defaults.map((d) => ({ ...d, userId })) })
}
```

- [ ] **Step 2: Criar `app/(auth)/layout.tsx`**

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  )
}
```

- [ ] **Step 3: Criar `app/(auth)/login/page.tsx`**

```typescript
import { login } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Acesse seu controle financeiro</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={login} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">Entrar</Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-primary hover:underline">Cadastre-se</Link>
        </p>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Criar `app/(auth)/cadastro/page.tsx`**

```typescript
import { cadastrar } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function CadastroPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Comece a controlar suas finanças</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={cadastrar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" minLength={6} required />
          </div>
          <Button type="submit" className="w-full">Criar conta</Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary hover:underline">Entrar</Link>
        </p>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 5: Testar manualmente**

```bash
npm run dev
```

Abrir http://localhost:3000 — deve redirecionar para /login. Criar conta, logar, confirmar redirecionamento para /dashboard (página 404 por ora).

- [ ] **Step 6: Commit**

```bash
git add actions/auth.ts app/\(auth\)/
git commit -m "feat: add login and cadastro pages with NextAuth credentials"
```

---

## Task 5: App Layout com Sidebar

**Files:**
- Create: `app/(app)/layout.tsx`
- Create: `components/layout/sidebar.tsx`
- Create: `components/layout/dark-mode-toggle.tsx`
- Create: `components/providers.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Criar `components/providers.tsx` para ThemeProvider**

```typescript
"use client"

import { ThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}
```

```bash
npm install next-themes
```

- [ ] **Step 2: Modificar `app/layout.tsx` para incluir Providers**

```typescript
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Web Finanças",
  description: "Controle financeiro pessoal",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Criar `components/layout/dark-mode-toggle.tsx`**

```typescript
"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

- [ ] **Step 4: Criar `components/layout/sidebar.tsx`**

```typescript
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { DarkModeToggle } from "./dark-mode-toggle"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
  Wallet,
} from "lucide-react"

const navItems = [
  { href: "/dashboard",      label: "Dashboard",    icon: LayoutDashboard },
  { href: "/lancamentos",    label: "Lançamentos",  icon: Receipt },
  { href: "/relatorios",     label: "Relatórios",   icon: BarChart3 },
  { href: "/ia",             label: "Análise IA",   icon: Sparkles },
  { href: "/configuracoes",  label: "Configurações",icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-card px-3 py-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <Wallet className="h-6 w-6 text-primary" />
        <span className="font-semibold text-lg">Web Finanças</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center justify-between px-2">
        <DarkModeToggle />
        <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 5: Criar `app/(app)/layout.tsx`**

```typescript
import { Sidebar } from "@/components/layout/sidebar"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 6: Criar placeholder `app/(app)/dashboard/page.tsx`**

```typescript
export default function DashboardPage() {
  return <h1 className="text-2xl font-bold">Dashboard</h1>
}
```

- [ ] **Step 7: Testar**

```bash
npm run dev
```

Logar e confirmar: sidebar visível, dark mode toggle funcionando, links de navegação ativos.

- [ ] **Step 8: Commit**

```bash
git add app/layout.tsx app/\(app\)/ components/layout/ components/providers.tsx
git commit -m "feat: add app layout with sidebar and dark mode toggle"
```

---

## Task 6: Dashboard

**Files:**
- Create: `app/(app)/dashboard/page.tsx`
- Create: `components/dashboard/summary-cards.tsx`
- Create: `components/dashboard/monthly-chart.tsx`
- Create: `components/dashboard/upcoming-bills.tsx`

- [ ] **Step 1: Criar `components/dashboard/summary-cards.tsx`**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react"

interface SummaryCardsProps {
  receitas: number
  despesas: number
  saldo: number
  aVencer: number
}

export function SummaryCards({ receitas, despesas, saldo, aVencer }: SummaryCardsProps) {
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Receitas do mês</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{fmt(receitas)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Despesas do mês</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{fmt(despesas)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${saldo >= 0 ? "text-primary" : "text-red-500"}`}>
            {fmt(saldo)}
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-500/30">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">A vencer (7 dias)</CardTitle>
          <AlertCircle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-500">{fmt(aVencer)}</div>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Criar `components/dashboard/monthly-chart.tsx`**

```typescript
"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MonthlyChartProps {
  data: { mes: string; receitas: number; despesas: number }[]
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Receitas vs Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
            <Tooltip
              formatter={(value: number) =>
                value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              }
            />
            <Bar dataKey="receitas" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Criar `components/dashboard/upcoming-bills.tsx`**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lancamento } from "@prisma/client"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface UpcomingBillsProps {
  bills: (Lancamento & { categoria: { nome: string; cor: string } | null })[]
}

export function UpcomingBills({ bills }: UpcomingBillsProps) {
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const isOverdue = (date: Date) => new Date(date) < new Date()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Próximas Contas</CardTitle>
      </CardHeader>
      <CardContent>
        {bills.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma conta pendente.</p>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{bill.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(bill.data), "dd MMM", { locale: ptBR })}
                    {bill.categoria && ` · ${bill.categoria.nome}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{fmt(Number(bill.valor))}</span>
                  <Badge variant={isOverdue(bill.data) ? "destructive" : "outline"}>
                    {isOverdue(bill.data) ? "Vencido" : "Pendente"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

```bash
npm install date-fns
```

- [ ] **Step 4: Criar `app/(app)/dashboard/page.tsx`**

```typescript
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { MonthlyChart } from "@/components/dashboard/monthly-chart"
import { UpcomingBills } from "@/components/dashboard/upcoming-bills"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user.id

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const next7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [lancamentos, pendentes, monthlyRaw] = await Promise.all([
    db.lancamento.findMany({
      where: { userId, data: { gte: monthStart, lte: monthEnd }, status: { in: ["REALIZADO", "PAGO"] } },
    }),
    db.lancamento.findMany({
      where: { userId, status: "PENDENTE", data: { lte: next7 } },
      include: { categoria: true },
      orderBy: { data: "asc" },
      take: 5,
    }),
    Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(now, 5 - i)
        const start = startOfMonth(d)
        const end = endOfMonth(d)
        return db.lancamento.findMany({
          where: { userId, data: { gte: start, lte: end }, status: { in: ["REALIZADO", "PAGO"] } },
        }).then((items) => ({
          mes: format(d, "MMM", { locale: ptBR }),
          receitas: items.filter((l) => l.tipo === "RECEITA").reduce((s, l) => s + Number(l.valor), 0),
          despesas: items.filter((l) => l.tipo === "DESPESA").reduce((s, l) => s + Number(l.valor), 0),
        }))
      })
    ),
  ])

  const receitas = lancamentos.filter((l) => l.tipo === "RECEITA").reduce((s, l) => s + Number(l.valor), 0)
  const despesas = lancamentos.filter((l) => l.tipo === "DESPESA").reduce((s, l) => s + Number(l.valor), 0)
  const aVencer = pendentes.reduce((s, l) => s + Number(l.valor), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild variant="outline">
          <Link href="/ia">Analisar com IA ✨</Link>
        </Button>
      </div>

      <SummaryCards receitas={receitas} despesas={despesas} saldo={receitas - despesas} aVencer={aVencer} />

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyChart data={monthlyRaw} />
        <UpcomingBills bills={pendentes} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verificar no browser**

```bash
npm run dev
```

Confirmar cards de resumo, gráfico de barras e lista de próximas contas visíveis.

- [ ] **Step 6: Commit**

```bash
git add app/\(app\)/dashboard/ components/dashboard/
git commit -m "feat: add dashboard with summary cards, monthly chart, and upcoming bills"
```

---

## Task 7: Lançamentos — Lista e Filtros

**Files:**
- Create: `app/(app)/lancamentos/page.tsx`
- Create: `components/lancamentos/lancamentos-table.tsx`
- Create: `components/lancamentos/status-badge.tsx`

- [ ] **Step 1: Criar `components/lancamentos/status-badge.tsx`**

```typescript
import { Badge } from "@/components/ui/badge"
import { Status } from "@prisma/client"

const statusConfig: Record<Status, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDENTE: { label: "Pendente",  variant: "outline" },
  PAGO:     { label: "Pago",      variant: "default" },
  VENCIDO:  { label: "Vencido",   variant: "destructive" },
  REALIZADO:{ label: "Realizado", variant: "secondary" },
}

export function StatusBadge({ status }: { status: Status }) {
  const { label, variant } = statusConfig[status]
  return <Badge variant={variant}>{label}</Badge>
}
```

- [ ] **Step 2: Criar `components/lancamentos/lancamentos-table.tsx`**

```typescript
"use client"

import { Lancamento, Categoria, Tipo, Status } from "@prisma/client"
import { StatusBadge } from "./status-badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { marcarComoPago, deletarLancamento } from "@/actions/lancamentos"
import { useState } from "react"

type LancamentoComCategoria = Lancamento & { categoria: Categoria | null }

interface LancamentosTableProps {
  lancamentos: LancamentoComCategoria[]
}

export function LancamentosTable({ lancamentos }: LancamentosTableProps) {
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const copiar = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`)
  }

  if (lancamentos.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum lançamento encontrado.
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Descrição</th>
            <th className="px-4 py-3 text-left font-medium">Categoria</th>
            <th className="px-4 py-3 text-left font-medium">Data</th>
            <th className="px-4 py-3 text-right font-medium">Valor</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {lancamentos.map((l) => (
            <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={l.tipo === "RECEITA" ? "text-green-500" : "text-red-500"}>
                    {l.tipo === "RECEITA" ? "+" : "-"}
                  </span>
                  {l.descricao}
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {l.categoria ? (
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: l.categoria.cor }}
                    />
                    {l.categoria.nome}
                  </span>
                ) : "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {format(new Date(l.data), "dd/MM/yyyy", { locale: ptBR })}
              </td>
              <td className={`px-4 py-3 text-right font-medium ${l.tipo === "RECEITA" ? "text-green-500" : ""}`}>
                {fmt(Number(l.valor))}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={l.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  {l.codigoBarras && (
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => copiar(l.codigoBarras!, "Código de barras")}
                      title="Copiar código de barras"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                  {l.chavePix && (
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => copiar(l.chavePix!, "Chave PIX")}
                      title="Copiar PIX"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                  {(l.status === "PENDENTE" || l.status === "VENCIDO") && (
                    <form action={marcarComoPago.bind(null, l.id)}>
                      <Button variant="ghost" size="icon" title="Marcar como pago">
                        <Check className="h-3 w-3 text-green-500" />
                      </Button>
                    </form>
                  )}
                  <form action={deletarLancamento.bind(null, l.id)}>
                    <Button variant="ghost" size="icon" title="Excluir">
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

```bash
npm install sonner
```

Adicionar `<Toaster />` no `app/layout.tsx`:
```typescript
import { Toaster } from "sonner"
// dentro do <body>:
<Providers>
  {children}
  <Toaster richColors />
</Providers>
```

- [ ] **Step 3: Criar `actions/lancamentos.ts` (parte 1 — marcar e deletar)**

```typescript
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
```

- [ ] **Step 4: Criar `app/(app)/lancamentos/page.tsx`**

```typescript
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { LancamentosTable } from "@/components/lancamentos/lancamentos-table"

export default async function LancamentosPage({
  searchParams,
}: {
  searchParams: { mes?: string; tipo?: string; status?: string; categoriaId?: string }
}) {
  const session = await auth()
  const userId = session!.user.id
  const now = new Date()

  const mes = searchParams.mes ? parseInt(searchParams.mes) : now.getMonth() + 1
  const ano = now.getFullYear()
  const start = new Date(ano, mes - 1, 1)
  const end = new Date(ano, mes, 0, 23, 59, 59)

  const where: Record<string, unknown> = {
    userId,
    data: { gte: start, lte: end },
  }
  if (searchParams.tipo && searchParams.tipo !== "todos") where.tipo = searchParams.tipo
  if (searchParams.status && searchParams.status !== "todos") where.status = searchParams.status
  if (searchParams.categoriaId) where.categoriaId = searchParams.categoriaId

  const [lancamentos, categorias] = await Promise.all([
    db.lancamento.findMany({
      where,
      include: { categoria: true },
      orderBy: { data: "desc" },
    }),
    db.categoria.findMany({ where: { userId }, orderBy: { nome: "asc" } }),
  ])

  const meses = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lançamentos</h1>
        {/* NovoLancamentoModal adicionado na Task 8 */}
      </div>

      {/* Filtros */}
      <form className="flex flex-wrap gap-2">
        <select name="mes" defaultValue={mes} className="rounded-md border bg-background px-3 py-1.5 text-sm">
          {meses.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select name="tipo" defaultValue={searchParams.tipo ?? "todos"} className="rounded-md border bg-background px-3 py-1.5 text-sm">
          <option value="todos">Todos os tipos</option>
          <option value="RECEITA">Receitas</option>
          <option value="DESPESA">Despesas</option>
        </select>
        <select name="status" defaultValue={searchParams.status ?? "todos"} className="rounded-md border bg-background px-3 py-1.5 text-sm">
          <option value="todos">Todos os status</option>
          <option value="PENDENTE">Pendente</option>
          <option value="PAGO">Pago</option>
          <option value="VENCIDO">Vencido</option>
          <option value="REALIZADO">Realizado</option>
        </select>
        <select name="categoriaId" defaultValue={searchParams.categoriaId ?? ""} className="rounded-md border bg-background px-3 py-1.5 text-sm">
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
          Filtrar
        </button>
      </form>

      <LancamentosTable lancamentos={lancamentos} />
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/lancamentos/ components/lancamentos/ actions/lancamentos.ts
git commit -m "feat: add lancamentos list with filters and row actions"
```

---

## Task 8: Lançamentos — Modal de Novo Lançamento (Manual)

**Files:**
- Create: `components/lancamentos/novo-lancamento-modal.tsx`
- Create: `components/lancamentos/manual-form-tab.tsx`
- Modify: `actions/lancamentos.ts`
- Modify: `app/(app)/lancamentos/page.tsx`

- [ ] **Step 1: Adicionar `criarLancamento` em `actions/lancamentos.ts`**

```typescript
const lancamentoSchema = z.object({
  descricao:    z.string().min(1),
  valor:        z.coerce.number().positive(),
  tipo:         z.enum(["RECEITA", "DESPESA"]),
  data:         z.string(),
  status:       z.enum(["PENDENTE", "PAGO", "VENCIDO", "REALIZADO"]),
  codigoBarras: z.string().optional(),
  chavePix:     z.string().optional(),
  categoriaId:  z.string().optional(),
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
    pdfUrl:       formData.get("pdfUrl") || undefined,
  })
  if (!parsed.success) return { error: "Dados inválidos" }

  await db.lancamento.create({
    data: {
      ...parsed.data,
      data: new Date(parsed.data.data),
      userId,
    },
  })
  revalidatePath("/lancamentos")
  revalidatePath("/dashboard")
}
```

- [ ] **Step 2: Criar `components/lancamentos/manual-form-tab.tsx`**

```typescript
"use client"

import { criarLancamento } from "@/actions/lancamentos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Categoria } from "@prisma/client"
import { useRef } from "react"
import { toast } from "sonner"

interface ManualFormTabProps {
  categorias: Categoria[]
  onSuccess: () => void
}

export function ManualFormTab({ categorias, onSuccess }: ManualFormTabProps) {
  const ref = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    const result = await criarLancamento(formData)
    if (result?.error) {
      toast.error(result.error)
      return
    }
    toast.success("Lançamento criado!")
    ref.current?.reset()
    onSuccess()
  }

  return (
    <form ref={ref} action={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>Descrição</Label>
        <Input name="descricao" placeholder="Ex: Conta de Luz" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Valor (R$)</Label>
          <Input name="valor" type="number" step="0.01" min="0.01" placeholder="0,00" required />
        </div>
        <div className="space-y-1">
          <Label>Data</Label>
          <Input name="data" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Tipo</Label>
          <select name="tipo" className="w-full rounded-md border bg-background px-3 py-2 text-sm" required>
            <option value="DESPESA">Despesa</option>
            <option value="RECEITA">Receita</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>Status</Label>
          <select name="status" className="w-full rounded-md border bg-background px-3 py-2 text-sm" required>
            <option value="REALIZADO">Realizado</option>
            <option value="PENDENTE">Pendente</option>
            <option value="PAGO">Pago</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Categoria</Label>
        <select name="categoriaId" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">Sem categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label>Código de Barras (opcional)</Label>
        <Input name="codigoBarras" placeholder="Linha digitável" />
      </div>

      <div className="space-y-1">
        <Label>Chave PIX (opcional)</Label>
        <Input name="chavePix" placeholder="CPF, email, telefone ou chave aleatória" />
      </div>

      <Button type="submit" className="w-full">Salvar Lançamento</Button>
    </form>
  )
}
```

- [ ] **Step 3: Criar `components/lancamentos/novo-lancamento-modal.tsx`**

```typescript
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Categoria } from "@prisma/client"
import { ManualFormTab } from "./manual-form-tab"
import { PdfUploadTab } from "./pdf-upload-tab" // criado na Task 9

interface NovoLancamentoModalProps {
  categorias: Categoria[]
}

export function NovoLancamentoModal({ categorias }: NovoLancamentoModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Lançamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Lançamento</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="manual">
          <TabsList className="w-full">
            <TabsTrigger value="manual" className="flex-1">Manual</TabsTrigger>
            <TabsTrigger value="pdf" className="flex-1">Upload PDF</TabsTrigger>
          </TabsList>
          <TabsContent value="manual" className="mt-4">
            <ManualFormTab categorias={categorias} onSuccess={() => setOpen(false)} />
          </TabsContent>
          <TabsContent value="pdf" className="mt-4">
            <PdfUploadTab categorias={categorias} onSuccess={() => setOpen(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Adicionar modal na página de lançamentos**

Em `app/(app)/lancamentos/page.tsx`, adicionar import e substituir o comentário:

```typescript
import { NovoLancamentoModal } from "@/components/lancamentos/novo-lancamento-modal"

// substituir o comentário por:
<NovoLancamentoModal categorias={categorias} />
```

- [ ] **Step 5: Commit**

```bash
git add components/lancamentos/ actions/lancamentos.ts app/\(app\)/lancamentos/
git commit -m "feat: add novo lancamento modal with manual form tab"
```

---

## Task 9: Lançamentos — Upload de PDF com Gemini

**Files:**
- Create: `lib/gemini.ts`
- Create: `components/lancamentos/pdf-upload-tab.tsx`
- Create: `app/api/upload/route.ts`

- [ ] **Step 1: Criar `lib/gemini.ts`**

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface ExtractedBill {
  descricao: string
  valor: number | null
  data: string | null      // formato ISO: "2026-06-15"
  codigoBarras: string | null
  chavePix: string | null
}

const EXTRACT_PROMPT = `Analise este documento e extraia as informações em JSON estrito:
{
  "descricao": "nome/tipo da conta (ex: Conta de Luz, Internet, IPTU, Água)",
  "valor": 99.90,
  "data": "2026-06-15",
  "codigoBarras": "linha digitável completa ou null",
  "chavePix": "chave PIX ou null"
}
- Para "data" use o vencimento no formato YYYY-MM-DD
- Retorne APENAS o JSON, sem markdown, sem explicações`

export async function extractBillFromPdf(base64Pdf: string): Promise<ExtractedBill> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: "application/pdf",
        data: base64Pdf,
      },
    },
    EXTRACT_PROMPT,
  ])

  const text = result.response.text().trim()
  const json = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  return JSON.parse(json) as ExtractedBill
}
```

- [ ] **Step 2: Criar `app/api/upload/route.ts`**

```typescript
import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { extractBillFromPdf } from "@/lib/gemini"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })
  if (file.type !== "application/pdf") return NextResponse.json({ error: "PDF only" }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Max 10MB" }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString("base64")

  const [blob, extracted] = await Promise.all([
    put(`pdfs/${session.user.id}/${Date.now()}-${file.name}`, file, { access: "public" }),
    extractBillFromPdf(base64),
  ])

  return NextResponse.json({ pdfUrl: blob.url, extracted })
}
```

- [ ] **Step 3: Criar `components/lancamentos/pdf-upload-tab.tsx`**

```typescript
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Categoria } from "@prisma/client"
import { criarLancamento } from "@/actions/lancamentos"
import { toast } from "sonner"
import { Upload, Loader2 } from "lucide-react"
import { ExtractedBill } from "@/lib/gemini"

interface PdfUploadTabProps {
  categorias: Categoria[]
  onSuccess: () => void
}

export function PdfUploadTab({ categorias, onSuccess }: PdfUploadTabProps) {
  const [loading, setLoading] = useState(false)
  const [extracted, setExtracted] = useState<ExtractedBill | null>(null)
  const [pdfUrl, setPdfUrl] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: form })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Erro no upload")
        return
      }
      const data = await res.json()
      setExtracted(data.extracted)
      setPdfUrl(data.pdfUrl)
      toast.success("PDF processado! Revise e confirme.")
    } catch {
      toast.error("Falha ao processar PDF")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(formData: FormData) {
    formData.append("pdfUrl", pdfUrl)
    const result = await criarLancamento(formData)
    if (result?.error) { toast.error(result.error); return }
    toast.success("Lançamento criado!")
    setExtracted(null)
    setPdfUrl("")
    onSuccess()
  }

  if (!extracted) {
    return (
      <div className="space-y-4">
        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {loading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Processando PDF com IA...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Clique ou arraste um PDF aqui</p>
              <p className="text-xs text-muted-foreground">Máximo 10MB</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleUpload} />
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">Dados extraídos pelo Gemini — revise antes de salvar:</p>

      <div className="space-y-1">
        <Label>Descrição</Label>
        <Input name="descricao" defaultValue={extracted.descricao} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Valor (R$)</Label>
          <Input name="valor" type="number" step="0.01" defaultValue={extracted.valor ?? ""} required />
        </div>
        <div className="space-y-1">
          <Label>Vencimento</Label>
          <Input name="data" type="date" defaultValue={extracted.data ?? ""} required />
        </div>
      </div>

      <input type="hidden" name="tipo" value="DESPESA" />
      <input type="hidden" name="status" value="PENDENTE" />

      {extracted.codigoBarras && (
        <div className="space-y-1">
          <Label>Código de Barras</Label>
          <Input name="codigoBarras" defaultValue={extracted.codigoBarras} />
        </div>
      )}

      {extracted.chavePix && (
        <div className="space-y-1">
          <Label>Chave PIX</Label>
          <Input name="chavePix" defaultValue={extracted.chavePix} />
        </div>
      )}

      <div className="space-y-1">
        <Label>Categoria</Label>
        <select name="categoriaId" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">Sem categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => setExtracted(null)} className="flex-1">
          Voltar
        </Button>
        <Button type="submit" className="flex-1">Confirmar e Salvar</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 4: Configurar `GEMINI_API_KEY` e `BLOB_READ_WRITE_TOKEN`**

- Gemini API key: https://aistudio.google.com/app/apikey (gratuito, sem cartão de crédito)
- Vercel Blob token: Vercel dashboard → Storage → Create Blob Store → `.env.local`

- [ ] **Step 5: Testar o fluxo**

```bash
npm run dev
```

Abrir /lancamentos → Novo Lançamento → aba "Upload PDF" → fazer upload de um boleto PDF → confirmar que os campos são pré-preenchidos → salvar.

- [ ] **Step 6: Commit**

```bash
git add lib/gemini.ts app/api/upload/ components/lancamentos/pdf-upload-tab.tsx
git commit -m "feat: add PDF upload with Gemini extraction for bill data"
```

---

## Task 10: Relatórios

**Files:**
- Create: `app/(app)/relatorios/page.tsx`
- Create: `components/relatorios/category-pie-chart.tsx`
- Create: `components/relatorios/monthly-bar-chart.tsx`

- [ ] **Step 1: Criar `components/relatorios/category-pie-chart.tsx`**

```typescript
"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CategoryPieChartProps {
  data: { nome: string; valor: number; cor: string }[]
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Sem despesas no período.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius={90}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Criar `components/relatorios/monthly-bar-chart.tsx`**

```typescript
"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MonthlyBarChartProps {
  data: { mes: string; receitas: number; despesas: number }[]
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Receitas vs Despesas (12 meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
            <Tooltip
              formatter={(v: number) =>
                v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              }
            />
            <Bar dataKey="receitas" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Criar `app/(app)/relatorios/page.tsx`**

```typescript
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { CategoryPieChart } from "@/components/relatorios/category-pie-chart"
import { MonthlyBarChart } from "@/components/relatorios/monthly-bar-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: { mes?: string }
}) {
  const session = await auth()
  const userId = session!.user.id
  const now = new Date()

  const mes = searchParams.mes ? parseInt(searchParams.mes) : now.getMonth() + 1
  const ano = now.getFullYear()
  const start = new Date(ano, mes - 1, 1)
  const end = new Date(ano, mes, 0, 23, 59, 59)

  const [despesasMes, monthly] = await Promise.all([
    db.lancamento.findMany({
      where: { userId, tipo: "DESPESA", data: { gte: start, lte: end }, status: { in: ["REALIZADO", "PAGO"] } },
      include: { categoria: true },
    }),
    Promise.all(
      Array.from({ length: 12 }, (_, i) => {
        const d = subMonths(now, 11 - i)
        const s = startOfMonth(d)
        const e = endOfMonth(d)
        return db.lancamento.findMany({
          where: { userId, data: { gte: s, lte: e }, status: { in: ["REALIZADO", "PAGO"] } },
        }).then((items) => ({
          mes: format(d, "MMM", { locale: ptBR }),
          receitas: items.filter((l) => l.tipo === "RECEITA").reduce((acc, l) => acc + Number(l.valor), 0),
          despesas: items.filter((l) => l.tipo === "DESPESA").reduce((acc, l) => acc + Number(l.valor), 0),
        }))
      })
    ),
  ])

  // Agrupar despesas por categoria
  const byCategory = despesasMes.reduce<Record<string, { nome: string; valor: number; cor: string }>>(
    (acc, l) => {
      const key = l.categoriaId ?? "sem-categoria"
      const nome = l.categoria?.nome ?? "Sem categoria"
      const cor = l.categoria?.cor ?? "#94a3b8"
      acc[key] = { nome, cor, valor: (acc[key]?.valor ?? 0) + Number(l.valor) }
      return acc
    },
    {}
  )
  const pieData = Object.values(byCategory).sort((a, b) => b.valor - a.valor)

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <form>
          <select name="mes" defaultValue={mes} className="rounded-md border bg-background px-3 py-1.5 text-sm">
            {meses.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <button type="submit" className="ml-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
            Ver
          </button>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryPieChart data={pieData} />
        <MonthlyBarChart data={monthly} />
      </div>

      {/* Tabela resumo por categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo por Categoria — {meses[mes - 1]}</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem despesas no período.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-medium">Categoria</th>
                  <th className="py-2 text-right font-medium">Total</th>
                  <th className="py-2 text-right font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {pieData.map((c) => {
                  const total = pieData.reduce((s, x) => s + x.valor, 0)
                  return (
                    <tr key={c.nome} className="border-b last:border-0">
                      <td className="py-2 flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ background: c.cor }} />
                        {c.nome}
                      </td>
                      <td className="py-2 text-right">{fmt(c.valor)}</td>
                      <td className="py-2 text-right text-muted-foreground">
                        {total > 0 ? ((c.valor / total) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/relatorios/ components/relatorios/
git commit -m "feat: add relatorios page with pie and bar charts"
```

---

## Task 11: Análise de IA

**Files:**
- Modify: `lib/gemini.ts`
- Create: `actions/ia.ts`
- Create: `app/(app)/ia/page.tsx`
- Create: `components/ia/analise-card.tsx`

- [ ] **Step 1: Adicionar `analyzeFinances` em `lib/gemini.ts`**

```typescript
const ANALYSIS_PROMPT = (data: string) => `Você é um consultor financeiro pessoal objetivo e prático.
Analise os dados financeiros abaixo e responda em formato JSON estrito:
{
  "resumo": "parágrafo conciso (máx 3 linhas) sobre a situação financeira",
  "positivos": ["ponto 1", "ponto 2", "ponto 3"],
  "atencao": ["ponto 1", "ponto 2", "ponto 3"],
  "sugestoes": ["sugestão prática 1", "sugestão prática 2", "sugestão prática 3"]
}

Dados dos últimos 3 meses:
${data}

Retorne APENAS o JSON, sem markdown.`

export interface AnalysisResult {
  resumo: string
  positivos: string[]
  atencao: string[]
  sugestoes: string[]
}

export async function analyzeFinances(data: string): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  const result = await model.generateContent(ANALYSIS_PROMPT(data))
  const text = result.response.text().trim()
  const json = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  return JSON.parse(json) as AnalysisResult
}
```

- [ ] **Step 2: Criar `actions/ia.ts`**

```typescript
"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { analyzeFinances } from "@/lib/gemini"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { subMonths, startOfMonth } from "date-fns"

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  return session.user.id
}

export async function gerarAnalise() {
  const userId = await getUserId()
  const threeMonthsAgo = startOfMonth(subMonths(new Date(), 2))

  const lancamentos = await db.lancamento.findMany({
    where: { userId, data: { gte: threeMonthsAgo }, status: { in: ["REALIZADO", "PAGO"] } },
    include: { categoria: true },
    orderBy: { data: "asc" },
  })

  if (lancamentos.length === 0) {
    return { error: "Sem lançamentos nos últimos 3 meses para analisar." }
  }

  const totalReceitas = lancamentos.filter((l) => l.tipo === "RECEITA").reduce((s, l) => s + Number(l.valor), 0)
  const totalDespesas = lancamentos.filter((l) => l.tipo === "DESPESA").reduce((s, l) => s + Number(l.valor), 0)

  const byCategory = lancamentos
    .filter((l) => l.tipo === "DESPESA")
    .reduce<Record<string, number>>((acc, l) => {
      const key = l.categoria?.nome ?? "Sem categoria"
      acc[key] = (acc[key] ?? 0) + Number(l.valor)
      return acc
    }, {})

  const summary = {
    periodo: "últimos 3 meses",
    totalReceitas,
    totalDespesas,
    saldo: totalReceitas - totalDespesas,
    despesasPorCategoria: byCategory,
    quantidadeLancamentos: lancamentos.length,
  }

  const result = await analyzeFinances(JSON.stringify(summary, null, 2))
  const conteudo = JSON.stringify(result)

  await db.analiseIA.create({ data: { conteudo, userId } })
  revalidatePath("/ia")
}
```

- [ ] **Step 3: Criar `components/ia/analise-card.tsx`**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalysisResult } from "@/lib/gemini"
import { CheckCircle, AlertTriangle, Lightbulb } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AnaliseCardProps {
  analise: { id: string; conteudo: string; createdAt: Date }
  isLatest?: boolean
}

export function AnaliseCard({ analise, isLatest }: AnaliseCardProps) {
  const data: AnalysisResult = JSON.parse(analise.conteudo)

  return (
    <Card className={isLatest ? "border-primary/50" : ""}>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Análise de {format(new Date(analise.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
          {isLatest && <span className="text-xs text-primary font-normal">Mais recente</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{data.resumo}</p>

        <div>
          <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-green-500">
            <CheckCircle className="h-4 w-4" /> Pontos Positivos
          </h4>
          <ul className="space-y-1">
            {data.positivos.map((p, i) => (
              <li key={i} className="text-sm text-muted-foreground">✓ {p}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-yellow-500">
            <AlertTriangle className="h-4 w-4" /> Pontos de Atenção
          </h4>
          <ul className="space-y-1">
            {data.atencao.map((p, i) => (
              <li key={i} className="text-sm text-muted-foreground">⚠ {p}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-primary">
            <Lightbulb className="h-4 w-4" /> Sugestões
          </h4>
          <ul className="space-y-1">
            {data.sugestoes.map((p, i) => (
              <li key={i} className="text-sm text-muted-foreground">→ {p}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Criar `app/(app)/ia/page.tsx`**

```typescript
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { AnaliseCard } from "@/components/ia/analise-card"
import { gerarAnalise } from "@/actions/ia"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export default async function IAPage() {
  const session = await auth()
  const userId = session!.user.id

  const analises = await db.analiseIA.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Análise Financeira IA</h1>
          <p className="text-sm text-muted-foreground">
            Powered by Gemini 1.5 Flash — análise dos últimos 3 meses
          </p>
        </div>
        <form action={gerarAnalise}>
          <Button type="submit">
            <Sparkles className="mr-2 h-4 w-4" />
            Analisar agora
          </Button>
        </form>
      </div>

      {analises.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhuma análise ainda. Clique em "Analisar agora" para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {analises.map((a, i) => (
            <AnaliseCard key={a.id} analise={a} isLatest={i === 0} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/gemini.ts actions/ia.ts app/\(app\)/ia/ components/ia/
git commit -m "feat: add AI financial health analysis with Gemini"
```

---

## Task 12: Configurações — Categorias e Perfil

**Files:**
- Create: `actions/categorias.ts`
- Create: `app/(app)/configuracoes/page.tsx`
- Create: `components/configuracoes/categorias-form.tsx`
- Create: `components/configuracoes/perfil-form.tsx`

- [ ] **Step 1: Criar `actions/categorias.ts`**

```typescript
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
```

- [ ] **Step 2: Criar `actions/auth.ts` — adicionar `atualizarPerfil`**

Append ao final de `actions/auth.ts`:

```typescript
export async function atualizarPerfil(formData: FormData) {
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
  revalidatePath("/configuracoes")
}
```

- [ ] **Step 3: Criar `app/(app)/configuracoes/page.tsx`**

```typescript
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { criarCategoria, deletarCategoria } from "@/actions/categorias"
import { atualizarPerfil } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"

export default async function ConfiguracoesPage() {
  const session = await auth()
  const userId = session!.user.id

  const [user, categorias] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.categoria.findMany({ where: { userId }, orderBy: { nome: "asc" } }),
  ])

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Configurações</h1>

      {/* Perfil */}
      <Card>
        <CardHeader><CardTitle className="text-base">Perfil</CardTitle></CardHeader>
        <CardContent>
          <form action={atualizarPerfil} className="space-y-4">
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input name="name" defaultValue={user?.name ?? ""} />
            </div>
            <div className="space-y-1">
              <Label>Senha atual (para trocar senha)</Label>
              <Input name="currentPassword" type="password" placeholder="Deixe em branco para não alterar" />
            </div>
            <div className="space-y-1">
              <Label>Nova senha</Label>
              <Input name="newPassword" type="password" placeholder="Mínimo 6 caracteres" />
            </div>
            <Button type="submit">Salvar Perfil</Button>
          </form>
        </CardContent>
      </Card>

      {/* Categorias */}
      <Card>
        <CardHeader><CardTitle className="text-base">Categorias</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {categorias.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="inline-block h-4 w-4 rounded-full border" style={{ background: c.cor }} />
                  <span className="text-sm">{c.nome}</span>
                </div>
                <form action={deletarCategoria.bind(null, c.id)}>
                  <Button variant="ghost" size="icon" type="submit">
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </form>
              </div>
            ))}
          </div>

          {/* Formulário nova categoria */}
          <form action={criarCategoria} className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label>Nome</Label>
              <Input name="nome" placeholder="Ex: Viagens" required />
            </div>
            <div className="space-y-1">
              <Label>Cor</Label>
              <Input name="cor" type="color" defaultValue="#6366f1" className="h-9 w-16 p-1" required />
            </div>
            <Button type="submit">Adicionar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add actions/categorias.ts actions/auth.ts app/\(app\)/configuracoes/
git commit -m "feat: add configuracoes page with categories CRUD and profile update"
```

---

## Task 13: Redirect raiz e polimento final

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/(app)/dashboard/page.tsx` (adicionar redirect raiz)

- [ ] **Step 1: Redirecionar `/` para `/dashboard`**

Substituir `app/page.tsx`:

```typescript
import { redirect } from "next/navigation"

export default function Home() {
  redirect("/dashboard")
}
```

- [ ] **Step 2: Adicionar `app/(app)/lancamentos/[id]/editar/page.tsx` — edição de lançamento**

```typescript
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { criarLancamento } from "@/actions/lancamentos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function EditarLancamentoPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const userId = session!.user.id

  const lancamento = await db.lancamento.findFirst({
    where: { id: params.id, userId },
    include: { categoria: true },
  })
  if (!lancamento) notFound()

  const categorias = await db.categoria.findMany({ where: { userId }, orderBy: { nome: "asc" } })

  async function atualizar(formData: FormData) {
    "use server"
    const session = await auth()
    const userId = session!.user.id
    await db.lancamento.updateMany({
      where: { id: params.id, userId },
      data: {
        descricao:    formData.get("descricao") as string,
        valor:        parseFloat(formData.get("valor") as string),
        tipo:         formData.get("tipo") as "RECEITA" | "DESPESA",
        data:         new Date(formData.get("data") as string),
        status:       formData.get("status") as "PENDENTE" | "PAGO" | "VENCIDO" | "REALIZADO",
        codigoBarras: (formData.get("codigoBarras") as string) || null,
        chavePix:     (formData.get("chavePix") as string) || null,
        categoriaId:  (formData.get("categoriaId") as string) || null,
      },
    })
    redirect("/lancamentos")
  }

  return (
    <div className="max-w-lg">
      <Card>
        <CardHeader><CardTitle>Editar Lançamento</CardTitle></CardHeader>
        <CardContent>
          <form action={atualizar} className="space-y-4">
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Input name="descricao" defaultValue={lancamento.descricao} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Valor (R$)</Label>
                <Input name="valor" type="number" step="0.01" defaultValue={Number(lancamento.valor)} required />
              </div>
              <div className="space-y-1">
                <Label>Data</Label>
                <Input name="data" type="date" defaultValue={lancamento.data.toISOString().split("T")[0]} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tipo</Label>
                <select name="tipo" defaultValue={lancamento.tipo} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="DESPESA">Despesa</option>
                  <option value="RECEITA">Receita</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <select name="status" defaultValue={lancamento.status} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="REALIZADO">Realizado</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="PAGO">Pago</option>
                  <option value="VENCIDO">Vencido</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Categoria</Label>
              <select name="categoriaId" defaultValue={lancamento.categoriaId ?? ""} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="">Sem categoria</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Código de Barras</Label>
              <Input name="codigoBarras" defaultValue={lancamento.codigoBarras ?? ""} />
            </div>
            <div className="space-y-1">
              <Label>Chave PIX</Label>
              <Input name="chavePix" defaultValue={lancamento.chavePix ?? ""} />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => history.back()} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">Salvar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Adicionar link de edição na tabela**

Em `components/lancamentos/lancamentos-table.tsx`, adicionar botão de edição:

```typescript
import Link from "next/link"
import { Pencil } from "lucide-react"

// dentro do map de ações, antes do botão excluir:
<Button variant="ghost" size="icon" asChild>
  <Link href={`/lancamentos/${l.id}/editar`}>
    <Pencil className="h-3 w-3" />
  </Link>
</Button>
```

- [ ] **Step 4: Verificação final completa**

```bash
npm run dev
```

Testar checklist:
- [ ] Login e cadastro funcionam
- [ ] Sidebar e dark mode toggle funcionam
- [ ] Dashboard mostra cards, gráfico e próximas contas
- [ ] Lançamento manual cria e aparece na lista
- [ ] Lançamento via PDF extrai dados corretamente
- [ ] Copiar código de barras/PIX funciona
- [ ] Marcar como pago atualiza status
- [ ] Relatórios mostram pizza e barras
- [ ] IA gera análise
- [ ] Categorias: criar e excluir
- [ ] Edição de lançamento funciona

- [ ] **Step 5: Commit final**

```bash
git add .
git commit -m "feat: complete web-financas personal finance app"
```

---

## Self-Review

**Cobertura do spec:**
- ✅ Auth email+senha (Task 3, 4)
- ✅ Layout sidebar dark mode (Task 5)
- ✅ Dashboard 4 cards + gráfico + próximas contas (Task 6)
- ✅ Lançamentos lista + filtros (Task 7)
- ✅ Modal manual (Task 8)
- ✅ Upload PDF Gemini (Task 9)
- ✅ Copiar código/PIX + marcar pago + excluir (Task 7)
- ✅ Relatórios pizza + barras + tabela (Task 10)
- ✅ IA análise + histórico (Task 11)
- ✅ Configurações categorias + perfil (Task 12)
- ✅ Seed categorias padrão no cadastro (Task 4)
- ✅ Edição de lançamento (Task 13)
- ✅ Redirect / → /dashboard (Task 13)

**Consistência de tipos:** `criarLancamento`, `marcarComoPago`, `deletarLancamento` todos em `actions/lancamentos.ts`. `extractBillFromPdf` e `analyzeFinances` em `lib/gemini.ts`. Sem conflitos de nomenclatura identificados.
