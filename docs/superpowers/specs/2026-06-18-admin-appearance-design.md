# Admin Appearance / Liquid Glass Design

## Goal
Fix the broken light theme, overhaul the admin appearance page, add a real liquid-glass effect with adjustable intensity, and add a live page preview.

## Requirements

### 1. Light theme must work end-to-end
- Store separate color palettes for **light** and **dark** modes in `site_settings`.
- Add a `theme_mode` field: `light`, `dark`, or `system`.
- Public site default uses `theme_mode`; visitor toggle still works and switches to the matching palette.
- Admin preview reflects the currently selected mode.

### 2. Admin appearance page layout
- Wrap content in `max-w-6xl mx-auto` with horizontal padding matching the public site.
- Organize settings into sections: Theme mode, Dark palette, Light palette, Font gradient, Glass intensity, Background image, Live preview.
- Color swatch inputs must have rounded corners (`rounded-xl`) and a subtle border.

### 3. Font gradient option
- Add `text_gradient_start` and `text_gradient_end` fields.
- `.text-gradient` class uses these variables.
- Include an enable/disable toggle (`use_text_gradient`).

### 4. Liquid glass intensity
- Add `glass_intensity` field (0–100).
- Maps to CSS `backdrop-filter: blur(Xpx) saturate(Y%)` where X = 8 + intensity*0.28 and Y = 100 + intensity.
- Intensity 0 = almost flat, 100 = strong liquid glass.
- Works on `.glass-card`, `.glass-button`, navbar, and admin cards.

### 5. Background image upload
- Replace raw file input with a styled dropzone / upload button.
- Show thumbnail preview with remove button.
- Keep existing `/api/upload` endpoint.

### 6. Live page preview
- Add an iframe in the admin page pointing to `/`.
- Add a toggle to preview in light/dark inside the admin.
- Iframe reloads when colors change (debounced).

### 7. Accessibility / performance
- Respect `prefers-reduced-motion` (disable shine animation).
- GPU-only animations (`transform`, `opacity`).
- No new runtime dependencies.

## Components / Files Affected
- Database schema: `src/lib/db.ts` migration for new columns.
- Data layer: `src/lib/settings.ts`, `src/lib/theme.ts`.
- Validation: `src/lib/validators.ts`.
- API: `src/app/api/settings/route.ts`.
- CSS: `src/app/globals.css`.
- Admin page: `src/app/admin/settings/page.tsx`.
- Admin form: `src/components/admin/SettingsForm.tsx`.
- Theme provider: `src/components/ui/ThemeProvider.tsx`.
- UI components: `GlassCard`, `Button`, `Navbar`.

## Out of Scope
- New pages or project features.
- Backend changes beyond settings.
- WebGL / canvas effects.
