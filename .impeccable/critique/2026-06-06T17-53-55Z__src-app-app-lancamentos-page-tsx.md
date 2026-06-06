---
timestamp: 2026-06-06T17-53-55Z
slug: src-app-app-lancamentos-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Count label exists; zero loading feedback during filter/action state changes |
| 2 | Match System / Real World | 3 | Good pt-BR financial language; "Pago" vs "Realizado" distinction unclear |
| 3 | User Control and Freedom | 2 | No delete confirmation, no undo for status change, no clear-filters shortcut |
| 4 | Consistency and Standards | 3 | Semantic tokens mostly consistent; `text-green-500` hardcoded; selects differ from dashboard |
| 5 | Error Prevention | 1 | Single-click irreversible delete, single-click irreversible status change — no guardrails |
| 6 | Recognition Rather Than Recall | 3 | Mobile cards well-labeled; desktop icon-only actions with title-only tooltips |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts, no bulk actions, no sort/column toggle |
| 8 | Aesthetic and Minimalist Design | 3 | Clean; action column can overflow with 5+ buttons; filter selects style drift vs dashboard |
| 9 | Error Recovery | 1 | Server action failures produce no UI feedback in the table |
| 10 | Help and Documentation | 1 | No contextual help, no status legend, empty state offers no add CTA |
| **Total** | | **21/40** | **Acceptable — significant improvements needed** |

## Anti-Patterns Verdict

**LLM assessment**: No obvious AI slop tells. No gradient text, no side-stripe borders, no hero-metric templates. The surface feels functional and honest — data table with clear hierarchy, semantic token colors, mobile/desktop dual view. The risk here isn't visual cliché; it's functional roughness: destructive actions without guardrails, hardcoded color escapes, and a filter bar that drifted from the design system established in the dashboard.

**Deterministic scan**: Clean — `[]`. No structural anti-patterns found. Issues in this surface are behavioral (missing confirms, hardcoded utility classes) rather than visual (gradient text, side-stripe) — the detector correctly found nothing.

## Overall Impression

Solid foundation. The dual mobile/desktop view is well-executed and the semantic color usage is consistent across most of the surface. The biggest problem is not aesthetic — it's functional safety: a single tap permanently deletes financial data with no confirmation and no undo. That's the only P0, and it's a showstopper. Fix that first, then address the smaller token and UX gaps.

## What's Working

1. **Dual-view parity**: The mobile card and desktop table carry the same information at the right density for each form factor. Mobile cards show labeled actions ("Cód. Barras", "PIX", "Pagar"); desktop condenses to icon-only. This is correctly adapted, not just shrunk.

2. **Semantic color discipline**: `text-receita`, `text-despesa`, `bg-receita/10`, `bg-despesa/10` used consistently through the table, cards, and summary strip. The Signal Rule (emerald = entrada, ember = saída) is working here.

3. **Summary strip design**: The three contextual totals (Receitas / Despesas / Saldo) are compact `ring-1` rows, not elaborate stat cards with shadows and gradients. Restrained and appropriate for the data-heavy context.

## Priority Issues

**[P0] No confirmation before delete**
- **Why it matters**: Deleting a financial record is irreversible. A single click on Trash2 in the table or card fires `deletarLancamento` directly — no confirm dialog, no undo. A misclick or fat-finger permanently removes real financial data. This is the highest-severity UX flaw in the surface.
- **Fix**: Wrap the delete in a confirmation dialog. Minimum: `window.confirm("Excluir este lançamento?")` inside the form's submit handler (client-side). Better: a shadcn AlertDialog with "Cancelar" / "Excluir definitivamente".
- **Suggested command**: `/impeccable harden lancamentos`

**[P1] No confirmation before "Marcar como pago"**
- **Why it matters**: The Check button in both table and card fires `marcarComoPago` instantly. Status change is not obviously reversible from the UI — users might not know they can click edit to fix it. For an accidental tap on mobile, the status silently flips.
- **Fix**: Either add a lightweight confirm (AlertDialog or `window.confirm`) or make the status change visibly reversible (show "Desfazer" in a toast). Toast with undo action is the better UX — non-blocking and recoverable.
- **Suggested command**: `/impeccable harden lancamentos`

**[P1] `text-green-500` hardcoded — design system escape**
- **Why it matters**: The Check icon in `lancamentos-table.tsx:143` and `lancamento-card.tsx:103` uses `text-green-500`, bypassing the `--receita` token. In dark mode, `green-500` and `oklch(0.696 0.17 162)` won't match. If the receita token is ever adjusted, this escapes the change.
- **Fix**: Replace `text-green-500` with `text-receita` in both files. The semantic is the same (positive/income action).
- **Suggested command**: `/impeccable polish lancamentos`

**[P2] Two identical Copy icons with no visual differentiation**
- **Why it matters**: When a lancamento has both `codigoBarras` AND `chavePix`, the desktop table shows two consecutive `<Copy>` icons with no label. Users must hover to read `title=""` to know which does what. On touch, `title` never fires.
- **Fix**: Differentiate the two copy buttons visually. Options: (a) add short text labels to both ("Cód." / "PIX"), (b) use different icons (QR code icon for PIX, Barcode icon for código de barras), (c) merge into a single copy menu. The mobile card already does this correctly with text labels.
- **Suggested command**: `/impeccable polish lancamentos`

**[P2] Filter selects: `shadow-sm` + no `appearance-none` — drift from dashboard**
- **Why it matters**: Dashboard selects got `appearance-none` + custom `<ChevronDown>` + no shadow. Lancamentos `selectClass` still has `shadow-sm` (violates Flat-By-Default Rule) and no `appearance-none` (browser default arrow, inconsistent styling). Same interaction, different treatment.
- **Fix**: Apply the same treatment as dashboard: add `appearance-none`, remove `shadow-sm`, wrap each select in `<div className="relative">` with `<ChevronDown>` overlay.
- **Suggested command**: `/impeccable polish lancamentos`

## Persona Red Flags

**Riley (Stress Tester)**: Opens `/lancamentos`, selects 3 filters, clicks Trash2 on a row. Gone instantly. Tries keyboard Ctrl+Z — nothing. Refreshes — still gone. This is the P0 in practice. Riley also notices the two identical Copy icons, hovers both, realizes one is código de barras and one is PIX — only after hovering. On mobile, Riley taps both trying to figure it out.

**Casey (Mobile User)**: Card actions footer is tightly packed: Cód. Barras (labeled), PIX (labeled), Pagar (labeled), Edit (icon only), Delete (icon only). The icon-only Pencil and Trash2 buttons are `h-10 w-10` — 40px — barely meeting the 44px minimum. On a larger phone in landscape, the filter bar (4 selects) wraps to 2 rows, which is fine. But the "Filtros" label on the left of the filter bar occupies dead space on small screens and could be dropped in favor of the icon alone at `<sm`.

**Alex (Power User)**: No bulk delete. No sort by date/valor/category. No keyboard shortcut to open "Novo Lançamento". Filter changes auto-submit (good) but there's no URL-sharable filter state persistence — wait, actually there is (searchParams). Alex can bookmark a filtered view. That's a quiet strength Alex will discover.

## Minor Observations

- The `Inbox` icon in the empty state is generic — no CTA to add the first lançamento. A "Novo Lançamento" button in the empty state would convert better.
- `cn()` not used in `lancamentos-table.tsx` for conditional classes (template literals) — cosmetic code quality.
- `saldo` template literal on line 79 of page.tsx uses `${saldo >= 0 ? ...}` — should use `cn()`.
- The modal "Upload PDF" tab label is slightly ambiguous — it suggests uploading a PDF file, but the feature analyzes financial statements. A label like "Importar extrato" would be clearer.
- `NovoLancamentoModal` passes `onSuccess={() => setOpen(false)}` but the open state management is a simple `useState` — could be simplified to pass `setOpen` directly.
- Action column header "Ações" is right-aligned (`text-right`) but the column content `div.flex.justify-end` is also right-aligned — consistent, but the header has `font-medium` while all other headers do too. Fine.

## Questions to Consider

- "What happens when a user accidentally deletes 6 months of salary data — is there any recovery path in the database?"
- "Should 'Pago' and 'Realizado' be unified into one status, or does the distinction carry real meaning worth explaining in the UI?"
- "If you could add one power-user feature to the filter bar, what would it be — sort by valor, date range picker, or bulk select?"
