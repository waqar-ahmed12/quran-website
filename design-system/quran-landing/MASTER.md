# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Quran Landing
**Generated:** 2026-09-12 18:55:45
**Category:** Luxury/Premium Brand

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#1C1917` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#44403C` | `--color-secondary` |
| On Secondary | `#FFFFFF` | `--color-on-secondary` |
| Accent/CTA | `#A16207` | `--color-accent` |
| On Accent/CTA | `#FFFFFF` | `--color-on-accent` |
| Background | `#FAFAF9` | `--color-background` |
| Foreground | `#0C0A09` | `--color-foreground` |
| Card | `#FFFFFF` | `--color-card` |
| Card Foreground | `#0C0A09` | `--color-card-foreground` |
| Muted | `#E8ECF0` | `--color-muted` |
| Muted Foreground | `#475569` | `--color-muted-foreground` |
| Border | `#D6D3D1` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| On Destructive | `#FFFFFF` | `--color-on-destructive` |
| Ring | `#1C1917` | `--color-ring` |

**Color Notes:** Premium black + gold accent [Accent adjusted from #CA8A04]

### Dark Mode Palette

> Not a database match — the tool only returned one fixed palette. Derived by hand from it, following the skill's own rule (`color-dark-mode`, quick-reference.md §6): *"Dark mode uses desaturated / lighter tonal variants, not inverted colors."* Verify contrast before shipping.

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Background | `#1C1917` | `--color-background` |
| Foreground | `#FAFAF9` | `--color-foreground` |
| Card | `#262220` | `--color-card` |
| Card Foreground | `#FAFAF9` | `--color-card-foreground` |
| Secondary | `#78716C` | `--color-secondary` |
| Accent/CTA | `#D4AF37` | `--color-accent` |
| On Accent/CTA | `#1C1917` | `--color-on-accent` |
| Muted | `#292524` | `--color-muted` |
| Muted Foreground | `#A8A29E` | `--color-muted-foreground` |
| Border | `#3F3A37` | `--color-border` |
| Ring | `#D4AF37` | `--color-ring` |

**Notes:** Gold accent lightened from `#A16207` → `#D4AF37` (classic "metallic gold") instead of reused as-is, so it doesn't lose warmth or vibrate against a dark ground. Background/foreground pair is the light-mode pair reversed, which is coherent here because both ends were already near-neutral.

### Typography

- **Heading Font:** Bodoni Moda
- **Body Font:** Jost
- **Mood:** luxury, minimalist, high-end, sophisticated, refined, premium
- **Google Fonts:** [Bodoni Moda + Jost](https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;500;600;700&family=Jost:wght@300;400;500;600;700&display=swap)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;500;600;700&family=Jost:wght@300;400;500;600;700&display=swap');
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #A16207;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #1C1917;
  border: 2px solid #1C1917;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #FAFAF9;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #1C1917;
  outline: none;
  box-shadow: 0 0 0 3px #1C191720;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Liquid Glass

**Keywords:** dynamic material, optical glass, translucency, lensing, refraction, fluid morphing, system navigation

**Best For:** Apple-platform navigation, controls, and system-aligned app chrome

**Key Effects:** Lensing and refraction, adaptive translucency, and fluid morph transitions aligned to Apple platform behavior

### Page Pattern

**Pattern Name:** Scroll-Triggered Storytelling

- **Conversion Strategy:** Keep the narrative understandable without scroll-driven effects. Use progress indicator. Mobile: simplify animations. Keep DOM reading order complete; disable parallax and scroll-scrub under reduced motion. Pause scroll animation when offscreen or hidden and render each chapter in its final readable state under reduced motion.
- **CTA Placement:** End of each chapter (mini) + Final climax CTA
- **Section Order:** Intro hook > Chapter 1 (problem) > Chapter 2 (journey) > Chapter 3 (solution) > Climax CTA

> **Fit note:** this project is a single-hook landing page with almost no copy — not a multi-chapter problem/journey/solution narrative. Take the motion/accessibility rules above, not the chapter/CTA structure.

### Hero Motion Spec (for the scroll-scrubbed opening, Phase 5)

From `--domain gsap "scroll scrub pin hero"` — Scroll Reveal, Complex tier:

```js
gsap.timeline({
  scrollTrigger: {
    trigger: heroSection,
    start: 'top top',
    end: '+=150%',
    scrub: 1,
    pin: true
  }
})
// drive the Quran-opening frames/timeline here instead of .headline/.bg-layer
```

- Pin **only this one section** — don't stack more pinned sections on top of it (fights native scroll feel, hurts mobile).
- Call `ScrollTrigger.refresh()` after the hero image/video asset finishes loading, or the scrub range will be measured wrong.
- Respect `prefers-reduced-motion`: render the fully-open final frame immediately, skip the scrub.
- Test the pin on a mid-tier mobile device specifically, not just desktop — pinning forces layout reflow.

---

## Anti-Patterns (Do NOT Use)

- ❌ Cheap visuals
- ❌ Fast animations

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
