---
name: ClearTasks
description: A light creative studio for shared student work.
colors:
  background: "hsl(45 33% 96%)"
  foreground: "hsl(145 9% 16%)"
  card: "hsl(48 50% 99%)"
  card-foreground: "hsl(145 9% 16%)"
  popover: "hsl(48 50% 99%)"
  popover-foreground: "hsl(145 9% 16%)"
  primary: "hsl(159 43% 25%)"
  primary-foreground: "hsl(45 40% 98%)"
  secondary: "hsl(43 25% 91%)"
  secondary-foreground: "hsl(145 9% 22%)"
  muted: "hsl(45 24% 92%)"
  muted-foreground: "hsl(140 5% 40%)"
  accent: "hsl(150 19% 91%)"
  accent-foreground: "hsl(159 43% 25%)"
  destructive: "hsl(3 62% 40%)"
  destructive-foreground: "hsl(0 0% 100%)"
  border: "hsl(42 17% 84%)"
  input: "hsl(42 17% 76%)"
  ring: "hsl(159 43% 25%)"
  sunlight: "hsl(43 85% 72%)"
  project-accent: "hsl(41 73% 58%)"
  project-soft: "hsl(42 68% 91%)"
  project-ink: "hsl(32 67% 26%)"
  background-dark: "hsl(150 10% 10%)"
  foreground-dark: "hsl(45 22% 92%)"
  card-dark: "hsl(150 9% 13%)"
  card-foreground-dark: "hsl(45 22% 92%)"
  popover-dark: "hsl(150 9% 15%)"
  popover-foreground-dark: "hsl(45 22% 92%)"
  primary-dark: "hsl(153 31% 72%)"
  primary-foreground-dark: "hsl(156 35% 13%)"
  secondary-dark: "hsl(145 8% 21%)"
  secondary-foreground-dark: "hsl(45 22% 92%)"
  muted-dark: "hsl(145 8% 18%)"
  muted-foreground-dark: "hsl(135 7% 68%)"
  accent-dark: "hsl(151 16% 22%)"
  accent-foreground-dark: "hsl(153 31% 78%)"
  destructive-dark: "hsl(5 80% 72%)"
  destructive-foreground-dark: "hsl(0 38% 12%)"
  border-dark: "hsl(145 7% 25%)"
  input-dark: "hsl(145 7% 38%)"
  ring-dark: "hsl(153 31% 72%)"
  sunlight-dark: "hsl(43 45% 25%)"
  project-terracotta-accent: "hsl(15 47% 58%)"
  project-terracotta-soft: "hsl(17 55% 92%)"
  project-terracotta-ink: "hsl(12 45% 30%)"
  project-lilac-accent: "hsl(261 25% 62%)"
  project-lilac-soft: "hsl(263 37% 93%)"
  project-lilac-ink: "hsl(259 30% 33%)"
  project-green-accent: "hsl(157 28% 49%)"
  project-green-soft: "hsl(151 32% 91%)"
  project-green-ink: "hsl(158 38% 26%)"
  warning-background: "hsl(39 79% 93%)"
  warning-foreground: "hsl(32 67% 26%)"
  warning-border: "hsl(39 60% 73%)"
  warning-background-dark: "hsl(35 25% 19%)"
  warning-foreground-dark: "hsl(43 74% 76%)"
  warning-border-dark: "hsl(36 32% 36%)"
typography:
  "display":
    fontFamily: "\"Fraunces Variable\", Georgia, serif"
    fontSize: "clamp(2.9rem, 5.2vw, 5.4rem)"
    fontWeight: 500
    lineHeight: 1.07
    letterSpacing: "-0.035em"
  "headline":
    fontFamily: "\"Fraunces Variable\", Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 500
    lineHeight: "2.5rem"
    letterSpacing: "-0.025em"
  "page-title":
    fontFamily: "\"Manrope Variable\", ui-sans-serif, system-ui, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\""
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: "2.25rem"
    letterSpacing: "-0.025em"
  "title":
    fontFamily: "\"Manrope Variable\", ui-sans-serif, system-ui, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\""
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "-0.025em"
  "body":
    fontFamily: "\"Manrope Variable\", ui-sans-serif, system-ui, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\""
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  "label":
    fontFamily: "\"Manrope Variable\", ui-sans-serif, system-ui, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\""
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: "1.25rem"
  "caption":
    fontFamily: "\"Manrope Variable\", ui-sans-serif, system-ui, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\""
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "1rem"
rounded:
  "sm": "calc(var(--radius) - 4px)"
  "md": "calc(var(--radius) - 2px)"
  "lg": "var(--radius)"
  "xl": "0.75rem"
  "2xl": "1rem"
  "full": "9999px"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.25rem"
  "6": "1.5rem"
  "7": "1.75rem"
  "8": "2rem"
  "10": "2.5rem"
  "12": "3rem"
  "14": "3.5rem"
  "16": "4rem"
  "2.5": "0.625rem"
components:
  "button-primary":
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
    height: "2.75rem"
  "button-destructive":
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
    height: "2.75rem"
  "button-outline":
    backgroundColor: "{colors.background}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
    height: "2.75rem"
  "button-secondary":
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
    height: "2.75rem"
  "button-ghost":
    backgroundColor: "transparent"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
    height: "2.75rem"
  "button-link":
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
    height: "2.75rem"
  "input":
    backgroundColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
    height: "2.5rem"
    width: "100%"
  "workspace-nav":
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.lg}"
    padding: "0 0.75rem"
  "project-badge":
    backgroundColor: "{colors.project-soft}"
    textColor: "{colors.project-ink}"
    rounded: "{rounded.md}"
    padding: "0.25rem 0.625rem"
  "card":
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.2xl}"
---

# Design System: ClearTasks

## Overview

**Creative North Star: "Light creative studio"**

Light creative studio brings warm ivory, readable dark ink, and forest-green actions to a shared student workspace. Fraunces gives important introductions an editorial voice; Manrope keeps tasks, dates, ownership, and controls easy to scan. Sunlight and focused glow add warmth around a meaningful action or illustrative scene.

One ClearTasks identity holds the work together. Each project receives a stable, restrained saffron, terracotta, lilac, or green accent, while borders and quiet surfaces establish structure. The interface feels alive through task completion, a clear pending label, and useful feedback. The confirmed visual rejection is a dashboard arranged as a bento grid of KPI tiles.

**Key Characteristics:**

- Warm paper surfaces with readable ink and forest-green actions.
- Editorial Fraunces headlines paired with practical Manrope UI.
- Stable project accents, separate from semantic status.
- Border-based surfaces, purposeful sunlight, and subtle press feedback.
- Responsive task lists and visible keyboard focus.

This document records the implemented system. The frontmatter is normative for primitives; [the CSS source](frontend/src/index.css), [Tailwind mapping](frontend/tailwind.config.js), and referenced components remain the implementation authority. The extensions and interactive primitive samples live in [.impeccable/design.json](.impeccable/design.json).

## Colors

The palette pairs warm ivory and ink with forest green, then uses a small project palette to give shared work a recognizable identity. Frontmatter color values preserve the source's HSL format; suffix `-dark` records the override applied by the `.dark` class.

### Primary

- **Forest green** (`primary`): the main action, active workspace navigation, completed progress, and important links. **Paper on forest** (`primary-foreground`) supplies action text. The paired `ring` token carries visible keyboard focus.
- **Sunlight** (`sunlight`): restrained radial atmosphere behind the landing demonstration and within the desktop authentication story. It is not a substitute for a readable surface.

### Secondary

- **Project saffron** (`project-accent`, `project-soft`, `project-ink`): the root fallback and first palette. Soft is a badge background; ink is its readable text; accent appears in the project dot and cover glow.
- **Project terracotta, lilac, and green** (`project-terracotta-*`, `project-lilac-*`, `project-green-*`): the other three complete accent/soft/ink triples.
- **Quiet green tint** (`accent`, `accent-foreground`): interaction backgrounds and text for secondary control hover. Despite its CSS name, this is a global interaction pair, separate from project identity.
- **Red clay** (`destructive`, `destructive-foreground`): destructive actions and error/overdue emphasis.
- **Warm warning** (`warning-background`, `warning-foreground`, `warning-border`): warning badges. The dark warning triple is explicitly defined in CSS. Good status uses the primary family; danger uses destructive. Neutral status retains the regular badge border.

### Neutral

- **Warm ivory** (`background`): the page ground.
- **Light paper** (`card`, `popover`): cards, dialogs, dropdowns, and menus. Each has a matching foreground token.
- **Dark ink** (`foreground`): ordinary text. **Secondary ink** (`muted-foreground`) supports descriptions and metadata.
- **Oat** (`secondary`) and **soft paper** (`muted`): supporting controls, board lanes, and quieter backgrounds.
- **Paper edge** (`border`): dividers and surface outlines. The stronger `input` stroke marks fields.

### Project and appearance behavior

[projectStyle](frontend/src/lib/studio.ts) hashes a project ID using an unsigned rolling multiplier of 31, then selects one of the four palettes by remainder. It sets `--project-accent`, `--project-soft`, and `--project-ink` on the project scope. Reordering or renaming projects does not change the palette. Different IDs can share a palette. The workspace shell uses the current project ID, and project directory entries each scope their own triple. Project palettes retain their defined values in dark appearance; global surface and action variables switch.

[The theme provider](frontend/src/main.tsx) defaults to light, allows system appearance, writes a class on the document, and persists `cleartasks-appearance`. [Settings](frontend/src/pages/settings/Settings.tsx) exposes Light studio, After hours, and Match device. Theme changes suppress transition flashes. After hours uses deep green-charcoal surfaces, warm light text, and a lighter primary action pair.

**The One Studio Rule.** Keep the global action and navigation identity on the primary tokens. Apply a project palette only through its three project tokens; changing projects must not recolor every action.

**The Meaning Before Hue Rule.** Use status text or an icon alongside color. A project accent identifies the project; it does not indicate overdue work, errors, completion, or priority.

## Typography

**Display font:** Fraunces Variable, with Georgia and serif fallbacks.

**Body and UI font:** Manrope Variable, followed by Tailwind's system sans-serif and emoji fallbacks.

Both variable fonts, including Fraunces italic, are imported from `@fontsource-variable` in [main.tsx](frontend/src/main.tsx) and bundled as self-hosted assets. No remote font service is required. Editorial styling enables optical sizing and uses medium weight.

### Hierarchy

- **Display:** the responsive landing headline uses the frontmatter `display` role. Its italic second phrase adds emphasis without introducing another typeface.
- **Editorial headline:** the frontmatter `headline` role is the smaller project/setup headline. Project and setup introductions step from `text-4xl` to `text-5xl` at the small breakpoint; auth storytelling uses larger editorial type at desktop.
- **Page title:** most operating pages use a semibold sans-serif heading. The project directory and project introduction deliberately opt into the editorial voice.
- **Title:** section and card headings use the frontmatter `title` role. Card titles have snug line height.
- **Body:** the default body role is used for reading. Working content commonly steps down to small text (0.875rem / 1.25rem); descriptions often use relaxed line height (1.625). Narrow form columns and `max-w-2xl` descriptions keep reading focused.
- **Label and caption:** compact UI roles stay in Manrope. Metadata frequently uses 0.75rem / 1rem; button labels use 0.875rem / 1.25rem. Project badges explicitly use semibold weight, while status badges use medium. Dates, counts, and completion values use tabular numerals where shown.

Headings balance wrapping and use tight tracking; paragraphs use pretty wrapping. Preserve readable wrapping and word breaking for user-supplied names rather than shrinking text to fit.

**The Editorial Moment Rule.** Use Fraunces for the hero, project introductions, milestone names, and selected setup headlines. Keep controls, metadata, and dense task content in Manrope.

## Layout

The operating workspace is a two-column shell: a sticky full-height sidebar (232px) and a `minmax(0, 1fr)` content column. The top bar is at least 80px high. Content uses 32px vertical padding and responsive horizontal padding (`clamp(20px, 3.2vw, 52px)`). The regular page column is centered with a maximum width of 72rem, 2rem between main sections, and 3rem bottom space. Setup, milestones, and settings use narrower page or reading columns; setup forms generally cap at 42rem and the overall setup page at 56rem.

Spacing follows the observed Tailwind quarter-rem rhythm in the frontmatter. Ordinary surface content uses 20–32px inset; shared Card sections use 24px. Task rows use 20px horizontal and 16px vertical inset with a 12px internal gap. Let information density follow actual work: the directory stacks project rows, and the overview gives next tasks more space than the adjacent progress summary. Milestones and team workload remain visible as subsequent sections.

| Viewport | Implemented behavior |
| --- | --- |
| **390px** | The sidebar is hidden below 768px; the compact top bar is at least 68px high. Content has 24px vertical and 20px horizontal padding. A labeled menu opens a left-side modal navigation drawer, at most 320px and 85vw wide. Headings/actions stack, project content wraps, task board content becomes a list, and filters use one column. |
| **768px** | The desktop sidebar and breadcrumb return. Small-breakpoint heading/actions and two-column filters are active. The overview remains stacked until 1024px. Overview milestone nodes form a horizontal track; the dedicated milestone page retains its vertical timeline. Auth storytelling remains hidden. |
| **1440px** | The sidebar persists and content stays within its maximum width. The overview divides next tasks and progress at a 1.65:1 ratio. The task board can show three columns and a board/list switch. Filters show four columns. The landing hero and authentication shell each use their desktop two-column composition. |

The landing container caps at 1440px, using horizontal gutters of 24px, 40px from 768px, and 64px from 1024px. The hero has a single column until 1024px; the supporting steps become three columns at 768px. Authentication uses a two-column story/form layout from 1024px; the form stays within 400px.

[The garden assets](frontend/src/assets/campus-garden-480.webp) ship as 480w and 960w responsive WebP sources, with the original and prompt preserved in [docs/design-assets](docs/design-assets/campus-garden-source.png). The [asset preparation script](frontend/scripts/prepare-studio-assets.mjs) reproduces the WebP variants using sharp. On the landing page the photo is decorative with empty alt text and the sample is explicitly labeled Example project. The auth story uses descriptive alt text. Preserve their illustrative role and responsive source selection; project covers themselves use token-based color, not an upload feature.

## Elevation & Depth

Working surfaces use a one-pixel edge and a subtle change in paper tone. Most cards have no box shadow. Sunlight creates atmosphere behind the illustrative landing scene and on the auth story; a project cover uses its own restrained accent glow. Dialogs and navigation drawers use stronger overlay elevation with a translucent foreground scrim.

### Shadow vocabulary

- **Primary action at rest:** `0 3px 8px -5px hsl(var(--primary) / 0.5)`.
- **Primary action hover:** `0 8px 22px -10px hsl(var(--primary) / 0.5)`, paired with a one-pixel lift on hover-capable fine pointers.
- **Landing demonstration sheet:** `0 20px 55px -25px hsl(38 44% 32% / 0.32)`.
- **Illustrative photograph:** `0 5px 18px -8px hsl(30 25% 25% / 0.25)`.
- **Dialog/drawer:** Tailwind's `shadow-xl` utility; retain this overlay role rather than applying it to routine cards.

The sidecar preserves these extensions, the focus treatment, and motion snippets. Its synthesized eight-step OKLCH tonal ramps are panel visualization aids, not additional application tokens.

**The Border First Rule.** Use a border and surface change to separate working regions. Reserve larger shadows for overlays and the illustrative landing scene.

## Shapes

The radius root is `--radius: 0.875rem`. Tailwind's project overrides make `lg` that root, `md` two pixels smaller, and `sm` four pixels smaller. Preserve the mapping; names are not a new numerical sequence. The unmodified `xl` and `2xl` steps are recorded in frontmatter.

Cards, dialogs, and the illustrated sheet use the 2xl shape. Buttons and navigation links use lg; fields and project badges use md. Avatars, semantic status badges, progress tracks, and step nodes use full rounding. The square brand mark uses an xl corner. Borders establish boundaries; dashed outlines denote empty board lanes. Avoid adding heavy inset edges or decorative framing around every working region.

## Components

### Buttons

[The shared Button](frontend/src/components/ui/button.tsx) is tactile and restrained. Its default control is 44px tall with 16px horizontal and 8px vertical padding, a semibold label, an 8px icon gap, and 16px icons. The icon button is 44px square; small controls have a 40px minimum height; large controls are 48px tall. The landing call to action explicitly overrides height to 56px.

The six variants are primary, destructive, outline, secondary, ghost, and link. Primary uses the global action pair; outline uses the field border and page ground; secondary uses the oat pair; ghost adds a quiet green hover surface; link uses underlined primary text on hover.

State transitions last 160ms with ease-out. Press scales an enabled control to 0.97. Fine-pointer primary hover lifts one pixel and deepens the shadow; the landing call to action adds a single 650ms sunlight sweep on hover. Focus uses a two-pixel ring with a two-pixel offset. Disabled buttons dim; pending buttons retain their place, mark `aria-busy` and `aria-disabled`, show a spinner and optional pending label, and block repeated activation.

### Cards / Containers

[Card](frontend/src/components/ui/card.tsx) uses the card pair, a regular border, 2xl corners, and no default shadow. Its header has 24px padding; content/footer retain that inset with the top removed. [Surface](frontend/src/index.css) is the same quiet border-based container pattern for app sections. Cards organize real work rather than producing a fixed metric-tile grid.

Team cards retain the linked project profile's name, skills, and preferred work after account connection. [Team identity](frontend/src/lib/team.ts) also accepts the REST endpoint's flat name/avatar fields and older nested user fields. Member cards show no email row, and an email stored as an account-name fallback is never displayed as the member's name. Missing names use a person icon and an explicit unavailable label.

### Inputs / Fields

[Input](frontend/src/components/ui/input.tsx) is 40px high by default, uses the input stroke and background ground, and has 12px horizontal and 8px vertical padding. Text is 16px below 768px and 14px from that breakpoint; forms and search can explicitly choose 44px height. Labels stay visible, placeholders use secondary ink, and the caret follows primary. Focus uses the shared ring and offset; disabled fields dim and use a not-allowed cursor. Error messages remain adjacent and readable, with alerts where implemented.

### Navigation

[DashboardLayout](frontend/src/layouts/DashboardLayout.tsx) groups project pages separately from the workspace directory, notifications, and settings. A project dot identifies the current project. Links have a 44px minimum height, 12px horizontal inset, Manrope small medium text, and muted text at rest. Hover changes the surface and text; the active page uses primary at 10% opacity with primary text and `aria-current="page"`. The mobile drawer preserves the same grouping and uses Radix dialog focus/dismissal behavior. The skip link becomes visible on keyboard focus.

### Chips / Status

Project badges use the scoped soft/ink pair, a matching accent dot, 12px semibold text, and a modest rectangular corner. Semantic status badges are rounded, bordered, and labeled; good, warning, and danger are separate roles. Filter result text announces the actual number of tasks. Use meaningful visible status labels instead of relying on the dot or hue.

### Dialogs

[Dialog](frontend/src/components/ui/dialog.tsx) centers a card surface within the viewport with 24px inset and 16px gaps. It caps at 32rem width and 90dvh height, allows vertical scrolling, and leaves a 1rem viewport margin on either side. Header alignment changes from centered to left at 640px. Footer actions stack in reverse order on narrow screens and align right in a row from 640px. The overlay uses foreground at 35% opacity; enter/exit uses fade and 95% zoom at 150ms. Preserve the accessible title, description, close label, and Radix focus behavior.

### Tasks, milestones, and feedback

Task rows pair a readable link with owner, due date, and status metadata. Fine-pointer hover adds half-strength muted fill to a linked task row. The overview uses real upcoming and overdue tasks, measured progress, milestone completion, and workload; task board lanes become the readable list below 1024px. Progress uses a primary fill on secondary, generally thinner than the primitive default when shown in project screens.

Setup uses the four-step Project / Team / Plan / Confirm indicator. AI generation shows truthful indeterminate feedback because no API stages are available. Loading skeletons and pending labels announce loading; errors offer retry; empty states explain the next action. Toasts confirm completed changes.

[Authentication appearance](frontend/src/pages/auth/appearance.ts) adapts Clerk's maintained sign-in, verification, and additional-factor UI to the studio. Direct password recovery uses the supported email-code SDK flow. Preserve those functional boundaries when styling authentication.

All motion respects `prefers-reduced-motion`: smooth scroll becomes automatic; animation and transition durations reduce to 0.01ms with one iteration, and button press/hover transforms are removed. The global two-pixel focus outline remains available to controls that do not supply their own ring.

## Do's and Don'ts

### Do:

- **Do** reuse the semantic CSS variables and shared components so light, dark, and system appearance stay coherent.
- **Do** keep stable project identity in the project accent, soft, and ink tokens while preserving global forest-green actions.
- **Do** make status understandable through text or icons, and show the pending state of the real operation.
- **Do** give phone users a readable task list, wrapping content, labeled controls, and keyboard focus.
- **Do** use the shipped 480w/960w garden images only as illustrative imagery, with the landing example clearly identified.
- **Do** respect reduced motion for transitions, press transforms, spinning indicators, and sunlight sweeps.

### Don't:

- **Don't** build a bento dashboard of disconnected KPI tiles; keep task attention, progress, milestones, and workload in a readable hierarchy.
- **Don't** use project accent color as an error, warning, priority, or completion signal.
- **Don't** spread sunlight gradients and strong shadows across ordinary working cards.
- **Don't** replace shared token values with a new palette or introduce a second identity for individual projects.
- **Don't** turn the garden example, generated concept sample data, or extra concept tabs into product capabilities.
- **Don't** invent staged AI progress, delivery preferences, or a cover-upload control that the implemented product does not support.

