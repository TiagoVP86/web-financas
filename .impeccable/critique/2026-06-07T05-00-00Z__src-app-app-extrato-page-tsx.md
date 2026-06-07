---
target: src/app/(app)/extrato/page.tsx
total_score: 29
p0_count: 0
p1_count: 0
timestamp: 2026-06-07T05-00-00Z
slug: src-app-app-extrato-page-tsx
---
## Design Health Score — pós polish

| # | Heuristica | Score | Issue |
|---|-----------|-------|-------|
| 1 | Visibility of System Status | 3 | Spinner + "Sofia analisando..." OK; badge "Importado" OK |
| 2 | Match Real World | 3 | Sofia com personalidade; tipos de arquivo explícitos |
| 3 | User Control | 2 | UploadZone sempre visível; sem "limpar análise" explícito |
| 4 | Consistency | 3 | Ring-Only Rule aplicado em todos os containers |
| 5 | Error Prevention | 3 | accept= no input; erros inline; warning de import parcial |
| 6 | Recognition | 3 | Seletor de categoria por linha; botão mostra contagem |
| 7 | Flexibility | 2 | Toggle-all; sem bulk-set de categoria |
| 8 | Aesthetic | 3 | Stat mini-cards ring-1; zero saldo neutral; flat correto |
| 9 | Error Recovery | 3 | Empty state em transações; erros inline upload |
| 10 | Documentation | 2 | Tagline explica Sofia; sem help sobre OFX |
| **Total** | | **29/40** | **Bom — sem P0/P1** |

## Fixes aplicados (2026-06-07)

- `ExtratoResumoCard` stat mini-cards: `rounded-lg border` → `rounded-lg ring-1 ring-foreground/10` — Ring-Only Rule
- `ExtratoResumoCard` saldo: `saldo >= 0 ? text-receita` → three-way (> receita / < despesa / = foreground) — Signal Rule
- `TransacoesTable` já tinha empty state e text-despesa corretos na versão atual

## Remaining

- [P2] Selects de categoria em h-7 pequenos para toque mobile
- [P2] Limite 10MB não validado client-side
- [P2] Sem help sobre formato OFX
