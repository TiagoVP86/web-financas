---
target: src/app/(app)/configuracoes/page.tsx
total_score: 28
p0_count: 0
p1_count: 0
timestamp: 2026-06-07T05-30-00Z
slug: src-app-app-configuracoes-page-tsx
---
## Design Health Score — pós polish

| # | Heuristica | Score | Issue |
|---|-----------|-------|-------|
| 1 | Visibility of System Status | 3 | toast.success em salvar + criar; "Salvando..." / "Adicionando..." |
| 2 | Match Real World | 3 | Linguagem clara; label senha informativo |
| 3 | User Control | 3 | AlertDialog no delete; sem undo de nome mas esperado |
| 4 | Consistency | 3 | Ring-Only Rule: categoria items ring-1 ring-border/60 |
| 5 | Error Prevention | 3 | AlertDialog com aviso; validação HTML required |
| 6 | Recognition | 3 | Labels em todos os campos; delete tem aria-label |
| 7 | Flexibility | 2 | Sem atalho para adicionar |
| 8 | Aesthetic | 3 | Success inline usa text-receita + ring-receita/30 — design tokens |
| 9 | Error Recovery | 3 | Erro de perfil inline; CriarCategoria useActionState com error |
| 10 | Documentation | 1 | Sem tooltip contextual além dos labels |
| **Total** | | **28/40** | **Bom — sem P0/P1** |

## Fixes aplicados (2026-06-07)

- `ProfileForm` success message: hardcoded green → `text-receita ring-1 ring-receita/30 bg-receita/10`
- `ProfileForm`: `toast.success("Perfil atualizado")` via useEffect
- `CriarCategoriaForm`: `toast.success("Categoria adicionada")` no success branch
- Categoria list items: `border border-border/60` → `ring-1 ring-border/60` — Ring-Only Rule

## Previously fixed (pre-critique)

- ProfileForm: Eye/EyeOff toggles em ambos os campos de senha — P2 resolvido
- CriarCategoriaForm: useActionState com error handling — P1 resolvido
- AlertDialog no DeleteCategoriaButton — User Control correto

## Remaining

- [P2] defaultValue="#6366f1" para cor hardcoded (não brand primary)
- [P2] Sem tooltip contextual além de labels
