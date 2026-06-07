---
target: src/app/(app)/orcamento/page.tsx
total_score: 27
p0_count: 0
p1_count: 2
timestamp: 2026-06-07T04-00-00Z
slug: src-app-app-orcamento-page-tsx
---
## Design Health Score

| # | Heuristica | Score | Issue |
|---|-----------|-------|-------|
| 1 | Visibility of System Status | 3 | DeleteOrcamentoButton pending; CriarOrcamentoForm "Salvando..." + toast; loading.tsx |
| 2 | Match Real World | 3 | Navegação mensal; limites por categoria; pt-BR meses |
| 3 | User Control | 3 | AlertDialog delete; navegação livre entre meses |
| 4 | Consistency | 3 | alerta token correto; ring-1; padrão igual DeleteContaButton |
| 5 | Error Prevention | 3 | AlertDialog delete; categoria já orçamentada filtrada no form |
| 6 | Recognition | 3 | Summary strip 3-col; progress bar semântico; "Estourado/Atenção/%" |
| 7 | Flexibility | 2 | Sem bulk delete; sem visão anual |
| 8 | Aesthetic | 3 | barColor semântico (receita/alerta/despesa); flat design |
| 9 | Error Recovery | 3 | CriarOrcamentoForm erro inline; toast.error no DeleteOrcamentoButton |
| 10 | Documentation | 1 | "Geral" explicado apenas no form; sem hint no card sobre o que significa |
| **Total** | | **27/40** | **Bom — 2 P1s de correctness** |

## Anti-Patterns Verdict

**LLM:** Limpo. Progress bars com semântica correta. Navegação de meses adequada.
**Detector:** [] — nenhum achado estrutural.

## Overall Impression

Feature bem construída após polish. Problema maior: lógica de summary strip tem double-counting quando há orçamento "geral" + orçamentos por categoria simultaneamente.

## What's Working

1. Progress bar tricolor (receita → alerta → despesa) — feedback visual imediato de situação.
2. Categoria já orçamentada removida do form — erro de duplicata impossível.
3. Empty state com PiggyBank + CTA claro para o período correto.

## Priority Issues

**[P1] totalGasto na summary strip tem double-counting**
- Por que importa: Se usuário tem orçamento "Geral" (gasto = totalDespesas) + orçamento "Alimentação" (gasto = despesas_alimentação), o totalGasto = totalDespesas + despesas_alimentação — número inflado e errado.
- Fix: Na summary strip, usar totalDespesas diretamente em vez de somar item.gasto.
- Comando sugerido: /impeccable polish orcamento

**[P1] "Disponível" usa totalDespesas mas "Total gasto" usa totalGasto — inconsistência**
- Por que importa: Dois campos da mesma strip usam bases diferentes. "Total gasto" pode ser maior que "Total orçado" mas "Disponível" mostrar positivo.
- Fix: Unificar para totalDespesas nos dois campos (o que o usuário gastou de fato no mês).
- Comando sugerido: /impeccable polish orcamento

## Persona Red Flags

**Jordan:** Tem orçamento Geral + Alimentação, vê "Total gasto R$ 2.500" mas só gastou R$ 1.800. Pensa que tem bug.

## Minor Observations

- "Geral (todas as despesas)" no card seria melhor como "(todas as categorias)".
- Sem indicação visual de qual mês está comparado ao atual.
