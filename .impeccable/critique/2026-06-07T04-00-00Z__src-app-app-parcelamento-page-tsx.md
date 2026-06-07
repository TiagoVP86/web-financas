---
target: src/app/(app)/parcelamento/page.tsx
total_score: 29
p0_count: 0
p1_count: 0
timestamp: 2026-06-07T04-00-00Z
slug: src-app-app-parcelamento-page-tsx
---
## Design Health Score

| # | Heuristica | Score | Issue |
|---|-----------|-------|-------|
| 1 | Visibility of System Status | 3 | Seções "Em andamento"/"Concluídos"; progress bar; pending delete |
| 2 | Match Real World | 3 | CreditCard icon; linguagem parcelas natural; "próxima" data |
| 3 | User Control | 3 | AlertDialog delete; modal criação |
| 4 | Consistency | 3 | Card pattern ring-1; toast patterns iguais a contas/orcamento |
| 5 | Error Prevention | 3 | AlertDialog delete; validação no modal |
| 6 | Recognition | 3 | Header mostra count + total restante; seções organizam ativo vs concluído |
| 7 | Flexibility | 2 | Sem sort por data próxima; sem filtro; sem bulk |
| 8 | Aesthetic | 3 | Progress bar primary→receita; opacity-70 concluídos; flat |
| 9 | Error Recovery | 3 | Toast erro em delete; item mantido no UI se API falha |
| 10 | Documentation | 2 | Sem explicação de como parcelas são geradas; "próxima" sem contexto |
| **Total** | | **29/40** | **Bom — sem P0/P1** |

## Anti-Patterns Verdict

**LLM:** Limpo. Seções ativo/concluído evitam cards idênticos em grid. Sem slop.
**Detector:** [] — nenhum achado estrutural.

## Overall Impression

Página mais bem avaliada das não-auditadas. Pattern correto em todos os pontos críticos. Issues restantes são P2.

## What's Working

1. Seções "Em andamento" / "Concluídos" — organização clara sem filtro extra.
2. handleDelete não remove item do UI até confirmação de sucesso da API — sem estado fantasma.
3. Header com ativos + totalRestante — KPI imediato sem scroll.

## Priority Issues

Nenhum P0 ou P1.

**[P2] Sem sort por próxima data**
- Por que importa: Parcelamentos mais urgentes (próxima data mais cedo) deveriam aparecer primeiro.
- Fix: Ordenar ativos por proximaData ASC no server.
- Comando sugerido: /impeccable polish parcelamento

**[P2] refresh() após modal = roundtrip desnecessário**
- Por que importa: Modal já tem os dados criados; fetch /api/parcelamentos duplica a busca.
- Fix: onSaved recebe o novo ParcelamentoItem e faz setItems(prev => [novo, ...prev]).
- Comando sugerido: /impeccable polish parcelamento

**[P2] Concluídos section sempre visível**
- Por que importa: Com muitos concluídos, a seção cresce sem fim. Noise para o workflow principal.
- Fix: Accordion ou "Mostrar X concluídos" collapsible.
- Comando sugerido: /impeccable polish parcelamento

## Persona Red Flags

**Casey:** 12 parcelamentos concluídos + 3 ativos. Os 3 que importam ficam no fundo da lista.

## Minor Observations

- Sem loading.tsx dedicado — usa (app)/loading.tsx global (aceitável).
- ParcelamentoModal sem feedback de sucesso (toast.success já no onSaved → refresh chain).
