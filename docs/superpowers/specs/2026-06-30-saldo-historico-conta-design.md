# Saldo Histórico por Conta — Design

**Data:** 2026-06-30
**Status:** Aprovado para planejamento

## Objetivo

Drill-down de patrimônio por conta individual. Hoje o dashboard mostra só o patrimônio **consolidado** (soma de todas as contas) em area chart de 12 meses. Esta feature dá, para **cada conta**, sua própria evolução de saldo mês a mês, KPIs e extrato — numa página de detalhe dedicada.

## Escopo

**Inclui:**
- Nova rota `/contas/[id]` (server component) com chart histórico 12m, KPIs e extrato paginado.
- ContaCard em `/contas` vira clicável → navega para o detalhe.
- Helper compartilhado de cálculo de saldo histórico, reusado pelo dashboard (refactor) e pela página nova.
- Primeira paginação real do app (componente reutilizável).

**Não inclui (YAGNI):**
- Filtros/busca na página de detalhe — já existe em `/lancamentos?contaId=X`.
- Janela de tempo ajustável (fixa em 12 meses, consistente com o dashboard).
- Atribuição de lançamentos sem conta (`contaId = null`) — não entram em nenhum detalhe de conta.

## Decisões fechadas

- **Janela:** 12 meses fixos (igual ao patrimônio do dashboard).
- **Lançamentos sem conta:** excluídos do detalhe — só contam os lançamentos daquela `contaId`.
- **KPIs:** janela de 12 meses (não all-time), pra bater com o chart.
- **Página do extrato:** 20 lançamentos por página.

---

## Arquitetura

### 1. Helper compartilhado — `src/lib/saldo-historico.ts`

Centraliza o cálculo do saldo acumulado mês a mês, hoje inline no dashboard (`dashboard/page.tsx:50-112`).

```ts
export interface SaldoPonto { mes: string; saldo: number }

/**
 * Série de saldo acumulado dos últimos 12 meses.
 * - Sem contaId: patrimônio consolidado (todas as contas + lançamentos sem conta).
 * - Com contaId: saldo daquela conta (saldoInicial dela + lançamentos com aquele contaId).
 */
export async function computeSaldoHistorico(
  userId: string,
  opts?: { contaId?: string },
): Promise<SaldoPonto[]>
```

Estrutura interna:
- `historyMonths`: 12 janelas `{ start, end, label }` via `date-fns` (mesma construção do dashboard).
- **Base** (saldo no início da janela):
  - `saldoInicial`: `db.conta.aggregate({ _sum: { saldoInicial } })` filtrado por `userId` (e `id = contaId` quando houver).
  - Lançamentos **antes** da janela: `db.lancamento.groupBy(['tipo'])` com `data: { lt: windowStart }` (+ `contaId` quando houver).
  - `base = saldoInicial + somaReceitasAntes − somaDespesasAntes`.
- **Mensal:** para cada mês, `groupBy(['tipo'])` com `data` na janela (+ `contaId` quando houver).
- Acumula via função pura (abaixo).

### 2. Função pura testável — dentro de `saldo-historico.ts`

Separa a matemática do acesso a DB para teste unitário (vitest), seguindo o padrão de `src/lib/fingerprint.ts`.

```ts
export interface LinhaMensal { receitas: number; despesas: number }

/** Acumula saldo a partir de uma base, aplicando receita−despesa de cada mês em ordem. */
export function acumularSaldo(
  base: number,
  meses: { label: string; linha: LinhaMensal }[],
): SaldoPonto[]
```

Determinística, sem dependências. Testes: base positiva/negativa/zero; meses vazios; acumulação correta; ordem preservada.

### 3. Refactor do dashboard

`dashboard/page.tsx` remove o bloco inline (`baseLancs`, `historyMonthly`, `runningPatrimonio`, `patrimonioData` — linhas ~85-112) e passa a chamar `computeSaldoHistorico(userId)` (sem `contaId`). Saída idêntica ao formato atual (`{ mes, saldo }[]`) consumido por `PatrimonioChart`. Sem mudança visual.

### 4. Rota de detalhe — `src/app/(app)/contas/[id]/page.tsx`

Server component. `searchParams: { page?: string }`.

Fluxo:
1. `auth()` → `redirect("/login")` se sem sessão.
2. Carrega a conta: `db.conta.findFirst({ where: { id, userId } })`. Se null → `notFound()`.
3. `Promise.all`:
   - `computeSaldoHistorico(userId, { contaId: id })`
   - KPIs: entradas/saídas via `groupBy(['tipo'])` com `data` nos últimos 12 meses + `contaId`; **saldo atual** = `saldoInicial + todas receitas − todas despesas` da conta (sem filtro de data, idêntico ao cálculo do `ContaCard` — garante que bate com `/contas` mesmo havendo lançamentos futuros de parcelamento); variação 12m = `(último − primeiro) / |primeiro|` sobre a série.
   - Extrato paginado: `db.lancamento.findMany({ where: { userId, contaId: id }, orderBy: { data: "desc" }, take: 20, skip: (page-1)*20, include: { categoria: true, conta: {...} } })` + `db.lancamento.count({ where: { userId, contaId: id } })`.
4. Renderiza: header (nome/tipo/ícone da conta + voltar) · grid de KPIs · `SaldoContaChart` · tabela (`LancamentosTable`) · `Pagination`.

Arquivos irmãos: `loading.tsx` (skeleton) e `not-found.tsx`.

### 5. Componentes

- **`src/components/contas/saldo-conta-chart.tsx`** — `"use client"`. AreaChart + gradiente, reusando `@/components/charts/chart-helpers` (`ChartTooltip`, `fmtBRLShort`). Igual ao estilo de `PatrimonioChart`, mas título parametrizável (prop `titulo`). *Considerar* generalizar `PatrimonioChart` ao invés de duplicar; decisão na fase de plano (id do gradiente precisa ser único por instância).
- **`src/components/ui/pagination.tsx`** — server-friendly. Props: `page`, `totalPages`, `baseHref`. Renderiza prev/próximo como `<Link>` (`?page=N`) + "Página X de Y". Desabilita extremos. Reutilizável fora de contas.
- **`ContaCard`** (modificado) — conteúdo envolto em `<Link href={/contas/${id}}>`; `DeleteContaButton` sai de dentro do link (posicionado absoluto no canto, com `stopPropagation`) pra não aninhar `<button>` dentro de `<a>`.

---

## Fluxo de dados

```
/contas
  └─ ContaCard (Link) ──► /contas/[id]?page=N
                              │
                              ├─ computeSaldoHistorico(userId, {contaId})  ──► SaldoContaChart
                              ├─ groupBy tipo (12m, contaId)               ──► KPIs cards
                              └─ findMany + count (contaId, paginado)      ──► LancamentosTable + Pagination
```

`computeSaldoHistorico` é a única fonte da série, compartilhada com o dashboard (consolidado).

## Tratamento de erros / edge cases

- **Conta inexistente ou de outro usuário:** `findFirst({ where: { id, userId } })` → null → `notFound()` (404). Evita IDOR.
- **`page` inválido** (NaN, <1, > totalPages): clamp para faixa `[1, totalPages]`; `totalPages` mínimo 1.
- **Conta sem lançamentos:** série = base repetida 12x (linha plana no `saldoInicial`); extrato mostra empty-state; KPIs zerados.
- **Conta mais nova que 12m:** meses anteriores à criação têm `linha` zerada; base já reflete `saldoInicial`. Sem tratamento especial.
- **Variação com primeiro ponto = 0:** `pct = null` (não divide por zero), igual ao `PatrimonioChart` atual.

## Testes

- **Unitário (vitest):** `acumularSaldo` — `src/lib/saldo-historico.test.ts`. Casos: base +/−/0, meses vazios, acumulação multi-mês, preservação de ordem, label repassado.
- **Verificação manual:** criar conta com saldo inicial + lançamentos espalhados; abrir `/contas/[id]`; conferir que saldo atual bate com o card em `/contas`, chart sobe/desce coerente, paginação navega, conta de terceiro retorna 404.
- **Regressão:** dashboard continua idêntico após refactor (patrimônio consolidado inalterado).

## Arquivos

**Novos:**
- `src/lib/saldo-historico.ts`
- `src/lib/saldo-historico.test.ts`
- `src/app/(app)/contas/[id]/page.tsx`
- `src/app/(app)/contas/[id]/loading.tsx`
- `src/app/(app)/contas/[id]/not-found.tsx`
- `src/components/contas/saldo-conta-chart.tsx`
- `src/components/ui/pagination.tsx`

**Modificados:**
- `src/app/(app)/dashboard/page.tsx` — usa `computeSaldoHistorico`.
- `src/components/contas/conta-card.tsx` — vira clicável (Link + delete fora do link).
