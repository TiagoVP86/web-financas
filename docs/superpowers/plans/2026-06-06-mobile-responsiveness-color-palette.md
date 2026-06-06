# Mobile Responsiveness & Color Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refatorar a paleta de cores para um visual fintech moderno (dark: zinc-950 + violet-500) e adicionar card view mobile nas páginas com tabelas.

**Architecture:** Fase 1 troca CSS variables em `globals.css` — mudança global via design tokens sem tocar em lógica. Fase 2 adiciona dual-view pattern (tabela no desktop, cards empilhados no mobile) usando `hidden md:block` + `md:hidden`. Nenhuma lógica de negócio é alterada.

**Tech Stack:** Tailwind CSS v4 (oklch, `@theme inline`), shadcn/ui, Next.js App Router, date-fns, sonner (toast), next-auth server actions.

---

## File Map

| Arquivo | Operação | Responsabilidade |
|---|---|---|
| `src/app/globals.css` | Modify | CSS variables: paleta light + dark + tokens receita/despesa |
| `src/components/recorrencias/recorrencia-card.tsx` | Modify | text-green-500/red-500 → text-receita/despesa |
| `src/components/dashboard/summary-cards.tsx` | Modify | idem |
| `src/components/extrato/extrato-resumo-card.tsx` | Modify | idem |
| `src/components/extrato/transacoes-table.tsx` | Modify | idem |
| `src/app/(app)/ia/page.tsx` | Modify | idem + dual-view mobile |
| `src/components/lancamentos/lancamentos-table.tsx` | Modify | Export `LancamentoRow` + dual-view + color tokens |
| `src/components/lancamentos/lancamento-card.tsx` | Create | Card view para uma linha de lançamento no mobile |
| `src/components/ia/analise-card.tsx` | Modify | text-green-500 → text-emerald-500 (semântica positiva, não receita) |
| `src/app/(app)/relatorios/page.tsx` | Modify | Wrap tabela categoria com overflow-x-auto |

---

## Task 1: Paleta — CSS Variables

**Files:**
- Modify: `src/app/globals.css`

Context: O projeto usa Tailwind v4. Cores são definidas como CSS custom properties em formato oklch nos blocos `:root` (light) e `.dark`. O bloco `@theme inline` mapeia essas variáveis para tokens Tailwind (gerando classes como `bg-primary`, `text-muted-foreground`). Vamos trocar toda a paleta e adicionar tokens `receita`/`despesa`.

- [ ] **Step 1: Substituir o bloco `:root` (light mode)**

Abrir `src/app/globals.css` e substituir o bloco `:root` inteiro (linhas 51–84) pelo seguinte:

```css
:root {
  --background: oklch(0.985 0 0);
  --foreground: oklch(0.14 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.14 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.14 0 0);
  --primary: oklch(0.52 0.233 277);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.96 0 0);
  --secondary-foreground: oklch(0.14 0 0);
  --muted: oklch(0.96 0 0);
  --muted-foreground: oklch(0.50 0 0);
  --accent: oklch(0.94 0.01 277);
  --accent-foreground: oklch(0.14 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.90 0 0);
  --input: oklch(0.90 0 0);
  --ring: oklch(0.52 0.233 277);
  --chart-1: oklch(0.52 0.233 277);
  --chart-2: oklch(0.60 0.17 162);
  --chart-3: oklch(0.55 0.246 16);
  --chart-4: oklch(0.55 0.15 230);
  --chart-5: oklch(0.55 0.15 310);
  --radius: 0.625rem;
  --sidebar: oklch(0.97 0 0);
  --sidebar-foreground: oklch(0.14 0 0);
  --sidebar-primary: oklch(0.52 0.233 277);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.94 0.01 277);
  --sidebar-accent-foreground: oklch(0.14 0 0);
  --sidebar-border: oklch(0.90 0 0);
  --sidebar-ring: oklch(0.52 0.233 277);
  --receita: oklch(0.60 0.17 162);
  --despesa: oklch(0.55 0.246 16);
}
```

- [ ] **Step 2: Substituir o bloco `.dark` (dark mode)**

Substituir o bloco `.dark` inteiro (linhas 86–118) pelo seguinte:

```css
.dark {
  --background: oklch(0.07 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.14 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.14 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.585 0.233 277);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.20 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.20 0 0);
  --muted-foreground: oklch(0.65 0 0);
  --accent: oklch(0.24 0.025 277);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.644 0.246 16);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.585 0.233 277);
  --chart-1: oklch(0.585 0.233 277);
  --chart-2: oklch(0.696 0.17 162);
  --chart-3: oklch(0.644 0.246 16);
  --chart-4: oklch(0.75 0.15 230);
  --chart-5: oklch(0.70 0.15 310);
  --sidebar: oklch(0.11 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.585 0.233 277);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.20 0.01 277);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.585 0.233 277);
  --receita: oklch(0.696 0.17 162);
  --despesa: oklch(0.644 0.246 16);
}
```

- [ ] **Step 3: Adicionar tokens receita/despesa ao bloco `@theme inline`**

No bloco `@theme inline` (que começa na linha 7), adicionar as duas linhas abaixo após `--color-card-foreground: var(--card-foreground);`:

```css
  --color-receita: var(--receita);
  --color-despesa: var(--despesa);
```

O bloco completo `@theme inline` deve ficar assim (as linhas novas estão marcadas com `← NOVO`):

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-sans);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --color-receita: var(--receita);    /* ← NOVO */
  --color-despesa: var(--despesa);    /* ← NOVO */
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}
```

- [ ] **Step 4: Verificar build**

```bash
npm run build
```

Esperado: sem erros de TypeScript ou CSS. Se aparecer erro de CSS, revisar sintaxe das variáveis oklch.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: update color palette to fintech moderno (violet/emerald/rose)"
```

---

## Task 2: Color Token Migration

**Files:**
- Modify: `src/components/recorrencias/recorrencia-card.tsx`
- Modify: `src/components/dashboard/summary-cards.tsx`
- Modify: `src/components/extrato/extrato-resumo-card.tsx`
- Modify: `src/components/extrato/transacoes-table.tsx`
- Modify: `src/components/ia/analise-card.tsx`

Context: Após Task 1, os tokens `text-receita` e `text-despesa` estão disponíveis como classes Tailwind. Esta task substitui todas as ocorrências semânticas de `text-green-*` e `text-red-*` (que representam receita/despesa) por esses tokens. O ícone `Check` em `lancamentos-table.tsx` (linha 117) mantém `text-green-500` pois representa estado de UI, não receita — será tratado na Task 4.

- [ ] **Step 1: Atualizar `recorrencia-card.tsx`**

Arquivo: `src/components/recorrencias/recorrencia-card.tsx`

Localizar (linha ~62):
```tsx
<p className={`text-lg font-bold ${r.tipo === "RECEITA" ? "text-green-500" : "text-red-500"}`}>
```

Substituir por:
```tsx
<p className={`text-lg font-bold ${r.tipo === "RECEITA" ? "text-receita" : "text-despesa"}`}>
```

- [ ] **Step 2: Atualizar `summary-cards.tsx`**

Arquivo: `src/components/dashboard/summary-cards.tsx`

Substituir o conteúdo completo do arquivo por:

```tsx
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
          <TrendingUp className="h-4 w-4 text-receita" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-receita">{fmt(receitas)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Despesas do mês</CardTitle>
          <TrendingDown className="h-4 w-4 text-despesa" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-despesa">{fmt(despesas)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${saldo >= 0 ? "text-primary" : "text-despesa"}`}>
            {fmt(saldo)}
          </div>
        </CardContent>
      </Card>

      <Card>
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

- [ ] **Step 3: Atualizar `extrato-resumo-card.tsx`**

Arquivo: `src/components/extrato/extrato-resumo-card.tsx`

Substituir o conteúdo completo por:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { AnaliseExtratoResponse } from "@/types/extrato"

interface ExtratoResumoCardProps {
  analise: Pick<
    AnaliseExtratoResponse,
    "nomeArquivo" | "resumo" | "periodo" | "totalReceitas" | "totalDespesas" | "saldo"
  >
}

export function ExtratoResumoCard({ analise }: ExtratoResumoCardProps) {
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Sofia — {analise.periodo}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{analise.nomeArquivo}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{analise.resumo}</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-receita">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs font-medium">Receitas</span>
            </div>
            <p className="mt-1 text-sm font-bold text-receita">
              {fmt(analise.totalReceitas)}
            </p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-despesa">
              <TrendingDown className="h-3 w-3" />
              <span className="text-xs font-medium">Despesas</span>
            </div>
            <p className="mt-1 text-sm font-bold text-despesa">
              {fmt(analise.totalDespesas)}
            </p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Minus className="h-3 w-3" />
              <span className="text-xs font-medium">Saldo</span>
            </div>
            <p
              className={`mt-1 text-sm font-bold ${
                analise.saldo >= 0 ? "text-receita" : "text-despesa"
              }`}
            >
              {fmt(analise.saldo)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Atualizar `transacoes-table.tsx`**

Arquivo: `src/components/extrato/transacoes-table.tsx`

Localizar linha ~143:
```tsx
<span className={t.tipo === "RECEITA" ? "text-green-500" : "text-red-500"}>
```
Substituir por:
```tsx
<span className={t.tipo === "RECEITA" ? "text-receita" : "text-despesa"}>
```

Localizar linha ~152-154:
```tsx
className={`px-3 py-2 text-right font-medium whitespace-nowrap ${
  t.tipo === "RECEITA" ? "text-green-500" : ""
}`}
```
Substituir por:
```tsx
className={`px-3 py-2 text-right font-medium whitespace-nowrap ${
  t.tipo === "RECEITA" ? "text-receita" : ""
}`}
```

- [ ] **Step 5: Atualizar `analise-card.tsx`**

Arquivo: `src/components/ia/analise-card.tsx`

Localizar linha ~32:
```tsx
<h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-green-500">
```
Substituir por:
```tsx
<h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-emerald-500">
```

Nota: usa `text-emerald-500` (não `text-receita`) porque representa sentimento positivo, não entrada financeira.

- [ ] **Step 6: Verificar build**

```bash
npm run build
```

Esperado: compilação limpa.

- [ ] **Step 7: Commit**

```bash
git add src/components/recorrencias/recorrencia-card.tsx \
        src/components/dashboard/summary-cards.tsx \
        src/components/extrato/extrato-resumo-card.tsx \
        src/components/extrato/transacoes-table.tsx \
        src/components/ia/analise-card.tsx
git commit -m "feat: migrate color classes to receita/despesa tokens"
```

---

## Task 3: Criar `LancamentoCard` (card view mobile)

**Files:**
- Modify: `src/components/lancamentos/lancamentos-table.tsx` (exportar `LancamentoRow`)
- Create: `src/components/lancamentos/lancamento-card.tsx`

Context: O componente `LancamentoCard` renderiza uma linha de lançamento como card vertical para telas mobile. Importa `LancamentoRow` de `lancamentos-table.tsx` (que precisa ser exported). Chama as mesmas server actions `marcarComoPago` e `deletarLancamento` que a tabela usa.

- [ ] **Step 1: Exportar `LancamentoRow` de `lancamentos-table.tsx`**

Arquivo: `src/components/lancamentos/lancamentos-table.tsx`

Localizar (linha 15):
```tsx
interface LancamentoRow {
```
Substituir por:
```tsx
export interface LancamentoRow {
```

- [ ] **Step 2: Criar `lancamento-card.tsx`**

Criar o arquivo `src/components/lancamentos/lancamento-card.tsx` com o seguinte conteúdo:

```tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Copy, Check, Trash2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { marcarComoPago, deletarLancamento } from "@/actions/lancamentos"
import Link from "next/link"
import { StatusBadge } from "./status-badge"
import type { LancamentoRow } from "./lancamentos-table"

interface LancamentoCardProps {
  lancamento: LancamentoRow
}

export function LancamentoCard({ lancamento: l }: LancamentoCardProps) {
  const fmt = (v: unknown) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const copiar = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`)
  }

  return (
    <div className="rounded-lg border p-3 space-y-2">
      {/* Descrição + tipo */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-sm leading-snug">{l.descricao}</span>
        <Badge
          variant="outline"
          className={`shrink-0 text-xs ${
            l.tipo === "RECEITA"
              ? "border-receita text-receita"
              : "border-despesa text-despesa"
          }`}
        >
          {l.tipo === "RECEITA" ? "Receita" : "Despesa"}
        </Badge>
      </div>

      {/* Categoria + data */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {l.categoria ? (
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: l.categoria.cor }}
              />
              {l.categoria.nome}
            </span>
          ) : (
            "Sem categoria"
          )}
        </span>
        <span>{format(new Date(l.data), "dd/MM/yyyy", { locale: ptBR })}</span>
      </div>

      {/* Status + valor */}
      <div className="flex items-center justify-between">
        <StatusBadge status={l.status} />
        <span
          className={`font-bold text-sm ${
            l.tipo === "RECEITA" ? "text-receita" : "text-despesa"
          }`}
        >
          {l.tipo === "RECEITA" ? "+" : "-"}
          {fmt(l.valor)}
        </span>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1 border-t pt-2">
        {l.codigoBarras && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copiar(l.codigoBarras!, "Código de barras")}
            className="h-8 px-2 text-xs"
          >
            <Copy className="mr-1 h-3 w-3" />
            Cód. Barras
          </Button>
        )}
        {l.chavePix && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copiar(l.chavePix!, "Chave PIX")}
            className="h-8 px-2 text-xs"
          >
            <Copy className="mr-1 h-3 w-3" />
            PIX
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1">
          {(l.status === "PENDENTE" || l.status === "VENCIDO") && (
            <form action={marcarComoPago.bind(null, l.id)}>
              <Button variant="ghost" size="sm" type="submit" className="h-8 px-2 text-xs">
                <Check className="mr-1 h-3 w-3 text-green-500" />
                Pagar
              </Button>
            </form>
          )}
          <Link
            href={`/lancamentos/${l.id}/editar`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <form action={deletarLancamento.bind(null, l.id)}>
            <Button variant="ghost" size="icon" type="submit" className="h-8 w-8">
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

Esperado: compilação limpa, sem erros de tipo em `LancamentoCard`.

- [ ] **Step 4: Commit**

```bash
git add src/components/lancamentos/lancamentos-table.tsx \
        src/components/lancamentos/lancamento-card.tsx
git commit -m "feat: create LancamentoCard component for mobile view"
```

---

## Task 4: LancamentosTable — Dual-View + Color Tokens

**Files:**
- Modify: `src/components/lancamentos/lancamentos-table.tsx`

Context: Adicionar dual-view pattern e migrar `text-green-500`/`text-red-500` semânticos para `text-receita`/`text-despesa`. O ícone `Check` da ação "pagar" mantém `text-green-500` (cor de UI, não receita). A tabela existente fica visível em `md:+`, os cards ficam visíveis em `< md`.

- [ ] **Step 1: Substituir o conteúdo completo de `lancamentos-table.tsx`**

Arquivo: `src/components/lancamentos/lancamentos-table.tsx`

```tsx
"use client"

import { StatusBadge } from "./status-badge"
import { LancamentoCard } from "./lancamento-card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { marcarComoPago, deletarLancamento } from "@/actions/lancamentos"
import Link from "next/link"

type Status = "PENDENTE" | "PAGO" | "VENCIDO" | "REALIZADO"
type Tipo = "RECEITA" | "DESPESA"

export interface LancamentoRow {
  id: string
  descricao: string
  valor: { toString(): string } | number | string
  tipo: Tipo
  data: Date
  status: Status
  codigoBarras: string | null
  chavePix: string | null
  categoria: { nome: string; cor: string } | null
}

interface LancamentosTableProps {
  lancamentos: LancamentoRow[]
}

export function LancamentosTable({ lancamentos }: LancamentosTableProps) {
  const fmt = (v: unknown) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

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
    <>
      {/* Mobile: card list */}
      <div className="md:hidden space-y-2">
        {lancamentos.map((l) => (
          <LancamentoCard key={l.id} lancamento={l} />
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block rounded-lg border overflow-hidden">
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
                    <span className={l.tipo === "RECEITA" ? "text-receita" : "text-despesa"}>
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
                <td className={`px-4 py-3 text-right font-medium ${l.tipo === "RECEITA" ? "text-receita" : ""}`}>
                  {fmt(l.valor)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={l.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {l.codigoBarras && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copiar(l.codigoBarras!, "Código de barras")}
                        title="Copiar código de barras"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                    {l.chavePix && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copiar(l.chavePix!, "Chave PIX")}
                        title="Copiar PIX"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                    {(l.status === "PENDENTE" || l.status === "VENCIDO") && (
                      <form action={marcarComoPago.bind(null, l.id)}>
                        <Button variant="ghost" size="icon" title="Marcar como pago" type="submit">
                          <Check className="h-3 w-3 text-green-500" />
                        </Button>
                      </form>
                    )}
                    <Link
                      href={`/lancamentos/${l.id}/editar`}
                      title="Editar"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
                    >
                      <Pencil className="h-3 w-3" />
                    </Link>
                    <form action={deletarLancamento.bind(null, l.id)}>
                      <Button variant="ghost" size="icon" title="Excluir" type="submit">
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
    </>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Esperado: compilação limpa.

- [ ] **Step 3: Commit**

```bash
git add src/components/lancamentos/lancamentos-table.tsx
git commit -m "feat: add mobile card view to LancamentosTable"
```

---

## Task 5: IA Page — Dual-View Mobile

**Files:**
- Modify: `src/app/(app)/ia/page.tsx`

Context: A tabela de lançamentos na página IA é somente leitura (sem ações de editar/excluir). O card mobile é mais simples que o `LancamentoCard` — apenas exibe descrição, data, valor e status. O dual-view é implementado inline (sem componente separado).

- [ ] **Step 1: Substituir o bloco da tabela em `ia/page.tsx`**

Localizar o bloco que começa com `<div className="max-h-64 overflow-y-auto rounded-md border">` (linha ~86) e termina com `</div>` que fecha o `CardContent`.

Substituir todo esse bloco por:

```tsx
          {lancamentos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum lançamento no período.</p>
          ) : (
            <>
              {/* Mobile: cards */}
              <div className="md:hidden max-h-64 overflow-y-auto space-y-2">
                {lancamentos.map((l) => (
                  <div key={l.id} className="rounded-lg border p-3 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-snug">{l.descricao}</span>
                      <Badge variant={statusVariant[l.status] ?? "outline"} className="shrink-0 text-xs">
                        {statusLabel[l.status] ?? l.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(l.data), "dd/MM/yy", { locale: ptBR })}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          l.tipo === "RECEITA" ? "text-receita" : "text-despesa"
                        }`}
                      >
                        {l.tipo === "RECEITA" ? "+" : "-"}
                        {fmt(Number(l.valor))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block max-h-64 overflow-y-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Descrição</th>
                      <th className="px-3 py-2 text-left font-medium">Data</th>
                      <th className="px-3 py-2 text-right font-medium">Valor</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lancamentos.map((l) => (
                      <tr key={l.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-3 py-2">
                          <span className={l.tipo === "RECEITA" ? "text-receita" : "text-despesa"}>
                            {l.tipo === "RECEITA" ? "+" : "-"}
                          </span>{" "}
                          {l.descricao}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {format(new Date(l.data), "dd/MM/yy", { locale: ptBR })}
                        </td>
                        <td className={`px-3 py-2 text-right font-medium ${l.tipo === "RECEITA" ? "text-receita" : ""}`}>
                          {fmt(Number(l.valor))}
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={statusVariant[l.status] ?? "outline"}>
                            {statusLabel[l.status] ?? l.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Esperado: compilação limpa.

- [ ] **Step 3: Commit**

```bash
git add src/app/(app)/ia/page.tsx
git commit -m "feat: add mobile card view to IA page lançamentos table"
```

---

## Task 6: Relatórios — Overflow Scroll na Tabela de Categorias

**Files:**
- Modify: `src/app/(app)/relatorios/page.tsx`

Context: A tabela "Resumo por Categoria" tem 3 colunas (categoria, total, %). Com `overflow-x-auto` no wrapper e `min-w-full` na tabela, o conteúdo não quebra em telas pequenas — aparece scroll horizontal apenas quando necessário.

- [ ] **Step 1: Adicionar wrapper `overflow-x-auto` na tabela de categorias**

Arquivo: `src/app/(app)/relatorios/page.tsx`

Localizar (linha ~108):
```tsx
            <table className="w-full text-sm">
```

Substituir apenas essa linha por:
```tsx
            <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
```

Localizar o `</table>` correspondente (linha ~138) e adicionar `</div>` após:
```tsx
            </table>
            </div>
```

O bloco completo da tabela deve ficar assim:

```tsx
          {pieData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem despesas no período.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
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
                        <td className="py-2">
                          <span className="flex items-center gap-2">
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ background: c.cor }}
                            />
                            {c.nome}
                          </span>
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
            </div>
          )}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Esperado: compilação limpa.

- [ ] **Step 3: Commit**

```bash
git add src/app/(app)/relatorios/page.tsx
git commit -m "feat: add overflow-x-auto to relatorios category table"
```

---

## Checklist Final (Critérios de Aceitação)

- [ ] Dark mode: fundo zinc-950, cards zinc-900, primário violet-500 visível na sidebar e botões
- [ ] Light mode: fundo zinc-50, primário violet-600 visível na sidebar e botões
- [ ] Classes `text-receita` e `text-despesa` renderizam cores corretas em ambos os modos
- [ ] Nenhuma ocorrência semântica de `text-green-500`/`text-red-500` restante (verificar com grep)
- [ ] Em viewport < 768px: `/lancamentos` exibe cards, não tabela
- [ ] Em viewport < 768px: `/ia` exibe cards, não tabela
- [ ] Em viewport < 768px: `/relatorios` tabela de categorias faz scroll horizontal se necessário
- [ ] Em viewport ≥ 768px: todas as tabelas idênticas ao antes
- [ ] Toggle dark/light continua funcionando
- [ ] `npm run build` limpo após todas as tasks

**Verificação de grep após Task 2:**
```bash
# Deve retornar apenas ocorrências não-semânticas (Check icon, analise-card emerald)
grep -rn "text-green-\|text-red-" src/ --include="*.tsx"
```
