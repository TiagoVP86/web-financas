---
target: src/app/(app)/relatorios/page.tsx
total_score: 27
p0_count: 0
p1_count: 0
timestamp: 2026-06-07T05-45-00Z
slug: src-app-app-relatorios-page-tsx
---
## Design Health Score — pós auditoria

| # | Heuristica | Score | Issue |
|---|-----------|-------|-------|
| 1 | Visibility of System Status | 3 | loading.tsx skeleton existe; filter change mostra skeleton |
| 2 | Match Real World | 3 | Linguagem adequada; seletor mes/ano intuitivo |
| 3 | User Control | 3 | Mudar filtro = mudar de volta; controle suficiente |
| 4 | Consistency | 3 | Mesmo padrão AutoSubmit do Dashboard |
| 5 | Error Prevention | 2 | Sem error.tsx dedicado (cobre (app)/error.tsx global) |
| 6 | Recognition | 3 | Legend inline no BarChart; Pie com total central; escopo no título |
| 7 | Flexibility | 2 | Sem exportação; sem comparação de períodos |
| 8 | Aesthetic | 3 | Layout limpo; charts 2-col em lg |
| 9 | Error Recovery | 2 | (app)/error.tsx global cobre; sem error.tsx dedicado |
| 10 | Documentation | 2 | Títulos descrevem escopo ("últimos 12 meses"; "— Junho 2026") |
| **Total** | | **27/40** | **Bom — sem P0/P1** |

## Previously resolved (já existia antes da auditoria)

- loading.tsx skeleton com layout fiel à página — P1 loading resolvido
- MonthlyBarChart `isEmpty` empty state — P2 resolvido
- CategoryPieChart `periodo` no título; BarChart "últimos 12 meses" no título — P2 resolvido

## Remaining

- [P2] Sem exportação CSV/PDF
- [P2] Sem comparação entre dois períodos
- [P2] error.tsx dedicado (global cobre, mas granularidade melhor)
