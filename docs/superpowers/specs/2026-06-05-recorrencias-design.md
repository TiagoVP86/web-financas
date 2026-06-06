# Recorrências — Design Spec

**Data:** 2026-06-05
**Status:** Aprovado

## Visão Geral

Nova página `/recorrencias` onde o usuário cadastra lançamentos recorrentes (salário, aluguel, assinaturas, etc.). Ao clicar "Gerar lançamentos", o sistema cria os `Lancamento`s pendentes de todas as recorrências ativas com vencimento até hoje.

## Modelo de Dados

### Novo enum `Frequencia`

```prisma
enum Frequencia {
  SEMANAL
  QUINZENAL
  MENSAL
  ANUAL
}
```

### Novo model `Recorrencia`

```prisma
model Recorrencia {
  id             String      @id @default(cuid())
  descricao      String
  valor          Decimal     @db.Decimal(10, 2)
  tipo           Tipo
  frequencia     Frequencia
  diaVencimento  Int         // SEMANAL: 0-6 (dom-sáb); MENSAL/ANUAL: 1-28 (capped em 28 para evitar problemas de fim de mês); QUINZENAL: não usado (geração deriva de dataInicio)
  mes            Int?        // 1-12, usado apenas para ANUAL
  categoriaId    String?
  categoria      Categoria?  @relation(fields: [categoriaId], references: [id])
  totalParcelas  Int?        // null = indefinida
  parcelaAtual   Int         @default(0)
  ativa          Boolean     @default(true)
  proximaGeracao DateTime
  userId         String
  user           User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  lancamentos    Lancamento[]
  createdAt      DateTime    @default(now())

  @@index([userId])
}
```

### Alteração em `Lancamento`

```prisma
recorrenciaId  String?
recorrencia    Recorrencia? @relation(fields: [recorrenciaId], references: [id], onDelete: SetNull)
```

Relação inversa `lancamentos Lancamento[]` adicionada a `Recorrencia`.
Relação `recorrencias Recorrencia[]` adicionada a `User`.

## Lógica de Geração

Server Action `gerarLancamentos(userId: string): Promise<{ gerados: number }>`:

1. Busca recorrências onde:
   - `userId = userId`
   - `ativa = true`
   - `proximaGeracao <= now()`
   - `totalParcelas IS NULL` OU `parcelaAtual < totalParcelas`
2. Para cada recorrência, loop enquanto `proximaGeracao <= now()` E parcelas restantes:
   - Cria `Lancamento` com `status: PENDENTE`, `recorrenciaId` preenchido, `data = proximaGeracao`
   - Incrementa `parcelaAtual`
   - Se `parcelaAtual >= totalParcelas` → `ativa = false`, sai do loop
   - Calcula próxima data:
     - SEMANAL: +7 dias
     - QUINZENAL: +15 dias
     - MENSAL: +1 mês (mesmo dia)
     - ANUAL: +1 ano (mesmo dia/mês)
   - Atualiza `proximaGeracao`
3. Retorna total de lançamentos criados

Múltiplos lançamentos por recorrência são possíveis se o usuário não gerou por vários períodos.

## UI — Página `/recorrencias`

```
┌─ Header ─────────────────────────────────────────────────┐
│ Recorrências              [Gerar lançamentos] [+ Nova]   │
└──────────────────────────────────────────────────────────┘

┌─ Card ───────────────────────────────────────────────────┐
│ [cor] Aluguel                              R$ 1.500,00   │
│ DESPESA · Mensal                     Parcela 6/12        │
│ Próxima geração: 01/07/2026                              │
│                             [Editar] [Pausar] [Excluir]  │
└──────────────────────────────────────────────────────────┘
```

- Recorrências pausadas: opacidade 50%, botão "Ativar" em vez de "Pausar"
- `totalParcelas = null` → exibe "Indefinida" no lugar de "Parcela X/Y"
- Frequência exibida como badge: "Semanal" / "Quinzenal" / "Mensal" / "Anual"
- Grid responsivo: 1 col mobile, 2 col sm, 3 col lg

## Modal — Nova / Editar Recorrência

Campos:
- Descrição (text, required)
- Valor (number, required)
- Tipo (select: Receita / Despesa)
- Frequência (select: Semanal / Quinzenal / Mensal / Anual)
- Dia de vencimento (number 1–28 para Mensal/Anual; select 0–6 para Semanal; oculto para Quinzenal — data deriva de "Data de início")
- Mês (select 1–12, só visível se Anual)
- Data de início / primeira geração (date, default: hoje)
- Categoria (select, opcional)
- Total de parcelas (number, opcional — vazio = indefinida)

`proximaGeracao` calculada a partir de `dataInicio` + frequência na criação.

## Edição com Propagação

Ao salvar edição, modal pergunta:

> "Aplicar alterações a:"
> - "Somente lançamentos futuros" → atualiza apenas `Recorrencia`
> - "Atualizar todos os lançamentos pendentes" → atualiza `Recorrencia` + todos os `Lancamento` com `recorrenciaId = id AND status = PENDENTE`

## Navegação

Adicionar `{ href: "/recorrencias", label: "Recorrências", icon: RefreshCw }` ao sidebar entre Lançamentos e Relatórios.

## Fora do Escopo

- Notificações quando lançamentos forem gerados
- Visualização de histórico de geração por recorrência
- Geração automática via cron (manual pelo usuário)
- Pular uma ocorrência específica sem pausar a recorrência inteira
