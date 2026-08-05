# livvo-site

Sitio de [Livvo](https://livvo.tech) construido con Astro 5 + Tailwind v4 sobre el **design system
oficial** de la carpeta `design-system/` (fuente de verdad: `design-system/HANDOFF.md` y la página
viva [`/design-system`](https://livvo.tech/design-system), que renderiza tokens y componentes de
producción en ambos temas).

## Temas claro / oscuro

Los tokens viven en `src/styles/global.css`:

- `:root` — tema claro (tokens del handoff).
- `[data-theme="dark"]` — asignación oscura, alineada con el sistema "Dark-First · Teal Core"
  de las piezas de marketing (navy `#0D1424` como superficie, dark `#070B14` como fondo alterno).

El toggle (`ThemeToggle.astro`) guarda la preferencia en `localStorage`; sin preferencia se usa
`prefers-color-scheme`. Ningún tema se fuerza por defecto. El bloque `@theme inline` expone los
tokens como utilidades Tailwind (`bg-paper`, `text-muted`, `font-display`, …) que respetan el
tema activo.

## Estructura

```
src/
├── styles/global.css        # tokens claro + dark, bases, utilidades
├── layouts/Base.astro       # <head> (meta/OG/favicon/fuentes) + tema + analytics + fade-up
├── assets/screenshots/      # screenshots del producto (optimizados vía astro:assets)
├── components/              # Button, Badge, Card, StatBox, Section, Navbar, Logo,
│   │                        # ThemeToggle, ChatMockup, PricingCard, FAQ, Footer
│   └── ui/marquee.tsx       # marquee (React, sin uso en la landing actual)
├── config.ts                # número/mensaje de WhatsApp y URLs de login
└── pages/
    ├── index.astro          # landing (hero con partículas, pasos, funcionalidades,
    │                        # plataforma con screenshots, integraciones, precios
    │                        # tras SHOW_PRICING, FAQ)
    ├── design-system.astro  # catálogo vivo del DS en ambos temas
    ├── ingresar.astro       # acceso a CRM y Agentes (URLs en config.ts)
    ├── presentacion.astro   # overview del producto (noindex, fuera del sitemap)
    ├── herramientas/
    │   └── calculadora-roi.astro
    └── 404.astro
```

React se usa solo para las partículas del hero (tsparticles); el resto es Astro estático.
Sitemap y `robots.txt` incluidos (`@astrojs/sitemap` + `public/robots.txt`).

## Comandos

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # genera dist/
npm run preview
```

## Conversión y analytics

Todos los CTAs abren WhatsApp (número del demo de Luisa con mensaje prellenado). `Base.astro`
carga Clarity (`vyssfzeld2`), PostHog (misma key que producción) y Vercel Web Analytics, y
dispara: `page_viewed` (con UTMs y tema activo), `demo_cta_clicked` (por ubicación del botón),
`section_viewed`, `faq_opened` y `theme_toggled`.

## Notas

- La calculadora de ROI vive en `/herramientas/calculadora-roi` (versión propia del sitio;
  la de producción se decidió no portar tal cual).
- El link "Términos de uso" del footer apunta a `/terminos-de-uso`, página que **aún no
  existe** — pendiente de crear o retirar el link.
- Reglas del DS a respetar (decisiones de marca jul-2026): **Open Sans** para todo el texto
  (titulares 700, labels 600, cuerpo 400) y **Geist Mono** solo para datos; teal único color de
  CTA; `--teal-deep` para texto pequeño sobre fondo claro; azul oficial `#3B7EFF`; violeta
  exclusivo de Luisa IA.
