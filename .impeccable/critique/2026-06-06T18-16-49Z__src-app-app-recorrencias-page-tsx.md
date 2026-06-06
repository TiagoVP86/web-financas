---
timestamp: 2026-06-06T18-16-49Z
slug: src-app-app-recorrencias-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Spinner no "Gerar lançamentos" e toasts OK; sem feedback de falha no delete/toggle do card |
| 2 | Match System / Real World | 3 | Linguagem adequada; "Parcelas (vazio = indefinido)" e "scope" são jargão técnico |
| 3 | User Control and Freedom | 2 | Delete tem confirm; toggle (pausar/ativar) não tem — pode ser acionado por engano |
| 4 | Consistency and Standards | 2 | `hover:shadow-md` viola Flat-By-Default Rule; window.confirm vs AlertDialog (lancamentos); cor "Ativa" usa receita/emerald independente do tipo |
| 5 | Error Prevention | 2 | Delete tem confirm com aviso sobre lançamentos gerados; sem validação inline nos campos do modal |
| 6 | Recognition Rather Than Recall | 2 | Botões de ação nos cards são icon-only com title tooltip; "Gerar lançamentos" sem explicação |
| 7 | Flexibility and Efficiency | 2 | Sem filtro por frequência/tipo; sem ordenação; toggle rápido no card é eficiente |
| 8 | Aesthetic and Minimalist Design | 3 | Layout limpo; hover:shadow-md é o único ruído visual estrutural |
| 9 | Error Recovery | 1 | handleDelete e handleToggle não têm toast de erro — falhas silenciosas |
| 10 | Help and Documentation | 1 | Sem explicação do que "Gerar lançamentos" faz; "scope" sem contexto; zero help contextual |
| **Total** | | **20/40** | **Aceitável — melhorias significativas necessárias** |

## Anti-Patterns Verdict

**LLM:** Sem gradient text, sem side-stripe, sem hero-metric template. O grid 3-col de cards é funcional (não um slop grid — os cards carregam densidade real: valor, categoria, status, parcelas, próxima geração). O risco aqui é drift de design system: `hover:shadow-md` viola o Flat-By-Default Rule estabelecido em DESIGN.md, e a cor semântica "Ativa" usa `text-receita` para qualquer tipo, quebrando o Signal Rule.

**Detector:** Limpo — `[]`. Nenhum anti-padrão estrutural. Os problemas são semânticos e funcionais, não estruturais.

## Overall Impression

Feature bem construída funcionalmente — lógica de frequência, parcelas, scope de edição, geração manual, toast feedback no caminho feliz. A rugosidade é de acabamento: um hover com shadow que viola o design system, status ativo usando a cor errada, e silêncio total quando ações de rede falham. Fixes pontuais e o surface está pronto para produção.

## What's Working

1. **Empty state com CTA inline**: O estado vazio mostra ícone + texto + botão "Nova recorrência" — descobre e orienta em vez de só exibir espaço vazio. Melhor que o empty state genérico de lançamentos.

2. **Resumo contextual no subtítulo**: "X ativas · Y no total · saldo mensal R$..." no subtítulo da página entrega contexto financeiro imediato sem precisar de stat cards dedicados. Restrained e correto para este contexto.

3. **Densidade de informação no card**: Cada card mostra descrição + valor + frequência badge + categoria + status + próxima geração + parcelas — tudo sem parecer lotado. O layout em três zonas (header, metadata row, footer) está bem calibrado.

## Priority Issues

**[P1] `hover:shadow-md` — viola Flat-By-Default Rule do DESIGN.md**
- **Por que importa**: DESIGN.md estabelece explicitamente "no box-shadow at rest." `hover:shadow-md` adiciona sombra no hover — a regra é específica sobre hover também. Dois componentes no codebase já foram corrigidos por isso (summary-cards.tsx). Esta é a mesma violação.
- **Fix**: Substituir `hover:shadow-md` por `group-hover:ring-2 group-hover:ring-primary/30` (ou `hover:ring-2 hover:ring-primary/30`), com `transition-[box-shadow]` → `transition-[box-shadow,outline]`. Envolver em `group` se necessário.
- **Comando sugerido**: `/impeccable polish recorrencias`

**[P1] Status "Ativa" usa `text-receita`/`bg-receita` independente do tipo**
- **Por que importa**: O Signal Rule do DESIGN.md: emerald = receita. Um `RecorrenciaCard` de DESPESA ativa mostra o dot e label "Ativa" em emerald — mesma cor usada para receitas. Isso contradiz o sistema semântico e pode confundir usuários que aprenderam "verde = entrada". Status ativo/pausado é um estado neutro, não uma indicação de tipo financeiro.
- **Fix**: Trocar `bg-receita/10 text-receita` / `bg-receita` por `bg-primary/10 text-primary` / `bg-primary` para o status ativo. Primary (violet) = estado do sistema; receita (emerald) = tipo financeiro.
- **Comando sugerido**: `/impeccable polish recorrencias`

**[P1] Falhas em handleDelete e handleToggle são silenciosas**
- **Por que importa**: Os blocos `try/finally` em `handleDelete` e `handleToggle` não têm `catch` com feedback. Se a API retornar erro, o loading spinner para, mas o usuário não sabe o que aconteceu. Para uma ação de rede num app financeiro, silêncio = perda de confiança.
- **Fix**: Adicionar `toast.error()` nos blocos catch de ambas as funções. Padrão já usado em `handleGerar`.
- **Comando sugerido**: `/impeccable harden recorrencias`

**[P2] Botões de ação no card são icon-only**
- **Por que importa**: Pencil, Pause/Play e Trash2 têm apenas `title=""` (tooltip de hover) — invisível em touch. Inconsistente com `LancamentoCard` que usa labels de texto nos botões de ação mobile. Para uma feature com 3 ações distintas (editar, pausar, excluir) onde pausar e excluir têm consequências muito diferentes, a distinção visual importa.
- **Fix**: Adicionar labels de texto curtos, especialmente para Pause/Play: "Pausar" / "Ativar". Ou ao menos um `aria-label` descritivo + label visível abaixo do ícone para mobile.
- **Comando sugerido**: `/impeccable polish recorrencias`

**[P2] `window.confirm()` inconsistente com o sistema — lancamentos usa AlertDialog**
- **Por que importa**: `lancamentos` acabou de ser migrado para AlertDialog no delete. `recorrencias` usa `window.confirm()` (nativo do browser) no mesmo padrão. Usuário aperta "Excluir" em lançamentos → styled dialog; aperta "Excluir" em recorrências → browser alert. Inconsistência de padrão.
- **Fix**: Migrar `handleDelete` para AlertDialog, seguindo o mesmo padrão implementado em `LancamentoCard`. O AlertDialog já está instalado no projeto.
- **Comando sugerido**: `/impeccable polish recorrencias`

## Persona Red Flags

**Jordan (First-Timer):** Abre a página, vê os cards com 3 ícones no rodapé. Não sabe que o ícone do meio é Pause/Play. Clica — a recorrência passa de "Ativa" para "Pausada" silenciosamente. Não sabe se funcionou ou quebrou. Olha para o botão "Gerar lançamentos" — não sabe o que acontece se clicar. Clica — toast diz "0 lançamentos a gerar". Não entende por quê. Nenhuma explicação disponível.

**Casey (Mobile):** Tenta identificar os três ícones de ação no rodapé do card. No mobile, `title` nunca aparece. Toca no ícone do meio tentando identificar — recorrência pausa. Toca de novo — reativa. Sem confirmação, sem feedback sonoro, sem label de texto. O ícone `Pause`/`Play` muda mas nada mais sinaliza o resultado.

**Alex (Power User):** Quer pausar todas as recorrências de despesa por um mês. Precisa clicar em cada card individualmente. Sem bulk actions, sem filtro por tipo. A ordenação é por `createdAt desc` — sem como reordenar por valor ou frequência.

## Minor Observations

- `RecorrenciaModal` label "Parcelas (vazio = indefinido)" — reescrever para "Total de parcelas" com hint text `placeholder="∞ (contínua)"`.
- `RecorrenciaModal` campo "Primeira geração em" não aparece no modo de edição — correto, mas não há explicação de por quê. Uma nota explicativa seria bem-vinda.
- `RecorrenciaModal` campo "Aplicar alterações a" — os valores "Somente lançamentos futuros" / "Todos os lançamentos pendentes" são claros, mas o conceito de "scope" pode ser explicado com uma linha de descrição abaixo do select.
- `handleFrequenciaChange` reseta `diaVencimento` para 0 quando muda para SEMANAL — correto, mas `diaVencimento = 0` representa "Domingo" que pode não ser o dia esperado pelo usuário. Considerar default para 1 (Segunda).
- Template literal `${gerando ? "animate-spin" : ""}` no ícone do botão — usar `cn()`.
