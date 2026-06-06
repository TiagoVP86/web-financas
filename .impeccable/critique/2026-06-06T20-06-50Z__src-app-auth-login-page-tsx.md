---
target: src/app/(auth)/login/page.tsx
total_score: 27
p0_count: 0
p1_count: 2
timestamp: 2026-06-06T20-06-50Z
slug: src-app-auth-login-page-tsx
---
## Design Health Score

| # | Heuristica | Score | Issue |
|---|-----------|-------|-------|
| 1 | Visibility of System Status | 3 | Spinner no SubmitButton; erro inline; sem loading de pagina |
| 2 | Match System / Real World | 4 | "Entrar", "Email", "Senha" sem jargao; erro claro |
| 3 | User Control and Freedom | 3 | Show/hide senha; link cadastro; sem "Esqueceu a senha?" |
| 4 | Consistency and Standards | 3 | Form padrao; dark theme isolado ao auth (intencional) |
| 5 | Error Prevention | 3 | required + type="email" + autocomplete |
| 6 | Recognition Rather Than Recall | 3 | Labels; show/hide; sem "lembrar-me" OK para financas |
| 7 | Flexibility and Efficiency | 2 | Enter para submit; sem persistent session visivel |
| 8 | Aesthetic and Minimalist Design | 2 | Blur blobs decorativos; shadow-2xl + glow no logo violam sistema |
| 9 | Error Recovery | 3 | "Email ou senha incorretos" especifico; form preserva input |
| 10 | Help and Documentation | 1 | Sem "Esqueceu a senha?"; sem help contextual |
| **Total** | | **27/40** | **Aceitavel -- 2 violations design system, 1 feature ausente** |

## Anti-Patterns Verdict

**LLM:** PRODUCT.md lista como anti-referencia: "Startup dashboards: purple gradients, glassmorphism, glowing accent numbers." O login atual tem exatamente isso: blur orbs decorativos, card semi-transparente sobre blur (glass), glow no logo, shadow-2xl. Auth pages merecem ser brand moments -- mas dentro do vocabulario do sistema, nao importando vocabulario externo.
**Detector:** [] -- nenhum achado estrutural.

## Overall Impression

Dark theme intencional e efetivo como separacao visual. O problema e a execucao: glassmorphism + glow e o estetico de 2023 que o PRODUCT.md rejeita. A identidade pode ser forte sem esses elementos -- o contraste dark/light entre auth e app ja faz o trabalho.

## What's Working

1. Dark theme na auth cria contraste claro "fora do app" vs "dentro" -- separacao de contexto valida.
2. Show/hide senha no login -- usabilidade solida.
3. Logo BarChart3 + nome "Minhas Financas" -- identidade imediata.

## Priority Issues

**[P1] Glassmorphism decorativo -- violacao de absolute ban**
- Dois orbs blur-[140px] no layout sao pura atmosfera. Card background /0.85 se torna glass sobre o blur. DESIGN.md: "Glassmorphism as default. Blurs and glass cards used decoratively. Rare and purposeful, or nothing."
- Fix: Remover os orbs. Card solido: oklch(0.13 0.01 277) sem alpha. Dark bg + card surface cria profundidade sem glass.
- Comando: /impeccable polish login

**[P1] boxShadow glow + shadow-2xl -- violacao Flat-By-Default**
- Logo: boxShadow glow decorativo. Card: shadow-2xl proibido at rest.
- Fix: Logo usa ring-1 ring-primary/30. Card sem shadow.
- Comando: /impeccable polish login

**[P2] Sem "Esqueceu a senha?"**
- Unico ponto de abandono real. Feature ausente ou omissao consciente.
- Fix: Decisao de produto.

**[P3] Inline styles com raw OKLCH fora dos tokens**
- style color: oklch(0.75 0.18 277) no span "Financas" -- valor fora do sistema.
- Fix: Usar text-primary ou CSS variable.
- Comando: /impeccable polish login

## Persona Red Flags

**Jordan:** Senha errada, quer resetar -- nao tem como. Abandona.
**Sam:** Blur orbs sao pointer-events-none; labels corretos; autocomplete setado. Sem problemas de a11y.

## Minor Observations

- O dark theme no layout usa className="dark" -- correto para dark mode tokens.
- Layout background oklch(0.08 0.015 277) e um near-black violet tinted -- adequado.
- autoComplete="email" e autoComplete="current-password" -- correto para gestores de senha.
