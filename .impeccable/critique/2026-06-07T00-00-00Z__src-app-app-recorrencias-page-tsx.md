---
timestamp: 2026-06-07T00-00-00Z
slug: src-app-app-recorrencias-page-tsx
total_score: 28
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | toggle tem toast.success; gerar tem toast; delete tem confirm |
| 2 | Match System / Real World | 3 | Linguagem adequada; scope hint text adicionado |
| 3 | User Control and Freedom | 3 | Delete tem AlertDialog; toggle reversivel com feedback imediato |
| 4 | Consistency and Standards | 3 | transition-shadow correto; ring hover animado; status usa primary (violet) |
| 5 | Error Prevention | 3 | Delete com confirm + aviso sobre lancamentos; toast.error em catches |
| 6 | Recognition Rather Than Recall | 3 | Botoes com labels (Editar/Pausar/Ativar/Excluir) |
| 7 | Flexibility and Efficiency | 2 | Sem filtro por frequencia/tipo; sem ordenacao |
| 8 | Aesthetic and Minimalist Design | 3 | Flat-By-Default OK; ring hover; sem shadow |
| 9 | Error Recovery | 3 | toast.error em handleDelete e handleToggle |
| 10 | Help and Documentation | 2 | Scope hint adicionado; sem explicacao de "Gerar lancamentos" |
| **Total** | | **28/40** | **Bom - polish concluido, P1s resolvidos** |

## Polish aplicado (2026-06-07)

- `transition-[outline]` corrigido para `transition-shadow duration-150`: ring hover anima suavemente
- `pt-4` removido de CardContent: eliminado double-padding (Card ja tem `py-4`)
- `handleToggle` emite `toast.success("Recorrencia pausada/ativada")`
- `handleFrequenciaChange`: ternario `? 1 : 1` simplificado para `setDiaVencimento(1)`
- Scope select: hint "Lancamentos ja pagos ou realizados nao sao alterados" adicionado

## Remaining

- [P2] Sem filtro por frequencia ou tipo na listagem
- [P2] "Gerar lancamentos" sem explicacao do que faz e quando e necessario
