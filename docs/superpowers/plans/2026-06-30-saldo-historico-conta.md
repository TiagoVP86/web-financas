# Saldo Histórico por Conta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Página de detalhe por conta (`/contas/[id]`) com gráfico de saldo histórico 12 meses, KPIs e extrato paginado; ContaCard vira clicável.

**Architecture:** A matemática do saldo acumulado vira função pura testável (`saldo-historico-calc.ts`) consumida por um helper db (`saldo-historico.ts` → `computeSaldoHistorico`), reusado pelo dashboard (refactor, sem mudança visual) e pela página nova. A página agrega KPIs + extrato paginado por `contaId`. Primeira paginação real do app via componente `Pagination` reutilizável.

**Tech Stack:** Next.js 16 (App Router, server components), Prisma 7 + PostgreSQL (Neon), React 19, recharts, date-fns, vitest, Tailwind.

## Global Constraints

- **AGENTS.md:** este Next.js tem breaking changes vs. training data — conferir `node_modules/next/dist/docs/` antes de inventar API nova. Esta feature só usa padrões já presentes no repo (server components async, `searchParams`/`params` como `Promise`, `notFound()`/`redirect()`).
- **Função pura ≠ db:** lógica testável fica em arquivo SEM `import { db }` (vitest não resolve alias `@/` em value-import e `db.ts` instancia PrismaNeon no load). Espelha `fingerprint.ts`(puro) vs `dedup.ts`(db).
- **Janela:** 12 meses fixos. **KPIs:** 12 meses (entradas/saídas), exceto saldo atual = all-time (bate com ContaCard). **Página do extrato:** 20 itens.
- **Moeda:** `toLocaleString("pt-BR", { style: "currency", currency: "BRL" })`. **Labels de mês:** `format(d, "MMM/yy", { locale: ptBR })`.
- Commits frequentes, um por task.

---

## File Structure

**Novos:**
- `src/lib/saldo-historico-calc.ts` — puro: `acumularSaldo`, tipos `SaldoPonto`, `LinhaMensal`. Sem db.
- `src/lib/saldo-historico-calc.test.ts` — testes unitários (vitest).
- `src/lib/saldo-historico.ts` — `computeSaldoHistorico(userId, { contaId? })` (db + helper puro). Re-exporta `SaldoPonto`.
- `src/components/ui/pagination.tsx` — paginação server-friendly (Links).
- `src/components/contas/saldo-conta-chart.tsx` — AreaChart do saldo (client).
- `src/app/(app)/contas/[id]/page.tsx` — página de detalhe.
- `src/app/(app)/contas/[id]/loading.tsx` — skeleton.
- `src/app/(app)/contas/[id]/not-found.tsx` — 404 da conta.

**Modificados:**
- `src/app/(app)/dashboard/page.tsx` — usa `computeSaldoHistorico` (remove cálculo inline).
- `src/components/contas/conta-card.tsx` — clicável (Link + delete como sibling absoluto).

---

## Task 1: Função pura de acumulação de saldo

**Files:**
- Create: `src/lib/saldo-historico-calc.ts`
- Test: `src/lib/saldo-historico-calc.test.ts`

**Interfaces:**
- Produces: `acumularSaldo(base: number, meses: { label: string; linha: LinhaMensal }[]): SaldoPonto[]`; `interface SaldoPonto { mes: string; saldo: number }`; `interface LinhaMensal { receitas: number; despesas: number }`

- [ ] **Step 1: Escrever os testes que falham**

Create `src/lib/saldo-historico-calc.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { acumularSaldo } from "./saldo-historico-calc"

describe("acumularSaldo", () => {
  it("acumula receita menos despesa mês a mês", () => {
    const r = acumularSaldo(100, [
      { label: "jan", linha: { receitas: 50, despesas: 20 } },
      { label: "fev", linha: { receitas: 0, despesas: 30 } },
    ])
    expect(r).toEqual([
      { mes: "jan", saldo: 130 },
      { mes: "fev", saldo: 100 },
    ])
  })

  it("base negativa e lista vazia retorna vazio", () => {
    expect(acumularSaldo(-50, [])).toEqual([])
  })

  it("preserva ordem partindo de base zero", () => {
    const r = acumularSaldo(0, [
      { label: "a", linha: { receitas: 10, despesas: 0 } },
      { label: "b", linha: { receitas: 0, despesas: 0 } },
      { label: "c", linha: { receitas: 5, despesas: 15 } },
    ])
    expect(r.map((p) => p.saldo)).toEqual([10, 10, 0])
    expect(r.map((p) => p.mes)).toEqual(["a", "b", "c"])
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/lib/saldo-historico-calc.test.ts`
Expected: FAIL — "Cannot find module './saldo-historico-calc'".

- [ ] **Step 3: Implementar o módulo**

Create `src/lib/saldo-historico-calc.ts`:

```ts
export interface SaldoPonto {
  mes: string
  saldo: number
}

export interface LinhaMensal {
  receitas: number
  despesas: number
}

/** Acumula saldo a partir de uma base, aplicando receita−despesa de cada mês em ordem. */
export function acumularSaldo(
  base: number,
  meses: { label: string; linha: LinhaMensal }[],
): SaldoPonto[] {
  let saldo = base
  return meses.map(({ label, linha }) => {
    saldo += linha.receitas - linha.despesas
    return { mes: label, saldo }
  })
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/lib/saldo-historico-calc.test.ts`
Expected: PASS — 3 testes verdes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/saldo-historico-calc.ts src/lib/saldo-historico-calc.test.ts
git commit -m "feat: add pure saldo accumulation helper"
```

---

## Task 2: Helper db `computeSaldoHistorico`

**Files:**
- Create: `src/lib/saldo-historico.ts`

**Interfaces:**
- Consumes: `acumularSaldo`, `SaldoPonto`, `LinhaMensal` de `./saldo-historico-calc` (Task 1).
- Produces: `computeSaldoHistorico(userId: string, opts?: { contaId?: string }): Promise<SaldoPonto[]>`; re-export de `SaldoPonto`.

> Sem teste unitário — depende do Prisma client/DB (mesma decisão de `dedup.ts`). A matemática já é coberta por `saldo-historico-calc.test.ts`. Verificação por `tsc` + uso real nas tasks seguintes.

- [ ] **Step 1: Criar `src/lib/saldo-historico.ts`**

```ts
import { db } from "@/lib/db"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { acumularSaldo, type SaldoPonto } from "./saldo-historico-calc"

export type { SaldoPonto }

/**
 * Série de saldo acumulado dos últimos 12 meses.
 * - Sem contaId: patrimônio consolidado (todas as contas + todos os lançamentos).
 * - Com contaId: saldo daquela conta (saldoInicial dela + lançamentos com aquele contaId).
 */
export async function computeSaldoHistorico(
  userId: string,
  opts?: { contaId?: string },
): Promise<SaldoPonto[]> {
  const contaId = opts?.contaId
  const now = new Date()

  const historyMonths = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, 11 - i)
    return {
      start: startOfMonth(d),
      end: endOfMonth(d),
      label: format(d, "MMM/yy", { locale: ptBR }),
    }
  })
  const windowStart = historyMonths[0].start

  const contaWhere = contaId ? { id: contaId } : {}
  const lancWhere = contaId ? { contaId } : {}

  const [contasAgg, baseLancs, historyMonthly] = await Promise.all([
    db.conta.aggregate({ _sum: { saldoInicial: true }, where: { userId, ...contaWhere } }),
    db.lancamento.groupBy({
      by: ["tipo"],
      where: { userId, ...lancWhere, data: { lt: windowStart } },
      _sum: { valor: true },
    }),
    Promise.all(
      historyMonths.map(({ start, end }) =>
        db.lancamento.groupBy({
          by: ["tipo"],
          where: { userId, ...lancWhere, data: { gte: start, lte: end } },
          _sum: { valor: true },
        }),
      ),
    ),
  ])

  const base =
    Number(contasAgg._sum.saldoInicial ?? 0) +
    Number(baseLancs.find((r) => r.tipo === "RECEITA")?._sum.valor ?? 0) -
    Number(baseLancs.find((r) => r.tipo === "DESPESA")?._sum.valor ?? 0)

  const meses = historyMonths.map(({ label }, i) => {
    const rows = historyMonthly[i]
    return {
      label,
      linha: {
        receitas: Number(rows.find((r) => r.tipo === "RECEITA")?._sum.valor ?? 0),
        despesas: Number(rows.find((r) => r.tipo === "DESPESA")?._sum.valor ?? 0),
      },
    }
  })

  return acumularSaldo(base, meses)
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/lib/saldo-historico.ts
git commit -m "feat: add computeSaldoHistorico db helper"
```

---

## Task 3: Refatorar dashboard para usar o helper

**Files:**
- Modify: `src/app/(app)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `computeSaldoHistorico` (Task 2).

> Objetivo: dashboard produz o MESMO `patrimonioData` de antes, agora via helper. Sem mudança visual. O label de mês do helper (`"MMM/yy"`) é idêntico ao usado hoje no dashboard.

- [ ] **Step 1: Importar o helper**

No topo de `src/app/(app)/dashboard/page.tsx`, após o import de `PatrimonioChart` (linha 6), adicionar:

```ts
import { computeSaldoHistorico } from "@/lib/saldo-historico"
```

- [ ] **Step 2: Remover o bloco `historyMonths`**

Remover estas linhas (50-54):

```ts
  const historyMonths = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, 11 - i)
    return { start: startOfMonth(d), end: endOfMonth(d), label: format(d, "MMM/yy", { locale: ptBR }) }
  })
  const historyWindowStart = historyMonths[0].start
```

- [ ] **Step 3: Trocar o conteúdo do `Promise.all`**

No `const [lancamentos, pendentes, monthlyRaw, contasAgg, baseLancs, historyMonthly] = await Promise.all([ ... ])` (linhas 56-99):

1. Mudar a desestruturação (linha 56) para:

```ts
  const [lancamentos, pendentes, monthlyRaw, patrimonioData] = await Promise.all([
```

2. Remover os três últimos elementos do array — os promises `db.conta.aggregate(...)` (linha 84), `db.lancamento.groupBy({ by: ["tipo"], where: { userId, data: { lt: historyWindowStart } }, ... })` (linhas 85-89) e o `Promise.all(historyMonths.map(...))` (linhas 90-98).

3. Adicionar como último elemento do array (após o `monthlyRaw` `Promise.all([...])`, antes do fechamento `])`):

```ts
    computeSaldoHistorico(userId),
```

- [ ] **Step 4: Remover o cálculo inline de `patrimonioData`**

Remover estas linhas (101-112):

```ts
  let runningPatrimonio =
    Number(contasAgg._sum.saldoInicial ?? 0) +
    Number(baseLancs.find((r) => r.tipo === "RECEITA")?._sum.valor ?? 0) -
    Number(baseLancs.find((r) => r.tipo === "DESPESA")?._sum.valor ?? 0)

  const patrimonioData = historyMonths.map(({ label }, i) => {
    const rows = historyMonthly[i]
    runningPatrimonio +=
      Number(rows.find((r) => r.tipo === "RECEITA")?._sum.valor ?? 0) -
      Number(rows.find((r) => r.tipo === "DESPESA")?._sum.valor ?? 0)
    return { mes: label, saldo: runningPatrimonio }
  })
```

(`patrimonioData` agora vem do `Promise.all`. O `<PatrimonioChart data={patrimonioData} />` mais abaixo permanece igual.)

- [ ] **Step 5: Verificar build/lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sem erros. Se o lint acusar import não usado (`startOfMonth`/`endOfMonth`/`subMonths`/`format`/`ptBR`), conferir: `monthlyRaw` (linhas ~70-82) ainda usa `subMonths`, `startOfMonth`, `endOfMonth`, `format`, `ptBR` — então todos permanecem usados. Não remover.

- [ ] **Step 6: Verificação manual — dashboard inalterado**

Run: `npm run dev`, abrir `/dashboard`.
Expected: o card "Patrimônio Líquido" renderiza idêntico ao de antes (mesma curva, mesmo "% nos últimos 12 meses"). Encerrar com Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add src/app/\(app\)/dashboard/page.tsx
git commit -m "refactor: dashboard uses shared computeSaldoHistorico"
```

---

## Task 4: Componente `Pagination`

**Files:**
- Create: `src/components/ui/pagination.tsx`

**Interfaces:**
- Produces: `Pagination(props: { page: number; totalPages: number; baseHref: string }): JSX.Element | null`. Renderiza nada quando `totalPages <= 1`. Linka para `${baseHref}?page=N`.

- [ ] **Step 1: Criar `src/components/ui/pagination.tsx`**

```tsx
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  page: number
  totalPages: number
  /** Base da URL; `?page=N` é anexado. Ex.: "/contas/abc123" */
  baseHref: string
}

export function Pagination({ page, totalPages, baseHref }: PaginationProps) {
  if (totalPages <= 1) return null

  const prev = Math.max(1, page - 1)
  const next = Math.min(totalPages, page + 1)
  const linkClass =
    "inline-flex h-9 items-center gap-1 rounded-lg border border-input bg-background px-3 text-sm transition-colors hover:bg-accent"
  const disabled = "pointer-events-none opacity-50"

  return (
    <div className="flex items-center justify-between">
      <Link
        href={`${baseHref}?page=${prev}`}
        aria-disabled={page <= 1}
        className={cn(linkClass, page <= 1 && disabled)}
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Link>
      <span className="text-sm text-muted-foreground tabular-nums">
        Página {page} de {totalPages}
      </span>
      <Link
        href={`${baseHref}?page=${next}`}
        aria-disabled={page >= totalPages}
        className={cn(linkClass, page >= totalPages && disabled)}
      >
        Próxima
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build/lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/pagination.tsx
git commit -m "feat: add reusable Pagination component"
```

---

## Task 5: Componente `SaldoContaChart`

**Files:**
- Create: `src/components/contas/saldo-conta-chart.tsx`

**Interfaces:**
- Consumes: `SaldoPonto[]` (formato `{ mes: string; saldo: number }[]`).
- Produces: `SaldoContaChart(props: { data: { mes: string; saldo: number }[] }): JSX.Element`.

> Mesmo estilo visual do `PatrimonioChart` (AreaChart + gradiente), mas só o gráfico (sem Card nem título — a página compõe). Gradiente com id próprio `saldoContaGrad` (instância única por página).

- [ ] **Step 1: Criar `src/components/contas/saldo-conta-chart.tsx`**

```tsx
"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip, fmtBRLShort } from "@/components/charts/chart-helpers"

interface SaldoContaChartProps {
  data: { mes: string; saldo: number }[]
}

export function SaldoContaChart({ data }: SaldoContaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
        <defs>
          <linearGradient id="saldoContaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
        <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />
        <XAxis
          dataKey="mes"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          dy={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={52}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickFormatter={fmtBRLShort}
        />
        <Tooltip cursor={{ stroke: "var(--border)", strokeWidth: 1 }} content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="saldo"
          name="Saldo"
          stroke="var(--primary)"
          strokeWidth={2.5}
          fill="url(#saldoContaGrad)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 2: Verificar build/lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/contas/saldo-conta-chart.tsx
git commit -m "feat: add per-account balance area chart"
```

---

## Task 6: ContaCard clicável

**Files:**
- Modify: `src/components/contas/conta-card.tsx`

> O `DeleteContaButton` sai de dentro do conteúdo e vira **sibling absoluto** (não-descendente) do `<Link>` — assim não há `<button>` dentro de `<a>` (HTML inválido) e nem precisa de `stopPropagation`, pois o botão não está na subárvore do link.

- [ ] **Step 1: Reescrever o componente**

Substituir o corpo de `export function ContaCard` (linhas 20-56) por:

```tsx
export function ContaCard({ conta }: { conta: ContaItem }) {
  const Icon = TIPO_ICONS[conta.tipo]

  return (
    <div className="relative rounded-xl bg-card ring-1 ring-foreground/10 p-4 transition-colors hover:ring-foreground/20">
      <div className="absolute right-3 top-3 z-10">
        <DeleteContaButton id={conta.id} nome={conta.nome} />
      </div>

      <Link href={`/contas/${conta.id}`} className="block space-y-3">
        <div className="flex items-start gap-3 pr-8 min-w-0">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: conta.cor }}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{conta.nome}</p>
            <p className="text-xs text-muted-foreground">{TIPO_CONTA_LABELS[conta.tipo]}</p>
          </div>
        </div>

        <div className="border-t border-border/50 pt-3">
          <p className="text-xs text-muted-foreground mb-0.5">Saldo atual</p>
          <p className={cn("text-xl font-bold tabular-nums", saldoClass(conta.saldo))}>
            {fmt(conta.saldo)}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{conta.totalLancamentos} lançamento{conta.totalLancamentos !== 1 ? "s" : ""}</span>
          {conta.saldoInicial !== 0 && (
            <span>Saldo inicial: {fmt(conta.saldoInicial)}</span>
          )}
        </div>
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Adicionar o import de `Link`**

No topo do arquivo, após o import de lucide-react (linha 1), adicionar:

```tsx
import Link from "next/link"
```

- [ ] **Step 3: Verificar build/lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sem erros.

- [ ] **Step 4: Verificação manual**

Run: `npm run dev`, abrir `/contas`.
Expected: clicar num card navega para `/contas/[id]` (página ainda 404/placeholder até Task 7 — ok); clicar no ícone de lixeira abre o diálogo de exclusão SEM navegar. Encerrar com Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add src/components/contas/conta-card.tsx
git commit -m "feat: make ContaCard link to account detail"
```

---

## Task 7: Página de detalhe `/contas/[id]`

**Files:**
- Create: `src/app/(app)/contas/[id]/page.tsx`
- Create: `src/app/(app)/contas/[id]/loading.tsx`
- Create: `src/app/(app)/contas/[id]/not-found.tsx`

**Interfaces:**
- Consumes: `computeSaldoHistorico` (Task 2), `SaldoContaChart` (Task 5), `Pagination` (Task 4), `LancamentosTable` (existente, `@/components/lancamentos/lancamentos-table`).

> `LancamentosTable` espera linhas no formato `LancamentoRow` (`valor` number/string, `data: Date`, `categoria: { nome, cor, icone? } | null`, `conta: { id, nome } | null`). Passar `valor: Number(l.valor)`. Saldo atual = `saldoInicial + todas receitas − todas despesas` da conta (all-time, bate com ContaCard). Entradas/saídas = 12 meses.

- [ ] **Step 1: Criar `not-found.tsx`**

Create `src/app/(app)/contas/[id]/not-found.tsx`:

```tsx
import Link from "next/link"
import { Landmark } from "lucide-react"

export default function ContaNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-card p-12 text-center ring-1 ring-foreground/10">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Landmark className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium">Conta não encontrada</p>
        <p className="text-sm text-muted-foreground">
          Essa conta não existe ou não pertence a você.
        </p>
      </div>
      <Link href="/contas" className="text-sm font-medium text-primary hover:underline">
        Voltar para contas
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Criar `loading.tsx`**

Create `src/app/(app)/contas/[id]/loading.tsx`:

```tsx
function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
}

export default function ContaDetalheLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Bone className="h-4 w-28" />
        <Bone className="h-8 w-48" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-card ring-1 ring-foreground/10 p-4 space-y-2">
            <Bone className="h-3 w-20" />
            <Bone className="h-6 w-28" />
          </div>
        ))}
      </div>
      <Bone className="h-60 w-full rounded-xl" />
      <Bone className="h-72 w-full rounded-xl" />
    </div>
  )
}
```

- [ ] **Step 3: Criar `page.tsx`**

Create `src/app/(app)/contas/[id]/page.tsx`:

```tsx
import type { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building2, PiggyBank, TrendingUp, CreditCard, Banknote } from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { computeSaldoHistorico } from "@/lib/saldo-historico"
import { SaldoContaChart } from "@/components/contas/saldo-conta-chart"
import { LancamentosTable } from "@/components/lancamentos/lancamentos-table"
import { Pagination } from "@/components/ui/pagination"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TIPO_CONTA_LABELS, type TipoConta } from "@/types/conta"
import { subMonths, startOfMonth } from "date-fns"

export const metadata: Metadata = { title: "Conta" }

const PAGE_SIZE = 20
const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

const TIPO_ICONS: Record<TipoConta, React.ElementType> = {
  CORRENTE:     Building2,
  POUPANCA:     PiggyBank,
  INVESTIMENTO: TrendingUp,
  CARTAO:       CreditCard,
  DINHEIRO:     Banknote,
}

export default async function ContaDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const { id } = await params
  const sp = await searchParams

  const conta = await db.conta.findFirst({ where: { id, userId } })
  if (!conta) notFound()

  const total = await db.lancamento.count({ where: { userId, contaId: id } })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pageRaw = sp.page ? parseInt(sp.page) : 1
  const page = Number.isNaN(pageRaw) ? 1 : Math.min(Math.max(1, pageRaw), totalPages)

  const windowStart = startOfMonth(subMonths(new Date(), 11))

  const [serie, kpis12m, saldoAgg, lancamentos] = await Promise.all([
    computeSaldoHistorico(userId, { contaId: id }),
    db.lancamento.groupBy({
      by: ["tipo"],
      where: { userId, contaId: id, data: { gte: windowStart } },
      _sum: { valor: true },
    }),
    db.lancamento.groupBy({
      by: ["tipo"],
      where: { userId, contaId: id },
      _sum: { valor: true },
    }),
    db.lancamento.findMany({
      where: { userId, contaId: id },
      orderBy: { data: "desc" },
      include: { categoria: true, conta: { select: { id: true, nome: true } } },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
  ])

  const entradas12m = Number(kpis12m.find((r) => r.tipo === "RECEITA")?._sum.valor ?? 0)
  const saidas12m = Number(kpis12m.find((r) => r.tipo === "DESPESA")?._sum.valor ?? 0)

  const saldoAtual =
    Number(conta.saldoInicial) +
    Number(saldoAgg.find((r) => r.tipo === "RECEITA")?._sum.valor ?? 0) -
    Number(saldoAgg.find((r) => r.tipo === "DESPESA")?._sum.valor ?? 0)

  const primeiro = serie[0]?.saldo ?? 0
  const ultimo = serie[serie.length - 1]?.saldo ?? 0
  const variacaoPct = primeiro !== 0 ? ((ultimo - primeiro) / Math.abs(primeiro)) * 100 : null

  const Icon = TIPO_ICONS[conta.tipo as TipoConta]
  const saldoClass = saldoAtual > 0 ? "text-receita" : saldoAtual < 0 ? "text-despesa" : "text-foreground"

  const rows = lancamentos.map((l) => ({ ...l, valor: Number(l.valor) }))

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/contas"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Contas
        </Link>
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: conta.cor }}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{conta.nome}</h1>
            <p className="text-sm text-muted-foreground">{TIPO_CONTA_LABELS[conta.tipo as TipoConta]}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
          <p className="text-xs text-muted-foreground">Saldo atual</p>
          <p className={`text-lg font-bold tabular-nums ${saldoClass}`}>{fmt(saldoAtual)}</p>
        </div>
        <div className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
          <p className="text-xs text-muted-foreground">Entradas (12m)</p>
          <p className="text-lg font-bold tabular-nums text-receita">{fmt(entradas12m)}</p>
        </div>
        <div className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
          <p className="text-xs text-muted-foreground">Saídas (12m)</p>
          <p className="text-lg font-bold tabular-nums text-despesa">{fmt(saidas12m)}</p>
        </div>
        <div className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
          <p className="text-xs text-muted-foreground">Variação (12m)</p>
          <p className={`text-lg font-bold tabular-nums ${variacaoPct == null || variacaoPct >= 0 ? "text-receita" : "text-despesa"}`}>
            {variacaoPct == null ? "—" : `${variacaoPct >= 0 ? "+" : ""}${variacaoPct.toFixed(1)}%`}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Saldo nos últimos 12 meses</CardTitle>
        </CardHeader>
        <CardContent>
          <SaldoContaChart data={serie} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Extrato {total > 0 && <span className="font-normal">· {total} lançamento{total !== 1 ? "s" : ""}</span>}
        </h2>
        <LancamentosTable lancamentos={rows} />
        <Pagination page={page} totalPages={totalPages} baseHref={`/contas/${id}`} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verificar build/lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sem erros. Se `tsc` reclamar do tipo de `rows` em `LancamentosTable`, conferir que `include: { categoria: true, conta: { select: { id, nome } } }` está presente (a tabela lê `l.categoria` e `l.conta`).

- [ ] **Step 5: Verificação manual E2E**

Run: `npm run dev`. Pré-condição: ter ≥1 conta com saldo inicial e alguns lançamentos atribuídos a ela.
1. `/contas` → clicar num card → abre `/contas/[id]`.
2. Saldo atual no topo == saldo mostrado no ContaCard da `/contas`.
3. Chart desenha 12 pontos; curva coerente com entradas/saídas.
4. Extrato lista lançamentos daquela conta; com >20 lançamentos, "Próxima" navega (`?page=2`) e muda as linhas.
5. Acessar `/contas/<id-inexistente>` → renderiza "Conta não encontrada" (404).
6. Encerrar com Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(app\)/contas/\[id\]
git commit -m "feat: per-account detail page with history, KPIs and statement"
```

---

## Verificação Final

- [ ] **Suite de testes:** `npx vitest run` → todos verdes (inclui `saldo-historico-calc.test.ts`).
- [ ] **Tipos + lint:** `npx tsc --noEmit && npm run lint` → sem erros.
- [ ] **Build:** `npm run build` → sucesso.
- [ ] **Regressão dashboard:** patrimônio consolidado idêntico ao anterior (Task 3).
- [ ] **Smoke da feature:** navegação `/contas` → detalhe, saldo bate, chart 12m, extrato paginado, 404 de conta alheia (Task 7).

---

## Notas de Design

- **Saldo atual all-time vs. série 12m:** o KPI de saldo atual soma todos os lançamentos (sem filtro de data) pra bater com o ContaCard mesmo quando há lançamentos futuros de parcelamento. A série/chart para no mês corrente — então o último ponto da série pode diferir do KPI quando existirem lançamentos futuros. É intencional.
- **IDOR:** `findFirst({ where: { id, userId } })` garante que o usuário só vê suas contas; conta alheia/inexistente → `notFound()`.
- **`contaId` null:** lançamentos sem conta não entram em nenhum detalhe (where sempre filtra `contaId`). Continuam no consolidado do dashboard (helper sem `contaId`).
- **Paginação:** componente em `ui/` por ser genérico; primeiro uso real aqui, reutilizável em `/lancamentos` no futuro (fora de escopo).
