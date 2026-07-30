# Handoff: Livvo Design System

## Overview
Sistema de diseño de la marca **Livvo** (IA comercial para inmobiliarias). Define color, tipografía,
espaciado, radios, elevación, capas decorativas y una librería de componentes (base y de producto).
El objetivo es que Claude Code lo use como **fuente de verdad** para mejorar / rehacer la web de Livvo
manteniendo consistencia de marca.

> **Este documento fue actualizado (jul-2026)** para reflejar las decisiones de marca vigentes —
> ver `README.md` de esta carpeta. Reemplaza tipografía (Bricolage Grotesque + Instrument Sans →
> Open Sans), azul (`#3B9EFF` → `#3B7EFF`) y añade el bloque de tokens del **tema oscuro**, disponible
> junto al claro (el sitio respeta `prefers-color-scheme` del sistema o la preferencia guardada en
> `localStorage`; ninguno de los dos es forzado por defecto).

## About the Design Files
La **referencia principal y siempre actualizada** es la página viva [`/design-system`](https://livvo-site.vercel.app/design-system)
del propio sitio — renderiza tokens y componentes de producción en ambos temas (el toggle del navbar
cambia claro/oscuro) y nunca se desactualiza porque usa el mismo código que la web.
`catalog.html` es el catálogo estático **original** del handoff (histórico, tema claro únicamente —
preferir `/design-system` para ver el estado actual, incluido el tema oscuro).

## Fidelity
**High-fidelity.** Colores, tipografía, espaciado, radios y estados son finales y provienen directamente
de las variables `:root` (tema claro) y `[data-theme="dark"]` (tema oscuro) de `src/styles/global.css`
en livvo.tech. Recrear pixel-perfect con las librerías del proyecto.

## Design Tokens (fuente de verdad — copiar a :root / theme)

```css
:root {
  /* Brand */
  --teal:        #00C7B4;  /* acento primario · único color de CTA */
  --teal-deep:   #0099A8;  /* teal para texto sobre fondo claro (contraste) + fin de gradiente */
  --blue:        #3B7EFF;  /* secundario · links · gráficos (azul oficial de marca, jul-2026) */
  --blue-mid:    #A8C4FF;
  --blue-light:  #DEE9FF;
  --violet:      #6C63FF;  /* EXCLUSIVO Luisa IA — nunca en UI general */
  --violet-deep: #4A44CC;

  /* Neutrals */
  --navy:        #0D1424;  /* títulos / texto fuerte */
  --dark:        #070B14;
  --text:        #111111;  /* texto de cuerpo */
  --muted:       #6B7280;  /* texto secundario, labels */
  --white:       #FFFFFF;  /* fondo primario / cards */
  --gray-bg:     #F8FAFC;  /* fondo de secciones alternas */
  --surface:     #F1F3F8;  /* inputs, filas, hover */
  --border:      #E5E7EB;  /* bordes, separadores */

  /* Semantic */
  --green:       #22C55E;  /* éxito, online, WhatsApp */
  --gold:        #FFB547;  /* warning, pendiente */
  --red:         #FF5470;  /* error, destructivo */

  /* Shape */
  --radius-card: 16px;
  --radius-btn:  9px;
  --shadow-hover: 0 8px 32px rgba(0,0,0,0.07);
  --transition:  0.2s ease;
  --max-w:       1280px;
}
```

### Tema oscuro (`[data-theme="dark"]`) — disponible junto al claro, no forzado por defecto
Mismas superficies que el sistema "Dark-First · Teal Core" del skill `livvo-designer`, para que web
oscura y piezas de marketing usen exactamente los mismos valores. Sobrescribe los tokens neutros de
`:root`; el teal, azul y violeta se mantienen sin cambio y se usan **directos** sobre oscuro (sin
variante `-deep`). El sitio activa uno u otro según `prefers-color-scheme` del sistema o la
preferencia guardada en `localStorage` (ver `ThemeToggle.astro`), nunca por defecto sin señal del
usuario.

```css
[data-theme="dark"] {
  --white:      #0D1424;  /* Surface 1 → fondo primario / cards */
  --gray-bg:    #070B14;  /* Background → secciones alternas */
  --surface:    #111827;  /* Surface 2 → inputs, filas, hover */
  --border:     #1A2240;  /* Surface 3 / Line */
  --navy:       #F0F4FF;  /* texto primario sobre oscuro */
  --text:       #F0F4FF;
  --muted:      #8B96AF;
  --teal-deep:  #00C7B4;  /* sobre oscuro el teal va directo, sin variante */
}
```

### Gradientes
- **Teal CTA:** `linear-gradient(135deg,#00C7B4,#0099A8)` — botones, badges
- **Teal → Blue:** `linear-gradient(135deg,#00C7B4,#3B7EFF)` — hero, palabra destacada del titular
- **Texto degradado:** aplicar Teal→Blue con `background-clip:text` SOLO a una palabra clave del titular
- **Luisa Violet:** `linear-gradient(135deg,#6C63FF,#4A44CC)` — solo Luisa IA

### Spacing scale
`4 · 8 · 12 · 16 · 24 · 32 · 48 px` (space-1 … space-12)

### Elevation
- sm: `0 2px 8px rgba(13,20,36,0.08)`
- md: `0 6px 20px rgba(13,20,36,0.12)`
- glow: `0 6px 20px rgba(13,20,36,0.1), 0 0 20px rgba(0,199,180,0.18)`
- (tema oscuro: mismas fórmulas con `rgba(0,0,0,…)` — ver `global.css`)

## Typography
Decisión de marca vigente (22-jul-2026): **Open Sans** reemplazó a Bricolage Grotesque e Instrument
Sans en toda la marca — jerarquía por peso, tipo Zillow, elegida por credibilidad ante compradores
inmobiliarios LATAM. Importar de Google Fonts: **Open Sans** (300/400/600/700), **Geist Mono** (datos).

| Rol | Familia | Tamaño (web) | Peso | Uso |
|-----|---------|--------------|------|-----|
| Hero / Display | Open Sans | 52px (portadas/heroes) | 700 | letter-spacing -0.5px |
| H1 | Open Sans | 32px (24px mobile) | 700 | -0.5px |
| H2 | Open Sans | 24px (20px mobile) | 700 | encabezados de sección |
| H3 | Open Sans | 20px | 600 | subtítulos |
| Body | Open Sans | 16px (15px mobile) | 400 | cuerpo (color --muted o --text) |
| Small | Open Sans | 14px | 400 | texto auxiliar |
| Label | Open Sans | 11–13px | 600 | UPPERCASE, letter-spacing 0.5px, color --teal-deep |
| Metric / Data | Geist Mono | 20–40px | 700 | precios, KPIs, IDs, timestamps |

Reglas: Open Sans para todo el texto de marca (titulares 700, labels 600, cuerpo 400); Geist Mono
exclusivamente para datos/técnico. Nunca otras fuentes.

## Screens / Views (Componentes)

### Base
- **Button** — variantes: Primary (gradiente teal, texto blanco, radius 9px, sombra teal), Secondary (`--blue` sólido), Outline (borde teal 1.5px, texto teal-deep), Ghost (sin fondo). Tamaños sm/md/lg (padding 8/16 · 11/22 · 15/30). Hover: `filter:brightness(1.06)` + sombra más marcada.
- **Badge / Pill** — teal gradiente relleno o outline; UPPERCASE 11px/700, letter-spacing 1.5px, radius 20px.
- **Card** — `--white` bg, borde `--border`, radius 16px, sombra sm. Variante *accent* (tinte teal + borde teal 0.3), variante *Luisa* (tinte violeta + borde violeta).
- **StatBox** — valor en Geist Mono 28–32px color teal-deep, label UPPERCASE muted.
- **InfoBox** — fondo `rgba(0,199,180,0.06)`, borde teal 0.35.
- **Form controls** — input/select: `--surface` bg, borde `--border`, radius 8px; focus: borde teal + `box-shadow:0 0 0 3px rgba(0,199,180,0.15)`. Error: borde `--red`. Toggle, checkbox, progress bar (relleno Teal→Blue).
- **Tabs** — contenedor `--surface`, pill activa con gradiente teal + texto blanco.
- **Alerts** — success/warning/error con borde izquierdo 3px del color semántico y fondo tintado al 10%.
- **Table** — header `--surface` con labels UPPERCASE muted; filas con borde superior `--border`; estados con dot de color.
- **Luisa IA** — avatar circular gradiente violeta con halos concéntricos; burbujas de chat con borde violeta. Único lugar donde vive `--violet`.

### Producto
- **Navbar** — barra blanca, borde inferior `--border`. Logo izquierda (`livvo` + `o` teal + punto teal). Links centro (muted → navy en hover). CTA "Agendar demo" (Primary) a la derecha. Nunca centrar el logo.
- **Section** — patrón eyebrow (label UPPERCASE teal) + H2 Open Sans centrado, max-width ~640px.
- **PricingCard** — 3 tiers. La destacada lleva borde teal 2px + badge "RECOMENDADO" (pill teal, top:-11px) + sombra glow teal. Precio en Geist Mono, features con check teal, CTA a ancho completo (Primary en la destacada, secondary/outline en las demás).
- **FAQItem** — acordeón: fila clicable con "+" que rota a 45° al abrir; respuesta con transición de `max-height`. Un ítem abierto a la vez.
- **ChatMockup** — mockup de WhatsApp: header navy con avatar teal + "en línea" (dot verde). Burbujas: usuario a la derecha fondo verde claro `#DCFCE7`; agente a la izquierda blanco con borde. Timestamps + `✓✓` en teal.

## Interactions & Behavior
- Botones/links: transición `0.2s ease`; hover brightness/sombra; focus ring teal (`outline:2px solid #00C7B4; outline-offset:2px` o box-shadow 3px teal 0.35).
- FAQItem: click alterna abierto/cerrado; solo uno abierto; icono "+" → rota 45°; respuesta anima max-height.
- Active state botones: `transform:scale(0.96)`.

## Accessibility
Pares verificados (WCAG): Text/White ~18:1 (AAA) · Muted/GrayBG ~4.7:1 (AA) · Navy/Teal ~9.4:1 (AAA) · TealDeep/White ~4.6:1 (AA). Para texto pequeño sobre blanco usar `--teal-deep` (#0099A8), no `--teal`.

## Assets
Logo = wordmark: "livv" en `--navy`/blanco (según tema), "o" en `--teal`, punto "·" en `--teal`
(nunca omitir el punto). Es **vectorial** (`Logo.astro` en el sitio, respaldado por `Livvo_logo.svg` /
`Livvo_symbol.svg` en esta carpeta) — no depende de la fuente de UI cargada. Los mockups de producto
usan emojis solo dentro del ChatMockup.

## Files
Ver `README.md` de esta carpeta para el índice completo de archivos del design system
(`tokens.css`, `tailwind.config.js`, `catalog.html`, `marketing-design-system.md`, SVGs del logo) y
dónde se consume cada uno.
