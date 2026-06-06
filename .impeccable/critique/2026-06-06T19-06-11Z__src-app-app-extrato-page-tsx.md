---
target: src/app/(app)/extrato/page.tsx
total_score: 26
p0_count: 0
p1_count: 3
timestamp: 2026-06-06T19-06-11Z
slug: src-app-app-extrato-page-tsx
---
## Design Health Score

| # | Heuristica | Score | Issue |
|---|-----------|-------|-------|
| 1 | Visibility of System Status | 3 | Spinner + "Sofia analisando..." OK; badge "Importado" OK |
| 2 | Match System / Real World | 3 | "Sofia analisa" com personalidade; tipos de arquivo explícitos |
| 3 | User Control and Freedom | 2 | UploadZone sempre visivel; sem "limpar analise" explicito |
| 4 | Consistency and Standards | 3 | Padroes Card/Button/Badge consistentes |
| 5 | Error Prevention | 3 | accept= no input; erros inline; warning de import parcial |
| 6 | Recognition Rather Than Recall | 3 | Seletor de categoria por linha; botao mostra contagem |
| 7 | Flexibility and Efficiency | 2 | Toggle-all; sem bulk-set de categoria |
| 8 | Aesthetic and Minimalist Design | 3 | Upload zone clara; tabela densa mas contextualmente correta |
| 9 | Error Recovery | 2 | Erros de upload inline; empty state de transacoes ausente |
| 10 | Help and Documentation | 2 | Tagline explica Sofia; sem help sobre OFX |
| **Total** | | **26/40** | **Aceitavel -- 3 violations do design system** |

## Anti-Patterns Verdict

**LLM:** Limpo. UploadZone tem personalidade. ExtratoResumoCard 3-col e contextual. Uma violacao Ring-Only Rule.
**Detector:** [] -- nenhum achado estrutural.

## Overall Impression

Feature bem construida com boa cobertura de estados. 3 issues sao violations do design system e um edge case. Fixes rapidos.

## What's Working

1. UploadZone com "Sofia esta analisando..." -- personalidade e contexto ao processo AI.
2. Coverage de estados: loading, success, warning parcial, badge "Importado" por linha.
3. Toggle-all + override de categoria por linha -- workflow de revisao bem pensado.

## Priority Issues

**[P1] ExtratoResumoCard usa border-primary/30 -- viola Ring-Only Rule**
- Por que importa: DESIGN.md proibe border em cards. Inconsistente com todos os outros cards do app.
- Fix: Trocar className="border-primary/30" por className="ring-1 ring-primary/30".
- Comando sugerido: /impeccable polish extrato

**[P1] TransacoesTable sem empty state**
- Por que importa: IA pode extrair 0 transacoes. tbody vazio parece bug.
- Fix: Adicionar linha de empty state no tbody.
- Comando sugerido: /impeccable polish extrato

**[P1] Valor de despesa sem text-despesa -- viola Signal Rule**
- Por que importa: Apenas receita recebe cor. Despesas ficam em ink. Signal Rule exige Ember em todos os valores financeiros de despesa.
- Fix: t.tipo === "RECEITA" ? "text-receita" : "text-despesa" na coluna de valor.
- Comando sugerido: /impeccable polish extrato

## Persona Red Flags

**Riley:** Upload OFX vazio, IA retorna 0 transacoes, tbody vazio, nao sabe se falhou ou foi bem sucedido.
**Casey:** Selects de categoria por linha em h-7/text-xs sao pequenos para toque em mobile.

## Minor Observations

- Minus icon para saldo e generico; Scale comunicaria melhor "saldo liquido".
- Limite 10MB nao validado client-side.
- Checkboxes de linha sem aria-label individual.
