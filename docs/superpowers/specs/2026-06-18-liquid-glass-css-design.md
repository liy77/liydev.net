# Liquid Glass CSS Design

## Goal
Implement a real "liquid glass" visual effect without external libraries (the previous `liquid-glass-react` dependency requires React >=19 and broke the site). The effect must work on React 18.3.1, integrate with the existing admin theme system, and be performant.

## Chosen Approach
**Option C — Liquid Glass + Animated Shine**

## Visual Spec

### Glass base (`.glass-card`, `.glass-button`)
- `backdrop-filter: blur(28px) saturate(180%)`
- Background gradient: `linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)`
- Border: `1px solid rgba(255,255,255,0.35)` with top border `rgba(255,255,255,0.55)`
- Shadows:
  - Outer: `0 8px 32px rgba(0,0,0,0.18)`
  - Inner glow: `inset 0 1px 0 rgba(255,255,255,0.35)`
- Border radius: `1.25rem` for cards, `0.75rem` for buttons

### Animated shine
- A `::before` pseudo-element with a skewed white gradient sits above the glass.
- On `:hover`, it translates from `left: -100%` to `left: 200%`.
- Transition duration: `0.6s`, easing `cubic-bezier(0.4, 0, 0.2, 1)`.
- Only animate `transform` and `opacity` for GPU compositing.

### Theme integration
- Colors are still driven by admin settings via CSS variables (`--glass-bg`, `--glass-border`, etc.).
- The animated shine uses white with low opacity so it works on both light and dark themes.
- Background image from settings remains visible behind the glass because of `backdrop-filter`.

### Accessibility / Motion
- Respect `prefers-reduced-motion`: disable the shine animation and use a static subtle highlight instead.
- Do not reduce text contrast; text colors remain theme-controlled.

## Components Affected
- `src/app/globals.css` — update `.glass-card` and `.glass-button`
- `src/components/ui/GlassCard.tsx` — ensure it keeps `overflow-hidden` and relative positioning
- `src/components/ui/Button.tsx` — primary variant uses `.glass-button`
- `src/components/ui/Navbar.tsx` — already uses `.glass-card`

## Out of Scope
- No WebGL, shaders, or canvas.
- No new npm dependencies.
- No changes to the settings API or admin form.

## Verification
- `npm run build` must pass.
- `npm test -- --run` must pass (47 tests).
- Manual visual check of homepage cards, about page, navbar, admin cards, and buttons.
