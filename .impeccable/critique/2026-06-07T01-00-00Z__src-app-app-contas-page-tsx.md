---
timestamp: 2026-06-07T01-00-00Z
slug: src-app-app-contas-page-tsx
total_score: 21
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Criar: reset silencioso sem toast. Delete: sem feedback de erro |
| 2 | Match Real World | 3 | Labels corretos, formatacao OK |
| 3 | User Control | 1 | P0: delete sem confirmacao — server action dispara imediato |
| 4 | Consistency | 2 | Inline form vs modal (lancamentos). Zero balance em emerald (sinal incorreto) |
| 5 | Error Prevention | 1 | Delete irrevevogavel sem confirm. Touch target delete 28px (WCAG min 44px) |
| 6 | Recognition | 3 | Icones por tipo, cor do usuario, labels claros |
| 7 | Flexibility | 2 | Sem edit de conta (nome/cor/tipo). So criar e deletar |
| 8 | Aesthetic | 3 | Ring correto, flat-by-default OK |
| 9 | Error Recovery | 2 | Delete falha silenciosamente (server action form sem catch client-side) |
| 10 | Documentation | 2 | "Saldo inicial" sem explicacao; sem hint no color picker |
| **Total** | | **21/40** | **Aceitavel — P0 critico + 2 P1s** |

## Fixes aplicados no mesmo passo (polish inline)

- **P0 resolvido**: `DeleteContaButton` client component com AlertDialog. Mensagem explica que lancamentos ficam sem conta atribuida.
- **P1 resolvido**: `saldoClass(saldo)` funcao — zero balance agora `text-muted-foreground` (nem receita nem despesa)
- **P1 resolvido**: `toast.success("Conta adicionada")` em CriarContaForm apos reset
- Touch target: h-7 w-7 -> h-8 w-8 no DeleteContaButton

## Score pos-fix estimado: ~28/40

## Remaining

- [P2] Sem funcionalidade de editar conta (nome, cor, tipo, saldo inicial)
- [P2] CriarContaForm inline vs modal padrao do restante do app
- [P2] "Saldo inicial" sem hint text explicando o que significa
