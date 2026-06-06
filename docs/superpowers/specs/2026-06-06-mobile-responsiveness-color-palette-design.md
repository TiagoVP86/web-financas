# Mobile Responsiveness & Color Palette Design

## Goal

Refatorar a paleta de cores para um visual fintech moderno (dark mode primeiro, violeta/roxo como cor primária) e tornar todas as páginas com listas/tabelas usáveis em telas mobile via card view.

## Architecture

Two independent changes executed sequentially:

1. **Paleta:** Troca de CSS variables em `globals.css` — mudança global que afeta todos os componentes via design tokens. Zero mudança de lógica.
2. **Mobile:** Dual-view pattern por tabela — a tabela existente fica no desktop (`hidden md:block`), um card list novo aparece no mobile (`md:hidden`). Sem reescrever lógica de filtros, paginação ou ações.

## Tech Stack

- Tailwind CSS v4 (oklch color format, `@theme inline` para tokens)
- shadcn/ui (components consomem CSS variables via `--color-*`)
- next-themes (dark/light toggle já existente)
- React (componentes de card criados como Server ou Client conforme necessidade)

---

## Fase 1: Paleta de Cores

### CSS Variables — Dark Mode (`globals.css` `.dark`)

```css
--background:           oklch(0.07 0 0)          /* zinc-950 #09090b */
--foreground:           oklch(0.985 0 0)          /* zinc-50  #fafafa */
--card:                 oklch(0.14 0 0)           /* zinc-900 #18181b */
--card-foreground:      oklch(0.985 0 0)
--popover:              oklch(0.14 0 0)
--popover-foreground:   oklch(0.985 0 0)
--primary:              oklch(0.585 0.233 277)    /* violet-500 #8b5cf6 */
--primary-foreground:   oklch(0.985 0 0)
--secondary:            oklch(0.20 0 0)           /* zinc-800 aprox */
--secondary-foreground: oklch(0.985 0 0)
--muted:                oklch(0.20 0 0)
--muted-foreground:     oklch(0.65 0 0)
--accent:               oklch(0.24 0.025 277)     /* violet tint sutil */
--accent-foreground:    oklch(0.985 0 0)
--destructive:          oklch(0.644 0.246 16)     /* rose-500 #f43f5e */
--border:               oklch(1 0 0 / 10%)
--input:                oklch(1 0 0 / 15%)
--ring:                 oklch(0.585 0.233 277)    /* violet-500 */
--chart-1:              oklch(0.585 0.233 277)    /* violet   — primary */
--chart-2:              oklch(0.696 0.17 162)     /* emerald  — receita */
--chart-3:              oklch(0.644 0.246 16)     /* rose     — despesa */
--chart-4:              oklch(0.75 0.15 230)      /* azul */
--chart-5:              oklch(0.70 0.15 310)      /* púrpura */
--sidebar:              oklch(0.11 0 0)           /* mais escuro que card */
--sidebar-foreground:   oklch(0.985 0 0)
--sidebar-primary:      oklch(0.585 0.233 277)
--sidebar-primary-foreground: oklch(0.985 0 0)
--sidebar-accent:       oklch(0.20 0.01 277)
--sidebar-accent-foreground: oklch(0.985 0 0)
--sidebar-border:       oklch(1 0 0 / 10%)
--sidebar-ring:         oklch(0.585 0.233 277)
--receita:              oklch(0.696 0.17 162)     /* emerald-500 #10b981 */
--despesa:              oklch(0.644 0.246 16)     /* rose-500 #f43f5e */
```

### CSS Variables — Light Mode (`globals.css` `:root`)

```css
--background:           oklch(0.985 0 0)          /* zinc-50 */
--foreground:           oklch(0.14 0 0)            /* zinc-900 */
--card:                 oklch(1 0 0)               /* white */
--card-foreground:      oklch(0.14 0 0)
--popover:              oklch(1 0 0)
--popover-foreground:   oklch(0.14 0 0)
--primary:              oklch(0.52 0.233 277)      /* violet-600 — mais escuro para contraste em fundo claro */
--primary-foreground:   oklch(0.985 0 0)
--secondary:            oklch(0.94 0 0)            /* zinc-100 */
--secondary-foreground: oklch(0.14 0 0)
--muted:                oklch(0.94 0 0)
--muted-foreground:     oklch(0.50 0 0)
--accent:               oklch(0.94 0.01 277)       /* violet tint muito sutil */
--accent-foreground:    oklch(0.14 0 0)
--destructive:          oklch(0.577 0.245 27.325)
--border:               oklch(0.90 0 0)
--input:                oklch(0.90 0 0)
--ring:                 oklch(0.52 0.233 277)
--chart-1:              oklch(0.52 0.233 277)      /* violet */
--chart-2:              oklch(0.60 0.17 162)       /* emerald */
--chart-3:              oklch(0.55 0.246 16)       /* rose */
--chart-4:              oklch(0.55 0.15 230)
--chart-5:              oklch(0.55 0.15 310)
--sidebar:              oklch(0.97 0 0)
--sidebar-foreground:   oklch(0.14 0 0)
--sidebar-primary:      oklch(0.52 0.233 277)
--sidebar-primary-foreground: oklch(0.985 0 0)
--sidebar-accent:       oklch(0.94 0.01 277)
--sidebar-accent-foreground: oklch(0.14 0 0)
--sidebar-border:       oklch(0.90 0 0)
--sidebar-ring:         oklch(0.52 0.233 277)
--receita:              oklch(0.60 0.17 162)       /* emerald-600 — mais escuro p/ contraste em branco */
--despesa:              oklch(0.55 0.246 16)       /* rose-600 */
```

### Tokens Customizados no `@theme inline`

Adicionar no bloco existente:
```css
--color-receita: var(--receita);
--color-despesa: var(--despesa);
```

Isso expõe `text-receita`, `bg-receita`, `text-despesa`, `bg-despesa` como classes Tailwind.

### Substituição nos Componentes

Substituir apenas ocorrências semânticas de receita/despesa — **não** tocar em greens de estado de UI (checkmarks, ícones de sucesso).

Arquivos e linhas confirmados:

| Arquivo | Mudança |
|---|---|
| `src/components/recorrencias/recorrencia-card.tsx` | `text-green-500` / `text-red-500` → `text-receita` / `text-despesa` |
| `src/components/lancamentos/lancamentos-table.tsx` | idem (2 ocorrências de valor/tipo; manter `text-green-500` no ícone `Check`) |
| `src/components/extrato/transacoes-table.tsx` | `text-green-500` / `text-red-500` → `text-receita` / `text-despesa` |
| `src/components/extrato/extrato-resumo-card.tsx` | idem (4 ocorrências de valores receita/despesa/saldo) |
| `src/components/dashboard/summary-cards.tsx` | idem (receitas/despesas totais) |
| `src/app/(app)/ia/page.tsx` | idem (tabela de lançamentos) |
| `src/components/ia/analise-card.tsx` | `text-green-500` em "positivos" — manter como `text-emerald-500` (semântica diferente: sentiment positivo, não receita) |

---

## Fase 2: Mobile Responsiveness

### Princípio: Dual-View Pattern

Para cada tabela com problema mobile:
```tsx
{/* Desktop */}
<div className="hidden md:block">
  <ExistingTable ... />
</div>

{/* Mobile */}
<div className="md:hidden space-y-2">
  {items.map(item => <ItemCard key={item.id} item={item} ... />)}
</div>
```

O card mobile não duplica state nem handlers — recebe as mesmas props e callbacks da tabela.

---

### 2a. LancamentosTable — Card View Mobile

**Arquivo novo:** `src/components/lancamentos/lancamento-card.tsx`

Props idênticas à linha da tabela. O tipo `LancamentoRow` está definido em `lancamentos-table.tsx` — exportar de lá ou mover para arquivo de tipos compartilhado:
```tsx
interface LancamentoCardProps {
  lancamento: LancamentoRow  // mesmo tipo de lancamentos-table.tsx
  onCopy: (text: string, label: string) => void
}
```
O card chama `marcarComoPago` e `deletarLancamento` diretamente (mesmas server actions usadas na tabela).

Layout do card:
```
┌─────────────────────────────────────────┐
│ Descrição                  [DESPESA]    │
│ Categoria  •  DD/MM/YYYY                │
│                              -R$ 87,50  │
│  [✓ Pagar]          [✎ Editar] [🗑]    │
└─────────────────────────────────────────┘
```

- Valor: `text-receita` se RECEITA, `text-despesa` se DESPESA
- Badge tipo: variant `outline` com cor da borda correspondente
- Botão "Pagar": só aparece se status === "PENDENTE"
- Botões touch-friendly: `h-9 px-3` mínimo

**Arquivo modificado:** `src/components/lancamentos/lancamentos-table.tsx`

Envolve conteúdo existente em `<div className="hidden md:block">` e adiciona após:
```tsx
<div className="md:hidden space-y-2">
  {lancamentos.map(l => (
    <LancamentoCard key={l.id} lancamento={l} ... />
  ))}
</div>
```

---

### 2b. IA Page — Tabela de Lançamentos

**Arquivo:** `src/app/(app)/ia/page.tsx`

Mesma estratégia dual-view. Card simplificado (sem ações de editar/pagar — página de visualização):
```
┌──────────────────────────────┐
│ Descrição          [DESPESA] │
│ DD/MM/YYYY          -R$87,50 │
└──────────────────────────────┘
```

Implementado inline na página (sem componente separado — tabela da IA é mais simples).

---

### 2c. Relatórios — Tabela de Categorias

**Arquivo:** `src/app/(app)/relatorios/page.tsx`

Apenas wrap com `overflow-x-auto` + `min-w-full` na tabela interna. Tabela tem 3 colunas e dados curtos — scroll horizontal é suficiente.

---

### 2d. Sidebar — Ajuste de Cores

**Arquivo:** `src/components/layout/sidebar.tsx`

Verificar se usa classes hardcoded que conflitem com nova paleta. Ajustar para usar tokens do tema (`bg-sidebar`, `text-sidebar-foreground`, etc.). Sem mudança estrutural.

---

## Fora de Escopo

- Dashboard: já usa grid responsivo, sem regressão esperada
- Recorrências: já usa grid de cards, mobile-friendly
- Extrato: já tem `overflow-x-auto`, mobile razoável
- Configurações: formulário em coluna única, naturalmente responsivo
- Bottom navigation bar: não solicitado, manter drawer atual

---

## Critérios de Aceitação

- [ ] Dark mode tem fundo zinc-950, cards zinc-900, primário violet-500
- [ ] Light mode tem fundo zinc-50, primário violet-600
- [ ] `text-receita` e `text-despesa` funcionam como classes Tailwind
- [ ] Nenhuma ocorrência de `text-green-` ou `text-red-` nos componentes de valor
- [ ] Em tela < 768px, `/lancamentos` mostra cards em vez de tabela
- [ ] Em tela < 768px, `/ia` mostra cards em vez de tabela
- [ ] Em tela < 768px, `/relatorios` tabela de categorias tem scroll horizontal
- [ ] Desktop: todas as tabelas idênticas ao antes
- [ ] Dark/light toggle continua funcionando
