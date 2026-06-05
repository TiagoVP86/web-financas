# Análise de Extrato Bancário

**Data:** 2026-06-05
**Status:** Aprovado

## Visão Geral

Nova página `/extrato` onde o usuário faz upload do extrato bancário (PDF, OFX, CSV ou imagem), Sofia extrai e categoriza as transações via IA, exibe análise com gráficos e permite importar transações selecionadas como Lançamentos.

## Arquitetura

### Fluxo principal

```
[Upload arquivo]
      ↓
POST /api/extrato/upload
  1. Parse do arquivo → TransacaoBruta[]
  2. Groq: categoriza transações usando categorias existentes do user
  3. Salva AnaliseExtrato + TransacaoExtrato[] no DB
  4. Retorna JSON com análise completa
      ↓
[Página /extrato]
  - Mostra transações com categorias sugeridas (editáveis)
  - Gráfico de gastos por categoria
  - Seleção de itens → importar como Lançamentos
      ↓
POST /api/extrato/importar
  - Cria Categorias novas (se aprovadas)
  - Cria Lancamentos selecionados
  - Marca TransacaoExtrato.importado = true
```

### Abordagem: pipeline server-side único (Opção A)

Toda lógica concentrada no API Route. Sem estado intermediário. Retry total em caso de falha.

## Modelos de Dados

```prisma
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
  id               String         @id @default(cuid())
  descricao        String
  valor            Decimal        @db.Decimal(10, 2)
  tipo             Tipo
  data             DateTime
  categoriaId      String?        // categoria existente mapeada
  categoriaNova     String?        // nome de nova categoria sugerida pela IA
  importado        Boolean        @default(false)
  lancamentoId     String?        // preenchido após importação
  analiseId        String
  analise          AnaliseExtrato @relation(fields: [analiseId], references: [id], onDelete: Cascade)
}
```

Relação `User` → `AnaliseExtrato[]` adicionada ao model `User`.

## Parse por Formato

| Formato | Estratégia |
|---------|-----------|
| PDF | `pdf-parse` (já instalado) → texto bruto → Groq extrai |
| OFX | Regex sobre tags `<DTPOSTED>` / `<TRNAMT>` / `<MEMO>` → estruturado |
| CSV | `papaparse` → rows → Groq identifica colunas (variam por banco) |
| Imagem (JPG/PNG) | `llama-3.2-90b-vision` → OCR + extração num único call |

Todos os formatos convergem para:

```ts
interface TransacaoBruta {
  descricao: string
  valor: number
  tipo: "RECEITA" | "DESPESA"
  data: string // YYYY-MM-DD
}
```

## IA / Prompts Groq

### Extração (PDF/CSV/imagem)
- Modelo: `llama-3.3-70b-versatile`
- Input: texto bruto do arquivo
- Output: `TransacaoBruta[]` em JSON estrito

### Categorização
- Modelo: `llama-3.3-70b-versatile`
- Input: `TransacaoBruta[]` + lista de categorias existentes do usuário (id + nome)
- Output: cada transação com `categoriaId` (match existente) ou `categoriaSugerida` (nova)
- Resumo financeiro: total receitas, total despesas, saldo, período detectado

## UI — Página `/extrato`

```
/extrato
├── Header: "Sofia — Análise de Extrato"
│
├── Upload zone (drag-drop ou clique)
│   ├── Aceita: PDF, OFX, CSV, JPG, PNG (max 10MB)
│   └── Loading: "Sofia está analisando..."
│
├── [após análise bem-sucedida]
│   ├── Card de resumo Sofia
│   │   └── Receitas / Despesas / Saldo / Período detectado
│   │
│   ├── Gráfico pizza de gastos por categoria (reutiliza CategoryPieChart)
│   │
│   └── Tabela de transações
│       ├── Checkbox por linha (seleção para importar)
│       ├── Colunas: Data | Descrição | Valor | Categoria
│       ├── Categoria editável inline via dropdown
│       ├── Categorias novas: badge "Nova" + nome editável
│       ├── Toggle "Selecionar tudo"
│       └── Botão fixo "Importar X lançamentos"
│
└── Histórico de análises anteriores (cards colapsáveis)
```

## Importação

- Categorias novas criadas antes dos Lancamentos
- Se nome de categoria nova já existe, reutiliza existente (sem duplicata)
- Cada `Lancamento` criado → `TransacaoExtrato.importado = true`, `lancamentoId` preenchido
- Falha parcial: transações já importadas ficam marcadas; usuário pode reimportar as restantes

## Error Handling

| Cenário | Comportamento |
|---------|--------------|
| Arquivo ilegível / formato inesperado | 400 + mensagem descritiva, erro inline no UI |
| Groq falha / timeout | 500 + botão "Tentar novamente" no cliente |
| Nenhuma transação detectada | Aviso "Nenhuma transação encontrada" |
| Transação sem data | Fallback: data atual; campo fica editável |
| Importação com falha | Rollback parcial via try/catch por item; erros reportados individualmente |

## Fora do Escopo

- Deduplicação automática de extratos (usuário detecta visualmente)
- Validação de CNPJ/CPF em descrições
- Suporte a formatos proprietários de bancos específicos (ex: CNAB240)

## Arquivos a Criar / Modificar

| Arquivo | Ação |
|---------|------|
| `prisma/schema.prisma` | Adicionar `AnaliseExtrato`, `TransacaoExtrato`, relação em `User` |
| `src/app/api/extrato/upload/route.ts` | Nova API Route — parse + IA + salva DB |
| `src/app/api/extrato/importar/route.ts` | Nova API Route — cria Lancamentos + Categorias |
| `src/lib/extrato-parser.ts` | Parse por formato (PDF/OFX/CSV/imagem) |
| `src/lib/groq.ts` | Novas funções: `extractTransactions`, `categorizeTransactions` |
| `src/app/(app)/extrato/page.tsx` | Nova página |
| `src/components/extrato/upload-zone.tsx` | Componente de upload |
| `src/components/extrato/transacoes-table.tsx` | Tabela com seleção + edição inline |
| `src/components/extrato/extrato-resumo-card.tsx` | Card de resumo Sofia |
| `src/components/layout/sidebar.tsx` | Adicionar link "Extrato" |
