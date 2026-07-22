# Handoff: Livvo Design System

## Overview
Sistema de diseño de la marca **Livvo** (IA comercial para inmobiliarias). Define color, tipografía,
espaciado, radios, elevación, capas decorativas y una librería de componentes (base y de producto).
El objetivo es que Claude Code lo use como **fuente de verdad** para mejorar / rehacer la web de Livvo
manteniendo consistencia de marca.

## About the Design Files
El archivo `Livvo Design System.dc.html` es una **referencia de diseño en HTML** — un catálogo vivo que
muestra el aspecto y comportamiento previstos, **no** código de producción para copiar tal cual.
La tarea es **recrear estos estilos y componentes en el entorno del codebase real** (React/Next, Vue, etc.)
usando sus patrones y librerías existentes. Si no hay entorno aún, elige el framework más adecuado e
implementa los tokens como variables CSS / theme.

## Fidelity
**High-fidelity.** Colores, tipografía, espaciado, radios y estados son finales y provienen directamente
de las variables `:root` de livvo.tech. Recrear pixel-perfect con las librerías del proyecto.

## Design Tokens (fuente de verdad — copiar a :root / theme)

```css
:root {
  /* Brand */
  --teal:        #00C7B4;  /* acento primario · único color de CTA */
  --teal-deep:   #0099A8;  /* teal para texto sobre fondo claro (contraste) + fin de gradiente */
  --blue:        #3B9EFF;  /* secundario · links · gráficos */
  --blue-mid:    #A8D4FF;
  --blue-light:  #DEEEFF;
  --violet:      #6C63FF;  /* EXCLUSIVO Luisa IA — nunca en UI general */

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

### Gradientes
- **Teal CTA:** `linear-gradient(135deg,#00C7B4,#0099A8)` — botones, badges
- **Teal → Blue:** `linear-gradient(135deg,#00C7B4,#3B9EFF)` — hero, palabra destacada del titular
- **Texto degradado:** aplicar Teal→Blue con `background-clip:text` SOLO a una palabra clave del titular
- **Luisa Violet:** `linear-gradient(135deg,#6C63FF,#4A44CC)` — solo Luisa IA

### Spacing scale
`4 · 8 · 12 · 16 · 24 · 32 · 48 px` (space-1 … space-12)

### Elevation
- sm: `0 2px 8px rgba(13,20,36,0.08)`
- md: `0 6px 20px rgba(13,20,36,0.12)`
- glow: `0 6px 20px rgba(13,20,36,0.1), 0 0 20px rgba(0,199,180,0.18)`

## Typography
Importar de Google Fonts: **Bricolage Grotesque**, **Instrument Sans**, **Geist Mono**.

| Rol | Familia | Tamaño | Peso | Uso |
|-----|---------|--------|------|-----|
| Hero / Display | Bricolage Grotesque | 56–80px | 800 | titular hero (letter-spacing -1px) |
| H1 | Bricolage Grotesque | 36–48px | 800 | -0.5px |
| H2 | Bricolage Grotesque | 24–32px | 700 | encabezados de sección |
| H3 | Instrument Sans | 18–22px | 600 | subtítulos |
| Body | Instrument Sans | 15–18px | 400 | cuerpo (color --muted o --text) |
| Label | Instrument Sans | 11–13px | 700 | UPPERCASE, letter-spacing 1.5px, color --teal-deep |
| Metric / Data | Geist Mono | 20–40px | 700 | precios, KPIs, IDs, timestamps |

Reglas: Bricolage solo display; Instrument solo UI/texto; Geist Mono solo datos/técnico. Nunca otras fuentes.

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
- **Section** — patrón eyebrow (label UPPERCASE teal) + H2 Bricolage centrado, max-width ~640px.
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
Logo = wordmark tipográfico: "livv" en `--navy`, "o" en `--teal`, punto "·" en `--teal` (nunca omitir el punto). No hay imágenes; los mockups usan emojis solo dentro del ChatMockup.

## Files
- `Livvo Design System.dc.html` — catálogo completo navegable (foundations + componentes). Ábrelo en el navegador para ver cada componente renderizado con sus estilos exactos.
