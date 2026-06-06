# Análise de Extrato Bancário — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users upload a bank statement (PDF/OFX/CSV/image), have Sofia extract and categorize all transactions via AI, and optionally import selected transactions as Lancamentos.

**Architecture:** Single-pass server-side pipeline — upload route parses file, calls Groq twice (extract then categorize), saves `AnaliseExtrato` + `TransacaoExtrato[]` to DB, returns JSON. Client manages state for selection and import. New `/extrato` page with client upload section + server-rendered history.

**Tech Stack:** Next.js App Router, Prisma/Neon, Vercel Blob, Groq SDK (llama-3.3-70b-versatile + llama-3.2-11b-vision-preview), papaparse (CSV), recharts (chart), sonner (toasts).

---

## File Map

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Modify — add `AnaliseExtrato`, `TransacaoExtrato`, relations on `User` and `Categoria` |
| `src/types/extrato.ts` | Create — shared types for API ↔ components |
| `src/lib/extrato-parser.ts` | Create — parse PDF/OFX/CSV/image → `ParseResult` |
| `src/lib/groq.ts` | Modify — add `extractTransactionsFromText`, `extractTransactionsFromImage`, `categorizeTransactions` |
| `src/app/api/extrato/upload/route.ts` | Create — orchestrates parse → AI → DB → response |
| `src/app/api/extrato/importar/route.ts` | Create — creates Lancamentos + Categorias from selections |
| `src/components/extrato/upload-zone.tsx` | Create — drag-and-drop file input |
| `src/components/extrato/extrato-resumo-card.tsx` | Create — Sofia summary card |
| `src/components/extrato/transacoes-table.tsx` | Create — table with checkboxes + inline category editing |
| `src/components/extrato/extrato-client.tsx` | Create — client wrapper coordinating upload flow |
| `src/app/(app)/extrato/page.tsx` | Create — server page (history) + mounts client |
| `src/components/layout/sidebar.tsx` | Modify — add "Extrato" nav item |

---

## Task 1: Install papaparse

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install dependency**

```bash
npm install papaparse @types/papaparse
```

Expected output: `added 2 packages` (or similar). No errors.

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add papaparse for CSV bank statement parsing"
```

---

## Task 2: Update Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add new models and update relations**

Open `prisma/schema.prisma`. The full file after changes:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model User {
  id              String           @id @default(cuid())
  email           String           @unique
  password        String
  name            String?
  createdAt       DateTime         @default(now())
  lancamentos     Lancamento[]
  categorias      Categoria[]
  analisesIA      AnaliseIA[]
  analisesExtrato AnaliseExtrato[]
}

model Categoria {
  id                String             @id @default(cuid())
  nome              String
  cor               String
  icone             String?
  userId            String
  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  lancamentos       Lancamento[]
  transacoesExtrato TransacaoExtrato[]

  @@unique([nome, userId])
}

model Lancamento {
  id           String     @id @default(cuid())
  descricao    String
  valor        Decimal    @db.Decimal(10, 2)
  tipo         Tipo
  data         DateTime
  status       Status     @default(REALIZADO)
  codigoBarras String?
  chavePix     String?
  pdfUrl       String?
  categoriaId  String?
  categoria    Categoria? @relation(fields: [categoriaId], references: [id])
  userId       String
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime   @default(now())
}

model AnaliseIA {
  id        String   @id @default(cuid())
  conteudo  String   @db.Text
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model AnaliseExtrato {
  id          String             @id @default(cuid())
  nomeArquivo String
  arquivoUrl  String?
  resumo      String             @db.Text
  userId      String
  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  transacoes  TransacaoExtrato[]
  createdAt   DateTime           @default(now())
}

model TransacaoExtrato {
  id            String         @id @default(cuid())
  descricao     String
  valor         Decimal        @db.Decimal(10, 2)
  tipo          Tipo
  data          DateTime
  categoriaId   String?
  categoria     Categoria?     @relation(fields: [categoriaId], references: [id])
  categoriaNova String?
  importado     Boolean        @default(false)
  lancamentoId  String?
  analiseId     String
  analise       AnaliseExtrato @relation(fields: [analiseId], references: [id], onDelete: Cascade)
}

enum Tipo {
  RECEITA
  DESPESA
}

enum Status {
  PENDENTE
  PAGO
  VENCIDO
  REALIZADO
}
```

- [ ] **Step 2: Commit schema change**

```bash
git add prisma/schema.prisma
git commit -m "feat(schema): add AnaliseExtrato and TransacaoExtrato models"
```

---

## Task 3: Run Prisma Migration

**Files:**
- Generates: `prisma/migrations/...`

- [ ] **Step 1: Run migration**

```bash
npx prisma migrate dev --name add-extrato-models
```

Expected output:
```
Applying migration `..._add_extrato_models`
Your database is now in sync with your schema.
```

If you see `Environment variable not found: DATABASE_URL`, copy `.env` or `.env.local` from the project root and ensure `DATABASE_URL` is set.

- [ ] **Step 2: Verify Prisma client regenerated**

```bash
npx prisma generate
```

Expected: no errors, outputs `Generated Prisma Client`.

- [ ] **Step 3: Commit migration**

```bash
git add prisma/migrations
git commit -m "feat(db): migrate — add AnaliseExtrato and TransacaoExtrato tables"
```

---

## Task 4: Shared Types

**Files:**
- Create: `src/types/extrato.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/types/extrato.ts

export interface TransacaoBruta {
  descricao: string
  valor: number
  tipo: "RECEITA" | "DESPESA"
  data: string | null // YYYY-MM-DD or null
}

export interface TransacaoExtratoItem {
  id: string
  descricao: string
  valor: number
  tipo: "RECEITA" | "DESPESA"
  data: string // ISO string
  categoriaId: string | null
  categoriaNome: string | null
  categoriaNova: string | null
  importado: boolean
}

export interface AnaliseExtratoResponse {
  id: string
  nomeArquivo: string
  arquivoUrl: string | null
  resumo: string
  periodo: string
  totalReceitas: number
  totalDespesas: number
  saldo: number
  porCategoria: { nome: string; valor: number; cor: string }[]
  transacoes: TransacaoExtratoItem[]
  categorias: { id: string; nome: string; cor: string }[]
}

export interface SelecaoImportar {
  transacaoId: string
  categoriaId: string | null
  categoriaNova: string | null
}

export interface ImportarRequestBody {
  selecoes: SelecaoImportar[]
}

export interface ImportarResponse {
  imported: number
  errors: string[]
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/extrato.ts
git commit -m "feat(types): add shared types for bank statement analysis"
```

---

## Task 5: File Parser

**Files:**
- Create: `src/lib/extrato-parser.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/lib/extrato-parser.ts
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>
import Papa from "papaparse"
import type { TransacaoBruta } from "@/types/extrato"

export type ParseResult =
  | { kind: "text"; text: string; nomeArquivo: string }
  | { kind: "structured"; transacoes: TransacaoBruta[]; nomeArquivo: string }
  | { kind: "image"; base64: string; mimeType: string; nomeArquivo: string }

export async function parseExtrato(file: File): Promise<ParseResult> {
  const nomeArquivo = file.name

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const parsed = await pdfParse(buffer)
    return { kind: "text", text: parsed.text, nomeArquivo }
  }

  if (file.name.toLowerCase().endsWith(".ofx") || file.type.includes("ofx")) {
    const text = await file.text()
    const transacoes = parseOFX(text)
    return { kind: "structured", transacoes, nomeArquivo }
  }

  if (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")) {
    const text = await file.text()
    return { kind: "text", text: csvToText(text), nomeArquivo }
  }

  if (file.type.startsWith("image/")) {
    const buffer = Buffer.from(await file.arrayBuffer())
    return {
      kind: "image",
      base64: buffer.toString("base64"),
      mimeType: file.type,
      nomeArquivo,
    }
  }

  throw new Error(`Formato não suportado: ${file.type || file.name}`)
}

function parseOFX(content: string): TransacaoBruta[] {
  const result: TransacaoBruta[] = []
  const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi

  let match: RegExpExecArray | null
  while ((match = trnRegex.exec(content)) !== null) {
    const block = match[1]
    const rawDate = block.match(/<DTPOSTED>([\d]+)/i)?.[1] ?? ""
    const rawAmt = block.match(/<TRNAMT>([-\d.]+)/i)?.[1] ?? ""
    const memo =
      block.match(/<MEMO>([^\r\n<]+)/i)?.[1]?.trim() ??
      block.match(/<NAME>([^\r\n<]+)/i)?.[1]?.trim() ??
      "Transação"

    if (!rawDate || !rawAmt) continue

    const date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
    const rawValue = parseFloat(rawAmt)
    const valor = Math.abs(rawValue)
    const tipo: "RECEITA" | "DESPESA" = rawValue >= 0 ? "RECEITA" : "DESPESA"

    result.push({ descricao: memo, valor, tipo, data: isValidDate(date) ? date : null })
  }

  return result
}

function csvToText(csv: string): string {
  const parsed = Papa.parse<string[]>(csv, { skipEmptyLines: true })
  return parsed.data.map((row) => row.join(" | ")).join("\n")
}

function isValidDate(date: string): boolean {
  return !isNaN(Date.parse(date))
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/extrato-parser.ts
git commit -m "feat(lib): add bank statement file parser (PDF/OFX/CSV/image)"
```

---

## Task 6: Add Groq Functions

**Files:**
- Modify: `src/lib/groq.ts`

- [ ] **Step 1: Add imports and new functions to the end of the file**

Open `src/lib/groq.ts`. Add the following import at the top and functions at the bottom:

At the top of the file, add the import:
```typescript
import type { TransacaoBruta } from "@/types/extrato"
```

At the bottom of the file (after `analyzeFinances`), add:

```typescript
export async function extractTransactionsFromText(
  text: string
): Promise<TransacaoBruta[]> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    messages: [
      {
        role: "user",
        content: `Analise este extrato bancário e extraia TODAS as transações em JSON estrito:
{
  "transacoes": [
    {
      "descricao": "descrição da transação",
      "valor": 99.90,
      "tipo": "DESPESA",
      "data": "2026-03-01"
    }
  ]
}
Regras:
- "tipo": use "RECEITA" para entradas/créditos, "DESPESA" para saídas/débitos
- "valor": sempre positivo
- "data": formato YYYY-MM-DD; use null se não encontrar
- Inclua TODAS as transações visíveis no texto
Retorne APENAS o JSON.

Extrato:
${text.slice(0, 8000)}`,
      },
    ],
  })
  const result = parseJson<{ transacoes: TransacaoBruta[] }>(
    completion.choices[0].message.content ?? "{}"
  )
  return result.transacoes ?? []
}

export async function extractTransactionsFromImage(
  base64: string,
  mimeType: string
): Promise<TransacaoBruta[]> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.2-11b-vision-preview",
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64}` },
          },
          {
            type: "text",
            text: `Extraia todas as transações do extrato bancário nesta imagem em JSON estrito:
{
  "transacoes": [
    {
      "descricao": "descrição",
      "valor": 99.90,
      "tipo": "DESPESA",
      "data": "2026-03-01"
    }
  ]
}
Regras: "tipo" RECEITA para entradas, DESPESA para saídas; "valor" sempre positivo; "data" YYYY-MM-DD ou null.
Retorne APENAS o JSON.`,
          },
        ],
      },
    ],
  })
  const result = parseJson<{ transacoes: TransacaoBruta[] }>(
    completion.choices[0].message.content ?? "{}"
  )
  return result.transacoes ?? []
}

export interface CategorizacaoResult {
  transacoes: Array<{
    index: number
    categoriaId: string | null
    categoriaNova: string | null
  }>
  resumo: string
  totalReceitas: number
  totalDespesas: number
  saldo: number
  periodo: string
}

export async function categorizeTransactions(
  transacoes: TransacaoBruta[],
  categorias: { id: string; nome: string }[]
): Promise<CategorizacaoResult> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    messages: [
      {
        role: "user",
        content: `Você é Sofia, consultora financeira. Categorize as transações abaixo.

Categorias disponíveis (use o id quando houver match):
${JSON.stringify(categorias)}

Transações a categorizar:
${JSON.stringify(
  transacoes.map((t, i) => ({
    index: i,
    descricao: t.descricao,
    valor: t.valor,
    tipo: t.tipo,
  }))
)}

Responda em JSON estrito:
{
  "transacoes": [
    {
      "index": 0,
      "categoriaId": "id-da-categoria-existente-ou-null",
      "categoriaNova": "Nome Nova Categoria ou null"
    }
  ],
  "resumo": "Análise objetiva do período financeiro em 2-3 frases",
  "totalReceitas": 0.00,
  "totalDespesas": 0.00,
  "saldo": 0.00,
  "periodo": "descrição do período detectado (ex: março de 2026)"
}

Regras:
- Use categoriaId se a categoria existente for adequada (nunca invente um id)
- Use categoriaNova apenas se nenhuma categoria existente couber
- Nunca preencha categoriaId e categoriaNova na mesma transação
- Calcule totais somando os valores das transações por tipo
- Retorne uma entrada por transação, mantendo o index original

Retorne APENAS o JSON.`,
      },
    ],
  })
  return parseJson<CategorizacaoResult>(
    completion.choices[0].message.content ?? "{}"
  )
}
```

- [ ] **Step 2: Verify the file compiles — check for TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: no errors related to `groq.ts`. If you see type errors on `image_url` content type, add `as never` cast — Groq SDK types are sometimes behind.

- [ ] **Step 3: Commit**

```bash
git add src/lib/groq.ts
git commit -m "feat(groq): add transaction extraction and categorization functions"
```

---

## Task 7: Upload API Route

**Files:**
- Create: `src/app/api/extrato/upload/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// src/app/api/extrato/upload/route.ts
import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { parseExtrato } from "@/lib/extrato-parser"
import {
  extractTransactionsFromText,
  extractTransactionsFromImage,
  categorizeTransactions,
} from "@/lib/groq"
import type { AnaliseExtratoResponse } from "@/types/extrato"

const CATEGORY_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
]

const SUPPORTED_TYPES = new Set([
  "application/pdf",
  "text/csv",
  "image/jpeg",
  "image/png",
  "image/webp",
])

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })

  const isOFX = file.name.toLowerCase().endsWith(".ofx")
  const isCSV = file.name.toLowerCase().endsWith(".csv")
  if (!isOFX && !isCSV && !SUPPORTED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Formato não suportado. Use PDF, OFX, CSV, JPG ou PNG." },
      { status: 400 }
    )
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Arquivo muito grande (máx 10MB)" }, { status: 400 })
  }

  try {
    // Parse file to extract raw content
    const parseResult = await parseExtrato(file)

    // Extract transactions
    let transacoesBrutas
    if (parseResult.kind === "structured") {
      transacoesBrutas = parseResult.transacoes
    } else if (parseResult.kind === "text") {
      transacoesBrutas = await extractTransactionsFromText(parseResult.text)
    } else {
      transacoesBrutas = await extractTransactionsFromImage(
        parseResult.base64,
        parseResult.mimeType
      )
    }

    if (transacoesBrutas.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma transação encontrada. Verifique se o arquivo é um extrato bancário válido." },
        { status: 422 }
      )
    }

    // Fetch user categories and categorize
    const userCategorias = await db.categoria.findMany({
      where: { userId },
      select: { id: true, nome: true, cor: true },
    })

    const [categorizacao, blobResult] = await Promise.all([
      categorizeTransactions(
        transacoesBrutas,
        userCategorias.map((c) => ({ id: c.id, nome: c.nome }))
      ),
      put(
        `extratos/${userId}/${crypto.randomUUID()}.${file.name.split(".").pop() ?? "bin"}`,
        file,
        { access: "private" }
      ).catch(() => null),
    ])

    // Save analysis to DB
    const analise = await db.analiseExtrato.create({
      data: {
        nomeArquivo: file.name,
        arquivoUrl: blobResult?.url ?? null,
        resumo: categorizacao.resumo,
        userId,
        transacoes: {
          create: transacoesBrutas.map((t, i) => {
            const cat = categorizacao.transacoes.find((c) => c.index === i)
            return {
              descricao: t.descricao,
              valor: t.valor,
              tipo: t.tipo,
              data: t.data ? new Date(t.data) : new Date(),
              categoriaId: cat?.categoriaId ?? null,
              categoriaNova: cat?.categoriaNova ?? null,
            }
          }),
        },
      },
      include: {
        transacoes: { include: { categoria: true } },
      },
    })

    // Build porCategoria for chart (DESPESA only)
    const catMap = new Map(userCategorias.map((c) => [c.id, c]))
    const porCategoriaAcc: Map<string, { nome: string; cor: string; valor: number }> = new Map()
    let colorIndex = 0

    for (const t of analise.transacoes) {
      if (t.tipo !== "DESPESA") continue
      const nome = t.categoria?.nome ?? t.categoriaNova ?? "Sem categoria"
      const cor = t.categoria?.cor ?? CATEGORY_COLORS[colorIndex++ % CATEGORY_COLORS.length]
      const existing = porCategoriaAcc.get(nome)
      if (existing) {
        existing.valor += Number(t.valor)
      } else {
        porCategoriaAcc.set(nome, { nome, cor, valor: Number(t.valor) })
      }
    }

    const response: AnaliseExtratoResponse = {
      id: analise.id,
      nomeArquivo: analise.nomeArquivo,
      arquivoUrl: analise.arquivoUrl,
      resumo: analise.resumo,
      periodo: categorizacao.periodo,
      totalReceitas: categorizacao.totalReceitas,
      totalDespesas: categorizacao.totalDespesas,
      saldo: categorizacao.saldo,
      porCategoria: Array.from(porCategoriaAcc.values()),
      transacoes: analise.transacoes.map((t) => ({
        id: t.id,
        descricao: t.descricao,
        valor: Number(t.valor),
        tipo: t.tipo,
        data: t.data.toISOString(),
        categoriaId: t.categoriaId,
        categoriaNome: t.categoria?.nome ?? null,
        categoriaNova: t.categoriaNova,
        importado: t.importado,
      })),
      categorias: userCategorias,
    }

    return NextResponse.json(response)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[extrato/upload]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/extrato/upload/route.ts
git commit -m "feat(api): add bank statement upload and AI analysis endpoint"
```

---

## Task 8: Import API Route

**Files:**
- Create: `src/app/api/extrato/importar/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// src/app/api/extrato/importar/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { ImportarRequestBody, ImportarResponse } from "@/types/extrato"

const CATEGORY_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
]

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  const body = (await req.json()) as ImportarRequestBody
  if (!body.selecoes?.length) {
    return NextResponse.json({ error: "Nenhuma transação selecionada" }, { status: 400 })
  }

  const transacaoIds = body.selecoes.map((s) => s.transacaoId)
  const transacoes = await db.transacaoExtrato.findMany({
    where: { id: { in: transacaoIds } },
    include: { analise: { select: { userId: true } } },
  })

  // Security: all transactions must belong to this user
  if (transacoes.some((t) => t.analise.userId !== userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  let imported = 0
  const errors: string[] = []

  for (const selecao of body.selecoes) {
    const transacao = transacoes.find((t) => t.id === selecao.transacaoId)
    if (!transacao) continue

    try {
      let categoriaId = selecao.categoriaId

      if (!categoriaId && selecao.categoriaNova) {
        const nome = selecao.categoriaNova.trim()
        const existing = await db.categoria.findUnique({
          where: { nome_userId: { nome, userId } },
        })
        if (existing) {
          categoriaId = existing.id
        } else {
          const count = await db.categoria.count({ where: { userId } })
          const created = await db.categoria.create({
            data: {
              nome,
              cor: CATEGORY_COLORS[count % CATEGORY_COLORS.length],
              userId,
            },
          })
          categoriaId = created.id
        }
      }

      const lancamento = await db.lancamento.create({
        data: {
          descricao: transacao.descricao,
          valor: transacao.valor,
          tipo: transacao.tipo,
          data: transacao.data,
          status: transacao.tipo === "RECEITA" ? "REALIZADO" : "PAGO",
          categoriaId: categoriaId ?? null,
          userId,
        },
      })

      await db.transacaoExtrato.update({
        where: { id: transacao.id },
        data: { importado: true, lancamentoId: lancamento.id },
      })

      imported++
    } catch {
      errors.push(transacao.descricao)
    }
  }

  const response: ImportarResponse = { imported, errors }
  return NextResponse.json(response)
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/extrato/importar/route.ts
git commit -m "feat(api): add import endpoint to create Lancamentos from extracted transactions"
```

---

## Task 9: UploadZone Component

**Files:**
- Create: `src/components/extrato/upload-zone.tsx`

- [ ] **Step 1: Create the file**

```typescript
// src/components/extrato/upload-zone.tsx
"use client"

import { useRef, useState } from "react"
import { Upload, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  onFile: (file: File) => void
  isLoading: boolean
}

const ACCEPT = ".pdf,.ofx,.csv,.jpg,.jpeg,.png,.webp"

export function UploadZone({ onFile, isLoading }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFile(file: File) {
    if (!isLoading) onFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors cursor-pointer",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50",
        isLoading && "opacity-60 cursor-not-allowed"
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => !isLoading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      {isLoading ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">
            Sofia está analisando o extrato...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Arraste o extrato aqui ou clique para selecionar</p>
            <p className="mt-1 text-xs text-muted-foreground">PDF, OFX, CSV, JPG ou PNG — máx 10MB</p>
          </div>
          <div className="flex items-center gap-1 rounded-md border px-3 py-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            Selecionar arquivo
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/extrato/upload-zone.tsx
git commit -m "feat(ui): add drag-and-drop upload zone for bank statements"
```

---

## Task 10: ExtratoResumoCard Component

**Files:**
- Create: `src/components/extrato/extrato-resumo-card.tsx`

- [ ] **Step 1: Create the file**

```typescript
// src/components/extrato/extrato-resumo-card.tsx
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
            <div className="flex items-center justify-center gap-1 text-green-500">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs font-medium">Receitas</span>
            </div>
            <p className="mt-1 text-sm font-bold text-green-500">
              {fmt(analise.totalReceitas)}
            </p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-red-500">
              <TrendingDown className="h-3 w-3" />
              <span className="text-xs font-medium">Despesas</span>
            </div>
            <p className="mt-1 text-sm font-bold text-red-500">
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
                analise.saldo >= 0 ? "text-green-500" : "text-red-500"
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

- [ ] **Step 2: Commit**

```bash
git add src/components/extrato/extrato-resumo-card.tsx
git commit -m "feat(ui): add Sofia summary card for bank statement analysis"
```

---

## Task 11: TransacoesTable Component

**Files:**
- Create: `src/components/extrato/transacoes-table.tsx`

- [ ] **Step 1: Create the file**

```typescript
// src/components/extrato/transacoes-table.tsx
"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnaliseExtratoResponse, SelecaoImportar, TransacaoExtratoItem } from "@/types/extrato"

interface TransacoesTableProps {
  transacoes: TransacaoExtratoItem[]
  categorias: AnaliseExtratoResponse["categorias"]
  onImport: (selecoes: SelecaoImportar[]) => void
  isImporting: boolean
}

interface Overrides {
  [transacaoId: string]: {
    categoriaId?: string | null
    categoriaNova?: string | null
  }
}

export function TransacoesTable({
  transacoes,
  categorias,
  onImport,
  isImporting,
}: TransacoesTableProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(transacoes.filter((t) => !t.importado).map((t) => t.id))
  )
  const [overrides, setOverrides] = useState<Overrides>({})

  const disponíveis = transacoes.filter((t) => !t.importado)
  const allSelected = disponíveis.every((t) => selected.has(t.id))

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(disponíveis.map((t) => t.id)))
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function setCategoriaId(transacaoId: string, categoriaId: string) {
    setOverrides((prev) => ({
      ...prev,
      [transacaoId]: { categoriaId, categoriaNova: null },
    }))
  }

  function setCategoriaNova(transacaoId: string, nome: string) {
    setOverrides((prev) => ({
      ...prev,
      [transacaoId]: { categoriaId: null, categoriaNova: nome },
    }))
  }

  function handleImport() {
    const selecoes: SelecaoImportar[] = Array.from(selected).map((id) => {
      const transacao = transacoes.find((t) => t.id === id)!
      const override = overrides[id]
      return {
        transacaoId: id,
        categoriaId: override?.categoriaId ?? transacao.categoriaId,
        categoriaNova: override?.categoriaNova ?? transacao.categoriaNova,
      }
    })
    onImport(selecoes)
  }

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  const selectedCount = Array.from(selected).filter(
    (id) => !transacoes.find((t) => t.id === id)?.importado
  ).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Transações extraídas ({transacoes.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 border-b bg-muted/50">
              <tr>
                <th className="w-10 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="cursor-pointer"
                  />
                </th>
                <th className="px-3 py-2 text-left font-medium">Data</th>
                <th className="px-3 py-2 text-left font-medium">Descrição</th>
                <th className="px-3 py-2 text-right font-medium">Valor</th>
                <th className="px-3 py-2 text-left font-medium min-w-[180px]">Categoria</th>
              </tr>
            </thead>
            <tbody>
              {transacoes.map((t) => {
                const override = overrides[t.id]
                const catId = override?.categoriaId ?? t.categoriaId
                const catNova = override?.categoriaNova ?? t.categoriaNova
                const isNova = !catId && !!catNova

                return (
                  <tr
                    key={t.id}
                    className={`border-b last:border-0 ${
                      t.importado
                        ? "opacity-40"
                        : "hover:bg-muted/20"
                    }`}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(t.id)}
                        onChange={() => toggle(t.id)}
                        disabled={t.importado}
                        className="cursor-pointer disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                      {format(new Date(t.data), "dd/MM/yy", { locale: ptBR })}
                    </td>
                    <td className="px-3 py-2">
                      <span className={t.tipo === "RECEITA" ? "text-green-500" : "text-red-500"}>
                        {t.tipo === "RECEITA" ? "+" : "−"}
                      </span>{" "}
                      {t.descricao}
                      {t.importado && (
                        <Badge variant="secondary" className="ml-2 text-xs">Importado</Badge>
                      )}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-medium whitespace-nowrap ${
                        t.tipo === "RECEITA" ? "text-green-500" : ""
                      }`}
                    >
                      {fmt(t.valor)}
                    </td>
                    <td className="px-3 py-2">
                      {isNova ? (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs shrink-0">Nova</Badge>
                          <Input
                            value={catNova ?? ""}
                            onChange={(e) => setCategoriaNova(t.id, e.target.value)}
                            className="h-7 text-xs"
                            placeholder="Nome da categoria"
                          />
                        </div>
                      ) : (
                        <Select
                          value={catId ?? "none"}
                          onValueChange={(v) =>
                            v === "none"
                              ? setOverrides((p) => ({ ...p, [t.id]: { categoriaId: null, categoriaNova: null } }))
                              : setCategoriaId(t.id, v)
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="Sem categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sem categoria</SelectItem>
                            {categorias.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {selectedCount > 0 && (
          <div className="flex justify-end">
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting
                ? "Importando..."
                : `Importar ${selectedCount} lançamento${selectedCount !== 1 ? "s" : ""}`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/extrato/transacoes-table.tsx
git commit -m "feat(ui): add transaction table with category inline editing and bulk import"
```

---

## Task 12: ExtratoClient Wrapper

**Files:**
- Create: `src/components/extrato/extrato-client.tsx`

- [ ] **Step 1: Create the file**

```typescript
// src/components/extrato/extrato-client.tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { UploadZone } from "./upload-zone"
import { ExtratoResumoCard } from "./extrato-resumo-card"
import { TransacoesTable } from "./transacoes-table"
import { CategoryPieChart } from "@/components/relatorios/category-pie-chart"
import type {
  AnaliseExtratoResponse,
  ImportarResponse,
  SelecaoImportar,
} from "@/types/extrato"

export function ExtratoClient() {
  const [isUploading, setIsUploading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [analise, setAnalise] = useState<AnaliseExtratoResponse | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setIsUploading(true)
    setUploadError(null)
    setAnalise(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/extrato/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setUploadError(data.error ?? "Erro ao analisar extrato.")
        return
      }
      setAnalise(data as AnaliseExtratoResponse)
    } catch {
      setUploadError("Falha na conexão. Tente novamente.")
    } finally {
      setIsUploading(false)
    }
  }

  async function handleImport(selecoes: SelecaoImportar[]) {
    if (!analise) return
    setIsImporting(true)

    try {
      const res = await fetch("/api/extrato/importar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selecoes }),
      })
      const data: ImportarResponse = await res.json()

      if (!res.ok) {
        toast.error("Erro ao importar lançamentos.")
        return
      }

      toast.success(
        `${data.imported} lançamento${data.imported !== 1 ? "s" : ""} importado${data.imported !== 1 ? "s" : ""}!`
      )
      if (data.errors.length > 0) {
        toast.warning(`${data.errors.length} não importado(s): ${data.errors.join(", ")}`)
      }

      // Mark imported transactions locally so checkboxes disable
      setAnalise((prev) => {
        if (!prev) return prev
        const importedIds = new Set(selecoes.map((s) => s.transacaoId))
        return {
          ...prev,
          transacoes: prev.transacoes.map((t) =>
            importedIds.has(t.id) ? { ...t, importado: true } : t
          ),
        }
      })
    } catch {
      toast.error("Falha na conexão ao importar.")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <UploadZone onFile={handleFile} isLoading={isUploading} />

      {uploadError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {uploadError}
        </div>
      )}

      {analise && (
        <>
          <ExtratoResumoCard analise={analise} />
          {analise.porCategoria.length > 0 && (
            <CategoryPieChart
              data={analise.porCategoria.map((c) => ({
                nome: c.nome,
                valor: c.valor,
                cor: c.cor,
              }))}
            />
          )}
          <TransacoesTable
            transacoes={analise.transacoes}
            categorias={analise.categorias}
            onImport={handleImport}
            isImporting={isImporting}
          />
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/extrato/extrato-client.tsx
git commit -m "feat(ui): add ExtratoClient — coordinates upload, analysis display, and import flow"
```

---

## Task 13: Create /extrato Page

**Files:**
- Create: `src/app/(app)/extrato/page.tsx`

- [ ] **Step 1: Create the page**

```typescript
// src/app/(app)/extrato/page.tsx
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Sparkles, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExtratoClient } from "@/components/extrato/extrato-client"

export default async function ExtratoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const historicoAnalises = await db.analiseExtrato.findMany({
    where: { userId },
    include: {
      _count: { select: { transacoes: true } },
      transacoes: {
        where: { importado: true },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sofia — Análise de Extrato</h1>
        <p className="text-sm text-muted-foreground">
          Faça upload do seu extrato bancário para análise inteligente de gastos
        </p>
      </div>

      <ExtratoClient />

      {historicoAnalises.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Análises anteriores</h2>
          <div className="space-y-2">
            {historicoAnalises.map((a) => (
              <Card key={a.id}>
                <CardHeader className="py-3">
                  <CardTitle className="flex items-center justify-between text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{a.nomeArquivo}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(a.createdAt), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2">{a.resumo}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a._count.transacoes} transações •{" "}
                    {a.transacoes.length} importadas
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(app)/extrato/page.tsx
git commit -m "feat(page): add /extrato page with Sofia bank statement analysis"
```

---

## Task 14: Update Sidebar

**Files:**
- Modify: `src/components/layout/sidebar.tsx`

- [ ] **Step 1: Add FileSearch icon import and nav item**

In `src/components/layout/sidebar.tsx`, update the imports block to add `FileSearch`:

```typescript
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
  Wallet,
  Menu,
  FileSearch,
} from "lucide-react"
```

Update `navItems` to add the extrato entry after the IA entry:

```typescript
const navItems = [
  { href: "/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { href: "/lancamentos",   label: "Lançamentos",   icon: Receipt },
  { href: "/relatorios",    label: "Relatórios",    icon: BarChart3 },
  { href: "/ia",            label: "Análise IA",    icon: Sparkles },
  { href: "/extrato",       label: "Extrato",       icon: FileSearch },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/sidebar.tsx
git commit -m "feat(nav): add Extrato link to sidebar"
```

---

## Task 15: Manual Verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify navigation**

Open `http://localhost:3000`. Log in. Confirm "Extrato" appears in sidebar. Click it — `/extrato` loads with upload zone.

- [ ] **Step 3: Test PDF upload**

Upload a bank statement PDF. Expected:
- Loading spinner with "Sofia está analisando..."
- After ~10-30s: summary card with totals, pie chart, table with transactions
- Each transaction has a category dropdown

- [ ] **Step 4: Test import**

Select transactions. Click "Importar N lançamentos". Expected:
- Toast: "N lançamentos importados!"
- Imported rows show "Importado" badge and uncheck

- [ ] **Step 5: Verify in Lancamentos**

Navigate to `/lancamentos`. Confirm imported transactions appear with correct category, value, and date.

- [ ] **Step 6: Test history**

Reload `/extrato`. Previous analysis should appear in "Análises anteriores" section with filename, date, resumo, and count.

- [ ] **Step 7: Test error state**

Upload a non-financial file (e.g., a plain text file renamed to `.pdf`). Expected: error message "Nenhuma transação encontrada..." displayed inline.
