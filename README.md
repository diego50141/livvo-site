# livvo-site

Sitio de [Livvo](https://livvo.tech) construido sobre el **design system oficial**
(`Documents/design_handoff_livvo_ds/`) con Astro + Tailwind v4.

## Temas claro / oscuro

Los tokens viven en `src/styles/global.css`:

- `:root` — tema claro, copiado literal del handoff (`tokens.css`).
- `[data-theme="dark"]` — asignación oscura derivada (no existe en el handoff): reutiliza los
  neutrales de marca (navy `#0D1424` como superficie, dark `#070B14` como fondo alterno).

El toggle (`ThemeToggle.astro`) guarda la preferencia en `localStorage`; sin preferencia se usa
`prefers-color-scheme`. El bloque `@theme inline` expone los tokens como utilidades Tailwind
(`bg-paper`, `text-muted`, `font-display`, …) que respetan el tema activo.

## Estructura

```
src/
├── styles/global.css      # tokens claro + dark, bases, utilidades
├── layouts/Base.astro     # <head> (meta/OG/favicon/fuentes) + tema + fade-up
├── components/            # Button, Badge, Card, StatBox, Section, Navbar,
│                          # ThemeToggle, ChatMockup, PricingCard, FAQ, Footer
└── pages/index.astro      # landing de demo consumiendo los componentes
```

## Comandos

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # genera dist/
npm run preview
```

## Analytics

`Base.astro` carga Clarity (`vyssfzeld2`) y PostHog (misma key que producción) y dispara:
`page_viewed` (con UTMs y tema activo), `demo_cta_clicked` (por ubicación del botón),
`section_viewed`, `faq_opened`, `theme_toggled` y `demo_requested` (este último solo si se
embebe el form/meetings de HubSpot; verifica orígenes exactos).

## Notas

- La calculadora de ROI de producción se decidió **no** portar.
- Reglas del DS a respetar: Bricolage solo display, Instrument solo UI, Geist Mono solo datos;
  teal único color de CTA; `--teal-deep` para texto pequeño sobre claro; violeta exclusivo de Luisa IA.
