# web-financas — Design Spec

**Data:** 2026-06-04  
**Status:** Aprovado

---

## Visão Geral

Aplicação web de controle financeiro pessoal. Permite registrar receitas e despesas (manualmente ou via upload de PDF com extração automática por IA), acompanhar contas a pagar, visualizar relatórios gráficos e obter análise da saúde financeira via IA gratuita.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| Banco de dados | Neon (PostgreSQL free tier) |
| ORM | Prisma |
| Auth | NextAuth v5 — credentials (email + senha bcrypt) |
| IA | Google Gemini API free tier (`gemini-1.5-flash`) |
| Armazenamento PDF | Vercel Blob (free tier — até 1 GB) |
| Gráficos | Recharts |
| Deploy | Vercel |

---

## Arquitetura

```
web-financas/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── cadastro/
│   ├── (app)/                  # área protegida (middleware NextAuth)
│   │   ├── dashboard/
│   │   ├── lancamentos/
│   │   ├── relatorios/
│   │   ├── ia/
│   │   └── configuracoes/
│   └── api/
│       ├── auth/               # NextAuth handlers
│       └── upload/             # recebe PDF → salva no Vercel Blob
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── dashboard/
│   ├── lancamentos/
│   └── relatorios/
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── gemini.ts               # Gemini SDK — extração PDF + análise IA
│   └── auth.ts                 # NextAuth config
└── prisma/
    └── schema.prisma
```

**Layout:** Sidebar lateral fixa (opção A) com ícones + labels. Dark mode nativo via shadcn/ui (`class` strategy no Tailwind).

---

## Modelo de Dados

```prisma
model User {
  id          String       @id @default(cuid())
  email       String       @unique
  password    String       // bcrypt hash
  name        String?
  createdAt   DateTime     @default(now())
  lancamentos Lancamento[]
  categorias  Categoria[]
  analisesIA  AnaliseIA[]
}

model AnaliseIA {
  id        String   @id @default(cuid())
  conteudo  String   @db.Text
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model Categoria {
  id          String       @id @default(cuid())
  nome        String
  cor         String       // hex, ex: "#6366f1"
  icone       String?      // nome do ícone Lucide
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  lancamentos Lancamento[]

  @@unique([nome, userId])
}

model Lancamento {
  id           String    @id @default(cuid())
  descricao    String
  valor        Decimal   @db.Decimal(10, 2)
  tipo         Tipo      // RECEITA | DESPESA
  data         DateTime  // data da transação ou vencimento
  status       Status    @default(REALIZADO)
  codigoBarras String?
  chavePix     String?
  pdfUrl       String?   // URL no Vercel Blob
  categoriaId  String?
  categoria    Categoria? @relation(fields: [categoriaId], references: [id])
  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime  @default(now())
}

enum Tipo   { RECEITA  DESPESA }
enum Status { PENDENTE PAGO    VENCIDO REALIZADO }
```

**Lógica de status:**
- `REALIZADO` — lançamento já aconteceu (gasto no supermercado, salário recebido)
- `PENDENTE` — conta com vencimento futuro ainda não paga
- `VENCIDO` — calculado dinamicamente nas queries: `data < NOW() AND status = PENDENTE` (sem cron necessário)
- `PAGO` — marcado manualmente pelo usuário

---

## Páginas e Funcionalidades

### `/login` e `/cadastro`
- Formulário email + senha
- Senha hasheada com bcrypt
- Redirecionamento automático se já autenticado
- Dark mode desde a tela de login

### `/dashboard`
- 4 cards de resumo do mês atual:
  - **Receitas** (verde) — soma de lançamentos RECEITA/REALIZADO do mês
  - **Despesas** (vermelho) — soma de lançamentos DESPESA/REALIZADO do mês
  - **Saldo** (roxo) — receitas − despesas
  - **A Vencer** (amarelo) — soma de lançamentos PENDENTE com vencimento nos próximos 7 dias
- Gráfico de barras: receitas vs despesas por mês (últimos 6 meses) — Recharts
- Lista das próximas 5 contas a vencer, com badge de status colorido
- Botão "Analisar com IA" → redireciona para `/ia`

### `/lancamentos`
- Tabela paginada com colunas: Descrição, Categoria, Valor, Data, Status, Ações
- Filtros: mês, tipo (receita/despesa/todos), status, categoria
- Botão `+ Novo Lançamento` → abre modal com 2 abas:

**Aba "Upload PDF":**
1. Drag & drop ou clique para selecionar PDF
2. Server Action envia PDF como base64 para `gemini-1.5-flash`
3. Prompt extrai: `descricao`, `valor`, `data` (vencimento), `codigoBarras`, `chavePix`
4. Campos pré-preenchidos — usuário revisa e confirma
5. Salva `Lancamento` com `status = PENDENTE`

**Aba "Manual":**
- Campos: Descrição, Valor, Tipo, Data, Status, Código de Barras (opcional), Chave PIX (opcional), Categoria
- Validação client-side com react-hook-form + zod

**Ações por linha:**
- Copiar código de barras (clipboard)
- Copiar chave PIX (clipboard)
- Marcar como Pago / Recebido
- Editar
- Excluir (com confirmação)

### `/relatorios`
- Gráfico pizza: distribuição de despesas por categoria no mês selecionado
- Gráfico de barras: receitas vs despesas por mês (últimos 12 meses)
- Seletor de período (mês/ano)
- Tabela resumo por categoria com valor total e percentual

### `/ia`
- Botão "Analisar saúde financeira"
- Ao clicar, Server Action:
  1. Busca lançamentos dos últimos 3 meses do usuário
  2. Monta prompt com resumo financeiro (totais por categoria, receita, despesa, saldo)
  3. Envia para `gemini-1.5-flash`
  4. Prompt pede: resumo geral, 3 pontos positivos, 3 pontos de atenção, 3 sugestões práticas
  5. Resposta salva no banco (`AnaliseIA` model) com timestamp
- Exibe resposta formatada em cards
- Histórico das últimas 5 análises

_(model `AnaliseIA` definido no schema principal acima)_

### `/configuracoes`
- **Categorias:** CRUD de categorias (nome, cor hex, ícone Lucide)
- **Categorias padrão** criadas no primeiro login: Moradia, Alimentação, Saúde, Transporte, Lazer, Educação, Outros
- **Perfil:** editar nome, trocar senha (confirma senha atual)

---

## Fluxo de Extração de PDF

```
[Usuário faz upload]
       ↓
[Server Action: pdf-extract]
  1. Recebe arquivo PDF
  2. Salva no Vercel Blob → obtém pdfUrl
  3. Converte para base64
  4. Chama gemini-1.5-flash com:
     - Parte 1: base64 do PDF (mimeType: application/pdf)
     - Parte 2: prompt de extração JSON
  5. Parse do JSON retornado
  6. Retorna { descricao, valor, data, codigoBarras, chavePix } para o client
       ↓
[Client pré-preenche formulário]
       ↓
[Usuário confirma → salva Lancamento]
```

**Prompt de extração (lib/gemini.ts):**
```
Analise este documento e extraia as seguintes informações em JSON:
{
  "descricao": "nome/tipo da conta (ex: Conta de Luz, Internet, IPTU)",
  "valor": 99.90,
  "data": "2026-06-15",
  "codigoBarras": "linha digitável completa ou null",
  "chavePix": "chave PIX ou null"
}
Retorne APENAS o JSON, sem explicações.
```

---

## Análise de IA — Prompt

```
Você é um consultor financeiro pessoal. Analise os dados financeiros abaixo e forneça:

1. RESUMO: parágrafo conciso sobre a situação financeira atual
2. POSITIVOS: 3 pontos positivos (prefixo "✓")
3. ATENÇÃO: 3 pontos de atenção ou riscos (prefixo "⚠")
4. SUGESTÕES: 3 sugestões práticas e específicas (prefixo "→")

Dados dos últimos 3 meses:
[dados inseridos aqui como JSON]

Seja direto, prático e específico para os dados apresentados.
```

---

## Dark Mode

- Tailwind `darkMode: 'class'` no `tailwind.config`
- Toggle no header da sidebar (ícone sol/lua)
- Preferência salva no `localStorage`
- shadcn/ui já suporta dark mode nativamente

---

## Segurança

- Todas as rotas `(app)/` protegidas por middleware NextAuth
- Todas as queries filtradas por `userId` da sessão autenticada (sem vazamento entre usuários)
- Senhas hasheadas com bcrypt (salt rounds: 12)
- PDFs acessíveis apenas via URL assinada do Vercel Blob
- Variáveis sensíveis apenas em `.env.local` (nunca no client)

---

## Variáveis de Ambiente

```env
DATABASE_URL=          # Neon connection string
NEXTAUTH_SECRET=       # string aleatória (openssl rand -base64 32)
NEXTAUTH_URL=          # http://localhost:3000 (dev) / URL da Vercel (prod)
GEMINI_API_KEY=        # Google AI Studio — gratuito
BLOB_READ_WRITE_TOKEN= # Vercel Blob token
```

---

## Categorias Padrão (seed no primeiro login)

| Nome | Cor | Ícone |
|---|---|---|
| Moradia | #6366f1 | home |
| Alimentação | #f59e0b | utensils |
| Saúde | #22c55e | heart-pulse |
| Transporte | #3b82f6 | car |
| Lazer | #ec4899 | smile |
| Educação | #8b5cf6 | book-open |
| Outros | #94a3b8 | more-horizontal |
