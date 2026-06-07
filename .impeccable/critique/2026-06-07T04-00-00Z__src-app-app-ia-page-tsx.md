---
target: src/app/(app)/ia/page.tsx
total_score: 28
p0_count: 0
p1_count: 2
timestamp: 2026-06-07T04-00-00Z
slug: src-app-app-ia-page-tsx
---
## Design Health Score

| # | Heuristica | Score | Issue |
|---|-----------|-------|-------|
| 1 | Visibility of System Status | 3 | AnalyzeButton spinner + "Analisando..." OK; loading.tsx skeleton |
| 2 | Match Real World | 3 | Sofia persona; pt-BR labels; status badges consistentes |
| 3 | User Control | 2 | Sem cancel durante análise; sem delete de análises antigas |
| 4 | Consistency | 3 | Cards ring-1 corretos; Badge variants iguais a lancamentos |
| 5 | Error Prevention | 2 | gerarAnalise pode falhar silenciosamente; sem guard se 0 lancamentos |
| 6 | Recognition | 3 | Context card mostra exatamente quais lancamentos entram na análise |
| 7 | Flexibility | 2 | take: 5 hardcoded; sem filtro de período; sem delete |
| 8 | Aesthetic | 3 | Flat design; ring-1 no empty state; tabela clean |
| 9 | Error Recovery | 3 | (app)/error.tsx cobre; toast.error viável no action |
| 10 | Documentation | 2 | Tagline descreve Sofia; sem hint sobre custo/rate limit |
| **Total** | | **28/40** | **Bom — 2 P1s de feedback** |

## Anti-Patterns Verdict

**LLM:** Limpo. Sem hero-metric template, sem gradient text. Sofia persona bem executada sem exagero.
**Detector:** [] — nenhum achado estrutural.

## Overall Impression

Página bem construída. Problema central: análise gerada sem confirmação visual além de revalidatePath. Usuário não sabe se análise foi criada com sucesso.

## What's Working

1. AnalyzeButton com useFormStatus — loading state correto sem estado manual.
2. Context card com lançamentos analisados — usuário entende o que a IA vai ver.
3. Empty state descritivo com CTA claro.

## Priority Issues

**[P1] Sem toast.success após gerarAnalise**
- Por que importa: revalidatePath re-renderiza mas sem animação ou confirmação explícita. Usuário pode clicar duas vezes achando que não funcionou.
- Fix: Retornar `{ success: true }` na action + toast.success("Análise gerada") via useEffect ou redirect com searchParam.
- Comando sugerido: /impeccable polish ia

**[P1] gerarAnalise sem guard para 0 lançamentos**
- Por que importa: Análise com 0 dados gera resposta AI inútil e consome tokens.
- Fix: Verificar lancamentos.length === 0 antes de chamar AI; retornar error para exibir mensagem inline.
- Comando sugerido: /impeccable harden ia

## Persona Red Flags

**Jordan:** Clica "Analisar agora", vê spinner, spinner some, lista aparece — mas não tem certeza se era análise nova ou dados antigos.
**Riley:** Abre página com 0 lançamentos cadastrados, clica Analisar, recebe análise genérica.

## Minor Observations

- take: 5 hardcoded — user com muitas análises não consegue ver histórico completo.
- Sem data relativa nas análises ("há 2 horas") — só data absoluta.
