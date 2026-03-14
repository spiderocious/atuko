# Flōw — Brand & Design Guide
**Version 1.0**

---

## Brand Personality

Flōw is a **personal productivity tool for sharp people**. It should feel like the best-designed app on your computer — not a developer utility, not an enterprise dashboard. Think of the emotional register of **Linear**, **Craft**, or **Arc**: calm confidence, considered spacing, nothing wasted.

The product automates repetitive work. The design should feel like it's already done the hard thinking for you. **Effortless. Precise. Trustworthy.**

**Three words to design toward:**
- **Calm** — never loud, never panicked, never cluttered
- **Precise** — every pixel intentional, every label clear
- **Alive** — subtle motion, responsive, feels like it's paying attention

---

## Color System

### Primary Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-brand` | `#7C5CFC` | Primary actions, active states, key UI moments |
| `--color-brand-light` | `#9B80FD` | Hover states on brand elements |
| `--color-brand-dim` | `#EDE9FF` | Brand-tinted backgrounds, selected states (light mode) |
| `--color-brand-dark` | `#5B3FD4` | Pressed states, strong emphasis |

A warm violet. Not the cold indigo of developer tools. Not the garish purple of early SaaS. Closer to what you'd pick if you were designing a premium macOS app.

---

### Neutral Palette (Light Mode)

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#FAFAFA` | Page / panel background |
| `--color-surface` | `#FFFFFF` | Cards, modals, popups, inputs |
| `--color-surface-raised` | `#F4F4F5` | Hover states, secondary surfaces |
| `--color-surface-overlay` | `#EFEFEF` | Pressed states, dividers |
| `--color-border` | `#E4E4E7` | Default borders |
| `--color-border-strong` | `#D1D1D6` | Emphasized borders, focused inputs |
| `--color-text-primary` | `#18181B` | Headlines, body, important labels |
| `--color-text-secondary` | `#52525B` | Supporting text, metadata |
| `--color-text-tertiary` | `#A1A1AA` | Placeholders, disabled, timestamps |
| `--color-text-inverse` | `#FFFFFF` | Text on dark/brand backgrounds |

---

### Neutral Palette (Dark Mode)

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#111113` | Page background |
| `--color-surface` | `#1C1C1F` | Cards, modals, panels |
| `--color-surface-raised` | `#28282C` | Hover states |
| `--color-surface-overlay` | `#323236` | Active/pressed states |
| `--color-border` | `#2E2E32` | Default borders |
| `--color-border-strong` | `#3F3F46` | Focused inputs, strong dividers |
| `--color-text-primary` | `#FAFAFA` | Primary content |
| `--color-text-secondary` | `#A1A1AA` | Supporting text |
| `--color-text-tertiary` | `#52525B` | Placeholders, disabled |
| `--color-text-inverse` | `#18181B` | Text on light overlays |

> Dark mode background is **not** pure black. `#111113` has a barely perceptible warm-cool mix that feels premium without being harsh on the eyes. Never go below `#0D0D10`.

---

### Semantic Colors

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--color-success` | `#16A34A` | `#22C55E` | Completed runs, success states |
| `--color-success-bg` | `#F0FDF4` | `#052E16` | Success banners, toasts |
| `--color-warning` | `#D97706` | `#F59E0B` | Paused state, fragile selectors |
| `--color-warning-bg` | `#FFFBEB` | `#1C1400` | Warning banners |
| `--color-error` | `#DC2626` | `#EF4444` | Failed steps, errors |
| `--color-error-bg` | `#FEF2F2` | `#1C0505` | Error banners |
| `--color-info` | `#2563EB` | `#60A5FA` | Neutral information |
| `--color-info-bg` | `#EFF6FF` | `#0A1628` | Info banners |

---

### Status Indicator Colors

These are used in the runtime toast and popup to show workflow state at a glance.

| State | Color | Hex (light) |
|---|---|---|
| Idle | Neutral grey | `#A1A1AA` |
| Running | Brand violet | `#7C5CFC` |
| Waiting / Paused | Amber | `#F59E0B` |
| Success | Emerald | `#22C55E` |
| Failed | Red | `#EF4444` |
| Dry run | Cyan | `#06B6D4` |

---

## Typography

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `--text-xs` | 11px | 16px | 400 | Timestamps, badges, fine print |
| `--text-sm` | 13px | 20px | 400 | Secondary labels, metadata, captions |
| `--text-base` | 14px | 22px | 400 | Default body, list items, step labels |
| `--text-md` | 15px | 24px | 400 | Primary body, form labels |
| `--text-lg` | 17px | 26px | 500 | Section headings, panel titles |
| `--text-xl` | 20px | 28px | 600 | Page headings |
| `--text-2xl` | 24px | 32px | 600 | Large headings |
| `--text-3xl` | 30px | 38px | 700 | Hero / display text (marketing only) |

> **Note:** This is a UI extension — not a website. Keep text small and tight. 14px is your workhorse. Resist the urge to go bigger.

---

### Font Stack

**Primary (UI):** `Inter`, then system fallbacks
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Monospace (code, selectors, JSON):** `'JetBrains Mono'`, then system fallbacks
```css
font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

Inter is the right call for a UI extension. It was designed for screens and performs well at small sizes. The variable font version is preferred — it allows weight interpolation and reduces bundle size.

---

### Font Weight Usage

| Weight | Usage |
|---|---|
| 400 — Regular | Body text, descriptions, secondary labels |
| 500 — Medium | Labels, field names, step names, nav items |
| 600 — Semibold | Headings, active nav, important values |
| 700 — Bold | Page titles, CTAs, empty state headlines |

Never use 300 (too thin for small sizes) or 800+ (too heavy for a calm product tone).

---

### Letter Spacing

- **Headings above 20px:** `letter-spacing: -0.02em` — tighten large text slightly
- **All-caps labels:** `letter-spacing: 0.06em` — open up uppercase text
- **Body and UI text:** `letter-spacing: 0` — default, don't touch

---

## Spacing System

Based on a **4px grid**. Every spacing value is a multiple of 4.

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Tight gaps between inline elements |
| `--space-2` | 8px | Icon padding, tight internal padding |
| `--space-3` | 12px | Input internal padding, small gaps |
| `--space-4` | 16px | Standard component padding |
| `--space-5` | 20px | Section gaps, card padding |
| `--space-6` | 24px | Panel padding |
| `--space-8` | 32px | Large section gaps |
| `--space-10` | 40px | Page section spacing |
| `--space-12` | 48px | Hero spacing (side panel only) |

**Rule:** When in doubt, use more space not less. Cramped UIs feel anxious. Generous spacing is what makes Linear and Notion feel calm.

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 4px | Tags, badges, small chips |
| `--radius-md` | 6px | Buttons, inputs, small cards |
| `--radius-lg` | 8px | Cards, panels, dropdowns |
| `--radius-xl` | 12px | Modals, large panels |
| `--radius-2xl` | 16px | Toast, popup container |
| `--radius-full` | 9999px | Pills, avatars, toggle switches |

Do not use radius below 4px. Sharp corners look unfinished. Do not exceed 16px on non-pill elements — it starts to look toy-like.

---

## Elevation & Shadow

Shadows establish hierarchy. Flōw uses three levels.

| Level | Token | Value | Usage |
|---|---|---|---|
| 1 — Subtle | `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)` | Cards, inactive panels |
| 2 — Raised | `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)` | Dropdowns, hover cards |
| 3 — Floating | `--shadow-lg` | `0 10px 25px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.06)` | Modals, popup, toast |

**Dark mode:** Reduce opacity by ~40% and add a subtle border instead of relying on shadow alone. Shadows are less visible on dark backgrounds — borders carry the elevation signal.

```css
/* Dark mode elevation pattern */
box-shadow: 0 4px 6px rgba(0,0,0,0.3);
border: 1px solid var(--color-border);
```

---

## Iconography

**Icon library:** [Lucide](https://lucide.dev) — consistent stroke width, large library, clean aesthetic.

| Rule | Detail |
|---|---|
| Size — default | 16px in UI, 14px in tight contexts (dropdowns, badges) |
| Size — actions | 18px for standalone action buttons |
| Size — empty states | 32–40px |
| Stroke width | 1.5px — do not use 2px (too heavy) or 1px (too thin) |
| Color | Match text color of context — don't use icon-specific colors unless semantic (status, error) |
| Optical alignment | Icons often need `position: relative; top: 1px` to sit on the text baseline correctly |

Never use filled icons alongside stroke icons in the same context. Pick one style and commit. Lucide is stroke — stay with stroke.

---

## Component Patterns

### Buttons

Three variants. That's it.

| Variant | Use for |
|---|---|
| **Primary** — brand fill | The one main action on a surface. One per view. |
| **Secondary** — border only | Supporting actions alongside primary. |
| **Ghost** — no border, no fill | Tertiary actions, icon buttons, destructive (with red text). |

```
Primary:   bg: brand, text: white, hover: brand-dark
Secondary: bg: transparent, border: border-strong, text: text-primary, hover: surface-raised
Ghost:     bg: transparent, text: text-secondary, hover: surface-raised
```

**Sizes:**
- `sm` — height 28px, padding 0 10px, text-sm
- `md` — height 32px, padding 0 12px, text-base (default)
- `lg` — height 36px, padding 0 16px, text-md

**Never** stretch a button to full width except inside a modal footer or a narrow mobile view.

---

### Inputs & Form Fields

```
Height:       32px (md), 28px (sm)
Padding:      0 12px
Border:       1px solid var(--color-border)
Border-radius: var(--radius-md)
Background:   var(--color-surface)
Focus ring:   2px solid var(--color-brand), offset 0
```

Labels sit **above** the input, never inside (placeholder text is not a label). Label weight: 500, size: text-sm, color: text-secondary.

Error state: border becomes `--color-error`, error message appears below in text-sm / error color.

---

### Cards & Panels

All cards use `--shadow-sm` and `--radius-lg`. Padding is `--space-4` for small cards, `--space-6` for larger panels.

A card has at most **three visual layers:**
1. Background fill
2. Border
3. Content

Do not add shadows to elements that already sit inside a card. Inner-shadow nesting looks heavy.

---

### Badges & Status Pills

```
Height:       20px
Padding:      0 8px
Border-radius: var(--radius-full)
Font:         text-xs, weight 500
```

Always use semantic color pairs (background + text, never just background). Example:

```css
/* Success badge */
background: var(--color-success-bg);
color: var(--color-success);
```

---

### The Toast (Runtime)

The toast is Flōw's most visible UI moment. It must feel polished and trustworthy — this is what users see while a workflow is touching their browser.

```
Width:          300px fixed
Position:       bottom-right, 16px from edges
Border-radius:  var(--radius-2xl)
Shadow:         var(--shadow-lg)
Background:     var(--color-surface) with blur backdrop
Border:         1px solid var(--color-border)
Animation in:   slide up + fade, 200ms ease-out
Animation out:  slide down + fade, 150ms ease-in
```

Internal structure: workflow name (text-sm, weight 600), current step label (text-sm, text-secondary), step counter (text-xs, text-tertiary), status dot (8px circle), control buttons (ghost, sm).

**Do not put too much in the toast.** It should answer one question: what is happening right now?

---

## Motion & Animation

### Principles

- **Purposeful** — animate to communicate, not to decorate
- **Fast** — UI transitions should not feel like waiting
- **Consistent** — same actions always produce the same motion

### Duration Scale

| Token | Duration | Usage |
|---|---|---|
| `--duration-fast` | 100ms | Hover states, focus rings, color changes |
| `--duration-base` | 150ms | Buttons, toggles, badges |
| `--duration-moderate` | 200ms | Panels opening, dropdowns, toasts |
| `--duration-slow` | 300ms | Modals, side panel, page transitions |

Never exceed 300ms for UI feedback. Never go below 100ms for things that need to feel intentional.

### Easing

```css
--ease-out:    cubic-bezier(0.0, 0.0, 0.2, 1);   /* default for most UI — fast start, soft stop */
--ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);   /* panels, modals — considered movement */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* toasts, popup — slight overshoot, alive feel */
```

Use `--ease-out` for almost everything. `--ease-spring` only for the toast and popup entrance — it gives the runtime UI a sense of responsiveness.

### What to Animate vs Not

**Animate:**
- Enter/exit of overlays (toast, popup, dropdown, modal)
- Active/hover state color transitions
- Progress indicators
- Status dot color changes
- Workflow step transitions in the toast

**Do not animate:**
- Text content changes
- Data loading states (use skeleton instead)
- Scrolling (never `scroll-behavior: smooth` on function-critical containers)
- Things the user didn't ask for

---

## Layout Principles

### The Extension Constraint

Flōw lives in three surfaces with hard size constraints:

| Surface | Width | Height |
|---|---|---|
| Popup | 360px fixed | Max 600px |
| Toast | 300px fixed | Dynamic, max ~120px |
| Side panel | 400px min — fills to window | Full window height |

**Design for 360px first.** Every component must work at popup width. Side panel is the reward for having done that work well.

### Information Hierarchy

Every surface should have one clear primary action and one clear primary piece of information. If a user looks at a screen for two seconds and can't tell what it's for, the layout needs work.

**Priority order:**
1. What is the current state?
2. What can I do right now?
3. What happened before?

### Density

Flōw is a power tool. Users will look at it constantly. Comfortable density — not sparse, not cramped.

- Line items in lists: **32px tall** (with 12px top/bottom padding)
- Icon + label rows: **36px tall**
- Section headers: **24px tall** with `--space-4` padding
- Never below 28px for anything interactive (touch/click target minimum)

---

## Empty States

Every list, every section, every panel needs an empty state. Empty states are a product moment — they tell users what to do next.

**Anatomy:**
1. Icon (32px, text-tertiary)
2. Headline (text-lg, weight 600, text-primary) — what's missing
3. Body (text-base, text-secondary, max-width 240px, centered) — why it's empty + how to fix it
4. CTA button (optional but preferred) — the action that fills it

**Don't say** "No items found." **Do say** "No workflows yet — record one to get started."

---

## Writing Style (UI Copy)

The words in the product are part of the design.

| Principle | Bad | Good |
|---|---|---|
| Direct, not robotic | "Workflow execution completed successfully" | "Workflow finished" |
| Specific, not vague | "Something went wrong" | "Couldn't find the button — the selector may have changed" |
| Human, not formal | "Please configure the workflow prior to execution" | "Set this up first" |
| Short labels | "Click to copy to clipboard" | "Copy" |
| Sentence case always | "Add New Workflow" | "Add new workflow" |
| No exclamation marks | "Workflow saved!" | "Workflow saved" |

**Tone:** calm, clear, human. Flōw should sound like a competent colleague, not a product manager writing changelog notes.

---

## Dos and Don'ts

### ✓ Do
- Use the 4px grid for all spacing decisions
- Let whitespace breathe — padding is not wasted space
- Use color to communicate state, not just aesthetics
- Keep the toast minimal and trustworthy
- Use motion to orient, not to impress
- Design the empty state before the full state
- Use Inter at 14px for almost everything

### ✗ Don't
- Use more than three type sizes on a single surface
- Use more than one primary button per view
- Use pure black (`#000000`) anywhere
- Animate layout shifts or content changes
- Use shadows on elements that are already inside an elevated container
- Write labels in ALL CAPS (except intentional eyebrow text)
- Use color alone to convey status (always pair with an icon or label)
- Design at full-screen and assume it scales down

---

## Quick Reference Card

```
Brand:          #7C5CFC
Text primary:   #18181B  /  #FAFAFA
Text secondary: #52525B  /  #A1A1AA
Surface:        #FFFFFF  /  #1C1C1F
Background:     #FAFAFA  /  #111113
Border:         #E4E4E7  /  #2E2E32
Success:        #16A34A  /  #22C55E
Warning:        #D97706  /  #F59E0B
Error:          #DC2626  /  #EF4444

Font:           Inter (400, 500, 600, 700)
Mono:           JetBrains Mono
Base size:      14px
Grid:           4px

Radius:         4 / 6 / 8 / 12 / 16 / 9999
Shadow:         sm / md / lg
Duration:       100 / 150 / 200 / 300ms
Easing:         ease-out (default), spring (overlays)
```