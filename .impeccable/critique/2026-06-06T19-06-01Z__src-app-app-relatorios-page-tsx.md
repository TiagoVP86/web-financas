---
target: src/app/(app)/relatorios/page.tsx
total_score: 24
p0_count: 0
p1_count: 1
timestamp: 2026-06-06T19-06-01Z
slug: src-app-app-relatorios-page-tsx
---
## Design Health Score

| # | Heuristica | Score | Issue |
|---|-----------|-------|-------|
| 1 | Visibility of System Status | 2 | AutoSubmit navega sem loading indicator |
| 2 | Match System / Real World | 3 | Linguagem adequada; seletor mes/ano intuitivo |
| 3 | User Control and Freedom | 3 | Mudar filtro = mudar de volta; controle suficiente |
| 4 | Consistency and Standards | 3 | Mesmo padrao AutoSubmit do Dashboard |
| 5 | Error Prevention | 2 | Sem error boundary -- erro de DB = Next.js 500 |
| 6 | Recognition Rather Than Recall | 3 | Legend inline no BarChart; Pie com total central |
| 7 | Flexibility and Efficiency | 2 | Sem exportacao; sem comparacao de periodos |
| 8 | Aesthetic and Minimalist Design | 3 | Layout limpo; charts 2-col em lg |
| 9 | Error Recovery | 1 | Nenhum -- erro de DB = pagina de erro do Next.js |
| 10 | Help and Documentation | 1 | Sem subtitulo: Pie = mes selecionado, Bar = 12 meses fixos |
| **Total** | | **24/40** | **Aceitavel -- 3 fixes impactam clareza** |

## Anti-Patterns Verdict

**LLM:** Limpo. Charts com cores semanticas corretas. Sem slop.
**Detector:** [] -- nenhum achado estrutural.

## Overall Impression

Relatorios funciona. Problema maior e transparencia: sem loading, sem contexto de escopo dos charts.

## What's Working

1. Pie chart donut com total central -- evita hero-metric template.
2. Legenda inline no BarChart com dots de cor semantica.
3. overflow-x-auto na tabela -- mobile funciona corretamente.

## Priority Issues

**[P1] AutoSubmit sem loading indicator**
- Por que importa: Sem loading.tsx, filter change navega silenciosamente.
- Fix: Criar src/app/(app)/relatorios/loading.tsx com skeleton.
- Comando sugerido: /impeccable polish relatorios

**[P2] MonthlyBarChart sem empty state**
- Por que importa: 12 barras em altura zero parece bug, nao "sem dados".
- Fix: Verificar data.every e mostrar empty state.
- Comando sugerido: /impeccable polish relatorios

**[P2] Charts sem contexto de escopo**
- Por que importa: Pie usa mes selecionado; Bar sempre 12 meses. Assimetria nao comunicada.
- Fix: Subtitulo em cada CardTitle indicando o periodo.
- Comando sugerido: /impeccable clarify relatorios

## Persona Red Flags

**Jordan:** Muda mes, pagina recarrega sem feedback, pensa que clicou errado, clica de novo.
**Alex:** Quer comparar dois meses, nao tem. Muda filtro e espera loading que nunca aparece.

## Minor Observations

- Sem error.tsx na rota.
- fmtBRL no tooltip correto e consistente.
