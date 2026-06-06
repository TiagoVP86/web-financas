---
name: Web Finanças
description: Controle financeiro pessoal multi-usuário — claro, preciso, sem ruído
colors:
  commitment-violet: "oklch(0.52 0.233 277)"
  steady-emerald: "oklch(0.60 0.17 162)"
  honest-ember: "oklch(0.55 0.246 16)"
  background: "oklch(0.985 0 0)"
  card-surface: "oklch(1 0 0)"
  ink: "oklch(0.14 0 0)"
  muted-text: "oklch(0.50 0 0)"
  hairline-border: "oklch(0.90 0 0)"
  alert-red: "oklch(0.577 0.245 27.325)"
  accent-tint: "oklch(0.94 0.01 277)"
typography:
  display:
    fontFamily: "Geist Sans, Inter, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Geist Sans, Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Geist Sans, Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Geist Sans, Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist Sans, Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
  2xl: "1.125rem"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.commitment-violet}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "oklch(0.44 0.233 277)"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-text}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card-default:
    backgroundColor: "{colors.card-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px"
  input-default:
    backgroundColor: "{colors.card-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  badge-receita:
    backgroundColor: "oklch(0.93 0.04 162)"
    textColor: "oklch(0.35 0.17 162)"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  badge-despesa:
    backgroundColor: "oklch(0.94 0.04 16)"
    textColor: "oklch(0.38 0.246 16)"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
---

# Design System: Web Finanças

## 1. Overview

**Creative North Star: "The Glass Account"**

The design system is built on a single principle: surfaces reveal exactly what the numbers are. Nothing competes with the data. No shadows assert hierarchy over figures. No gradient accents distract from whether the month ended positive or negative. The interface is transparent — not blank, but deliberately clear, the way good glass is clear: you notice what's through it, not the glass itself.

The Glass Account is restrained by design, not by default. Commitment Violet is the sole expressive brand color; the entire surrounding palette stays neutral so it lands. Steady Emerald and Honest Ember carry chromatic weight because they carry financial meaning — income and expense, respectively. Everything else steps back. Adding color to chrome that carries no semantic signal is prohibited.

This system explicitly rejects: generic SaaS cream backgrounds and hero-metric cards with big glowing numbers; corporate banking navy and gold with stiff institutional layouts; startup dashboard purple gradients and glassmorphism; spreadsheet grey-on-grey with no visual hierarchy.

**Key Characteristics:**
- Flat tonal elevation — background, card, and sidebar differentiated by lightness only, no shadows
- Semantic color as the only accent — emerald for income, ember for expense, violet for the brand
- Typographic hierarchy through weight and size, not color or ornament
- Ring-boundary cards (1px ring at 10% foreground opacity) instead of shadowed cards
- Full dark-mode support for every surface and semantic token

## 2. Colors: The Glass Palette

Three roles. One neutral foundation. No color used decoratively.

### Primary
- **Commitment Violet** (`oklch(0.52 0.233 277)` / dark: `oklch(0.585 0.233 277)`): the brand primary. Active navigation state, primary buttons, focus rings, positive balance figures. This color is the one expressive choice in an otherwise neutral palette — its rarity is its power.

### Secondary
- **Steady Emerald** (`oklch(0.60 0.17 162)` / dark: `oklch(0.696 0.17 162)`): income signal. Every receita value, icon, and badge uses this color. It signals money received.
- **Honest Ember** (`oklch(0.55 0.246 16)` / dark: `oklch(0.644 0.246 16)`): expense signal. Every despesa value, icon, and badge uses this color. It signals money spent — not alarmingly, but honestly.

### Neutral
- **Near-White Canvas** (`oklch(0.985 0 0)`): the page background.
- **Card Surface** (`oklch(1 0 0)`): one step lighter than the canvas — cards float on the background through this single step.
- **Sidebar Surface** (`oklch(0.97 0 0)`): one step deeper than the canvas — the sidebar recedes.
- **Ink** (`oklch(0.14 0 0)`): primary body and heading text.
- **Muted Text** (`oklch(0.50 0 0)`): labels, secondary information, inactive nav items.
- **Hairline Border** (`oklch(0.90 0 0)`): dividers and card rings in light mode. In dark mode: `oklch(1 0 0 / 10%)` (10% white).
- **Alert Red** (`oklch(0.577 0.245 27.325)`): destructive actions and error states only — delete buttons, form validation errors, overdue bills.

### Named Rules
**The Signal Rule.** Steady Emerald means income. Honest Ember means expense. These two colors carry their meaning everywhere they appear — in values, icons, badges, and charts. They are never used decoratively. Never apply either to neutral UI chrome, labels, or non-financial data.

**The Violet Ceiling Rule.** Commitment Violet appears on ≤15% of any given screen. It is used for: one active nav item at a time, primary action buttons, focus rings, and positive balance values. Its restraint is what gives it weight.

## 3. Typography

**Body/UI Font:** Geist Sans (Inter, system-ui fallback stack)
**Mono Font:** Geist Mono (for future use — account numbers, transaction IDs)

**Character:** A single family used with deliberate weight contrast. No display typeface, no serif. Financial data demands legibility at small sizes and rapid scanning — typographic theatre gets in the way. Hierarchy is carried entirely by weight (400/500/600/700) and scale steps of ≥1.25.

### Hierarchy
- **Display** (700, clamp(1.5rem, 3vw, 2rem), 1.2, -0.01em tracking): Page titles and dashboard headings. One instance per screen.
- **Headline** (700, 1.25rem, 1.3): Section headings, modal titles.
- **Title** (600, 1rem, 1.4): Card titles, table column headers, form section labels.
- **Body** (400, 0.875rem, 1.5): All descriptive text and table cell content. Max line length 65–75ch.
- **Label** (500, 0.75rem, 1.4): Meta labels, badges, navigation links, secondary identifiers.

### Named Rules
**The One-Font Rule.** Geist Sans is the only typeface. If Geist is not loaded, the Inter / system-ui stack maintains the same proportions. Hierarchy comes from weight and size — never from introducing a second family.

**The Weight Rule.** Four weights in use: 400, 500, 600, 700. Each step marks a clear role. Do not use 300 (too light for financial data) or intermediate weights like 450 that collapse the hierarchy.

## 4. Elevation

This system is flat by doctrine. No `box-shadow` is used on cards, panels, inputs, or buttons at rest. Depth is conveyed through tonal layering: the canvas background (`oklch(0.985 0 0)`) is the floor; cards (`oklch(1 0 0)`) sit one step lighter on top; the sidebar (`oklch(0.97 0 0)`) sits one step deeper and recedes. In dark mode, the same tonal ladder inverts: canvas is near-black, cards are slightly lighter, sidebar deeper.

Cards use `ring-1 ring-foreground/10` as a boundary — a 1px ring at 10% foreground opacity. This is the only "line" in the system. It is not a shadow; it is a precise boundary.

### Named Rules
**The Flat-By-Default Rule.** `box-shadow` is prohibited at rest. The ring boundary conveys the card edge; the background tonal step conveys surface hierarchy. The sole exception is a modal backdrop overlay (`background: oklch(0 0 0 / 60%)`), which creates contrast for the modal surface — but the modal container itself has no shadow.

## 5. Components

### Buttons
Character: functional and direct. The button says what it does and gets out of the way.

- **Shape:** gently curved (radius-md, 0.5rem / 8px)
- **Primary:** Commitment Violet fill, near-white text, 8px 16px padding, 14px/500 weight. Hover: violet darkens to `oklch(0.44 0.233 277)`.
- **Ghost:** transparent background, muted-foreground text. Hover: accent-tint background (`oklch(0.94 0.01 277)`), ink text.
- **Destructive:** alert-red fill, white text. Same shape.
- **Icon-only variant (size icon):** 36px square, ghost style, centered icon.
- **Focus:** `ring-2 ring-commitment-violet ring-offset-2`.
- **Disabled:** 50% opacity, no pointer events.

### Cards
Character: a clean container that recedes. The content is the card.

- **Corner Style:** gently rounded (radius-xl, 0.875rem / 14px)
- **Background:** card-surface — white in light mode, `oklch(0.14 0 0)` in dark mode
- **Boundary:** `ring-1 ring-foreground/10` (never a border, never a shadow)
- **Internal Padding:** 16px (sm variant: 12px)
- **Footer:** muted/50 background with `border-t`, rounded-b-xl

### Summary Cards (signature component)
4-up metric grid on the dashboard. Each card: small label in muted-foreground (14px/500), semantic-colored financial figure (24px/700), matching icon (16px, same semantic color). The four figures are: Receitas (emerald), Despesas (ember), Saldo (violet if positive, ember if negative), A vencer (yellow-500 — the only place this color appears; represents urgency without the semantic meaning of ember).

### Inputs / Fields
- **Style:** 1px border (`hairline-border` color), card-surface background, radius-md (8px)
- **Focus:** `ring-2` at 50% opacity in Commitment Violet
- **Error:** ring in alert-red
- **Disabled:** 50% opacity

### Navigation — Sidebar
Desktop: collapsed icon-strip (56px) at rest, smooth width-expansion to 224px on hover (200ms ease-in-out). Active link: primary fill + primary-foreground text, radius-md. Hover state on inactive links: accent-tint background, accent-foreground text, radius-md. Bottom of sidebar: dark-mode toggle + sign-out icon button.

Mobile: fixed top bar (56px, card background, border-b) with brand logo left and action cluster right (dark-mode toggle + hamburger). Navigation opens in a Sheet (left drawer, 224px).

### Badges (Receita / Despesa)
Pill shape (radius-sm, ~6px). Receita badge: very light emerald tint background (`oklch(0.93 0.04 162)`), dark emerald text. Despesa badge: very light ember tint background (`oklch(0.94 0.04 16)`), dark ember text. 12px/500, 2px 8px padding.

## 6. Do's and Don'ts

### Do:
- **Do** render all income figures and icons in Steady Emerald (`oklch(0.60 0.17 162)`) — receitas in tables, cards, badges, charts.
- **Do** render all expense figures and icons in Honest Ember (`oklch(0.55 0.246 16)`) — despesas in tables, cards, badges, charts.
- **Do** use `ring-1 ring-foreground/10` as the card boundary. No `border`, no `box-shadow`.
- **Do** differentiate surfaces using background tokens: background → card-surface → sidebar (tonal steps, not shadows).
- **Do** support dark mode for every new component; all semantic color tokens have dark counterparts already defined in `globals.css`.
- **Do** use `text-wrap: balance` on h1–h3 headings to prevent orphan words.

### Don't:
- **Don't** use cream, sand, beige, or warm-tinted backgrounds. The canvas token is achromatic (`oklch(0.985 0 0)`, chroma 0). Warmth is not the brand.
- **Don't** add `box-shadow` to cards, inputs, or buttons at rest. This is explicitly a flat-tonal system, not a lifted-card system.
- **Don't** use gradient text (`background-clip: text`). Financial figures and labels use solid semantic color only.
- **Don't** use glassmorphism (`backdrop-filter: blur`) as a card or panel style — not on modals, not on the sidebar, not on dropdowns.
- **Don't** build identical icon + heading + text card grids — the generic SaaS pattern explicitly rejected in PRODUCT.md.
- **Don't** use Commitment Violet on UI chrome that carries no semantic or interactive meaning. It is reserved for the brand's active and interactive states.
- **Don't** use `border-left` wider than 1px as a colored accent stripe on list items, callouts, or alert banners. Use background tints or full borders instead.
- **Don't** add uppercase tracked eyebrow labels above section headings (the "ABOUT / PROCESS / PRICING" scaffold). Section hierarchy is communicated through the heading scale.
- **Don't** introduce navy + gold, corporate blue, or any bank-palette color alongside the violet primary. The anti-reference is explicit: the product must not feel like a banking app.
- **Don't** introduce a second brand accent without first resolving it against Commitment Violet. The restraint of a single accent is the system's coherence.
