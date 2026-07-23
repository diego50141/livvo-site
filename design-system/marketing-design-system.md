---
name: livvo-designer
description: >
  Generate production-ready visual designs for the Livvo brand as .png and .pdf files
  using the Dark-First · Teal Core design system. Use this skill whenever the user asks
  to create, design, or build any visual asset for Livvo — including LinkedIn banners,
  YouTube thumbnails, webinar covers, social media posts, presentation slides, carousel
  cards, posters, email headers, or any other design that must follow Livvo's brand identity.
  Also trigger when the user mentions 'Luisa IA' graphics, WhatsApp campaign visuals, or
  wants to create content using the dark navy / teal aesthetic. Trigger even for generic
  design requests if the context indicates Livvo.
---

# Livvo Designer

Create production-ready visual designs for the **Livvo** brand as `.png` and `.pdf` files.
Output pure self-contained HTML+CSS, then render to image/PDF using Playwright.

Complete this in two steps:
1. **Design the HTML canvas** — Write self-contained HTML+CSS implementing the Dark-First · Teal Core design system
2. **Render to output** — Use Playwright to screenshot the HTML as `.png` or print as `.pdf`

---

## STEP 1: DESIGN THE HTML CANVAS

### Design Philosophy: Dark-First · Teal Core

Livvo's visual identity is a **deep navy dark-first** aesthetic — precise, tech-forward, and unmistakably real estate IA. It communicates through layered depth rather than flat surfaces, through a signature Teal that cuts through the darkness like a system notification — purposeful, never decorative.

The aesthetic is built on five visual layers that stack to create dimensionality:

1. **Base gradient** — Never a flat `#070B14`. Always a subtle multi-source radial gradient with teal and blue bleeding from opposite corners over a dark linear base
2. **Dot grid texture** — A fine grid of tiny dark-navy dots creating depth without competing for attention
3. **Teal radial glows** — Large soft teal and blue orbs at canvas edges, suggesting system energy
4. **Structural accents** — Teal horizontal/vertical accent lines, concentric rings, diagonal patterns used architecturally — never as random ornament
5. **Content + signature bar** — Text, components, and the mandatory bottom teal-to-blue gradient accent bar

Every element feels precise and purposeful. Corners are always rounded. No decorative excess. Generous whitespace. Sharp typographic hierarchy. The result should look like the dashboard of a tool that serious Latin American inmobiliarias trust with their entire lead operation.

---

### Color Palette

| Name | Hex | Role |
|------|-----|------|
| **Background** | `#070B14` | Primary background — ALL dark designs start here |
| **Dark Alt** | `#0A0E1A` | Deeper background for covers, hero slides, closing pages |
| **Surface 1** | `#0D1424` | Cards, panels, modals |
| **Surface 2** | `#111827` | Inputs, rows, table cells, hover states |
| **Surface 3 / Line** | `#1A2240` | Borders, separators, dot grid color |
| **Dark Grid** | `#0C1530` | Dot grid on deepest/hero pages |
| **Livvo Teal** | `#00C7B4` | PRIMARY ACCENT — CTAs, links, active states, highlights. The only CTA color. |
| **Teal Deep** | `#0099A8` | Teal gradient endpoint, adds depth |
| **Electric Blue** | `#3B7EFF` | Secondary — hover, graphs, secondary actions |
| **Luisa Violet** | `#6C63FF` | EXCLUSIVE to Luisa IA agent. Never use in general UI |
| **Violet Deep** | `#4A44CC` | Luisa Violet gradient endpoint |
| **White** | `#F0F4FF` | Primary text on dark backgrounds |
| **Muted** | `#8B96AF` | Secondary text, labels, captions, metadata |
| **Red** | `#FF5470` | Error, destructive, critical alerts |
| **Gold** | `#FFB547` | Warning, pending states |
| **Green** | `#22C55E` | Success, online status, WhatsApp |
| **Cream** | `#F5F0E8` | Light mode background base (use only when explicitly light) |

Never use colors outside this palette. At most Teal + 2 neutrals simultaneously.
Luisa Violet only appears when the content specifically features the Luisa IA agent.

### Gradient Recipes

```css
/* Teal CTA gradient (buttons, badges, accent bars) */
background: linear-gradient(135deg, #00C7B4 0%, #0099A8 100%);

/* Teal-to-Blue flow (banners, hero headers) */
background: linear-gradient(135deg, #00C7B4 0%, #3B7EFF 100%);

/* Text gradient — apply to key headline words ONLY, never body text */
background: linear-gradient(135deg, #00C7B4 0%, #3B7EFF 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;

/* Luisa Violet gradient (Luisa IA content only) */
background: linear-gradient(135deg, #6C63FF 0%, #4A44CC 100%);

/* Multi-layer background (dark mode — standard) */
background:
  radial-gradient(circle at 15% 25%, rgba(0, 199, 180, 0.09) 0%, transparent 45%),
  radial-gradient(circle at 85% 75%, rgba(59, 126, 255, 0.07) 0%, transparent 45%),
  linear-gradient(180deg, #070B14 0%, #0A0E1A 100%);

/* Multi-layer background (dark mode — hero, high impact) */
background:
  radial-gradient(circle at 10% 20%, rgba(0, 199, 180, 0.14) 0%, transparent 40%),
  radial-gradient(circle at 90% 80%, rgba(59, 126, 255, 0.10) 0%, transparent 40%),
  radial-gradient(circle at 50% 50%, rgba(0, 199, 180, 0.04) 0%, transparent 60%),
  linear-gradient(180deg, #0A0E1A 0%, #070B14 100%);

/* Multi-layer background (light mode — cream base) */
background:
  radial-gradient(circle at 15% 25%, rgba(0, 199, 180, 0.12) 0%, transparent 50%),
  radial-gradient(circle at 85% 75%, rgba(59, 126, 255, 0.08) 0%, transparent 50%),
  linear-gradient(180deg, #F5F0E8 0%, #ECEAE4 100%);

/* Bottom accent bar (brand signature) */
background: linear-gradient(90deg, #00C7B4 0%, #3B7EFF 50%, #00C7B4 100%);

/* Card glassmorphism tint */
background: linear-gradient(135deg, rgba(0, 199, 180, 0.06) 0%, rgba(59, 126, 255, 0.04) 100%);
```

---

### Typography

Livvo uses **two font families** (decisión de marca 22-jul-2026 — Open Sans reemplazó a
Bricolage Grotesque e Instrument Sans en toda la marca; jerarquía por peso, tipo Zillow,
por credibilidad con compradores inmobiliarios LATAM). Always import both:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&family=Geist+Mono:wght@400;700&display=swap" rel="stylesheet">
```

| Family | Role | Never use for |
|--------|------|---------------|
| **Open Sans** | Todo el texto — titulares (700), labels (600), cuerpo (400) | Metrics, data |
| **Geist Mono** | Code & Data — metrics, IDs, timestamps, stats, technical values | Any flowing prose |

| Element | Size | Weight | Family | Color (dark bg) | Letter Spacing |
|---------|------|--------|--------|-----------------|----------------|
| Hero / Display | 56–72px | 700 | Open Sans | `#F0F4FF` | -1px |
| H1 | 36–48px | 700 | Open Sans | `#F0F4FF` | -0.5px |
| H2 | 24–32px | 700 | Open Sans | `#F0F4FF` | -0.5px |
| H3 | 18–22px | 600 | Open Sans | `#F0F4FF` | 0 |
| Body Large | 16–18px | 400 | Open Sans | `#8B96AF` | 0 |
| Body Regular | 13–15px | 400 | Open Sans | `#8B96AF` | 0 |
| Label / Tag | 10–13px | 600 | Open Sans | `#00C7B4` | 0.5–1px |
| Metric / Stat | 20–40px | 700 | Geist Mono | `#F0F4FF` or `#00C7B4` | 0 |
| Caption / Code | 11–12px | 400 | Geist Mono | `#8B96AF` | 0.5px |

Scale typography proportionally to canvas size. A 191px-tall banner uses ~22px headlines and ~8px labels. A 1080px square uses ~64px headlines and ~14px labels. Apply the teal-to-blue gradient text effect to exactly **one key word** per headline.

---

### Viewport Presets

| Preset | Width | Height | Margin | Use Case |
|--------|-------|--------|--------|----------|
| `presentation` | 1920 | 1080 | 64px | 16:9 slide decks |
| `carousel_square` | 1080 | 1080 | 72px | Instagram square |
| `carousel_portrait` | 1080 | 1350 | 96px | Instagram portrait |
| `document_letter` | 816 | 1056 | 64px | US Letter PDF |
| `linkedin_banner` | 1584 | 396 | 40px | LinkedIn personal banner |
| `linkedin_page_banner` | 1128 | 191 | 12px | LinkedIn company page banner |
| `linkedin_post` | 1200 | 627 | 48px | LinkedIn feed post |
| `twitter_header` | 1500 | 500 | 40px | Twitter/X header |
| `facebook_cover` | 820 | 312 | 32px | Facebook cover |
| `youtube_thumbnail` | 1280 | 720 | 48px | YouTube thumbnail |
| `youtube_banner` | 2560 | 1440 | 0px | YouTube channel art |
| `og_image` | 1200 | 630 | 48px | Open Graph / link preview |
| `story` | 1080 | 1920 | 64px | Instagram/WhatsApp story |
| `email_header` | 600 | 200 | 32px | Email campaign header |

---

### HTML Document Structure

Every Livvo design is a single self-contained HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width={WIDTH}, initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&family=Geist+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: {WIDTH}px;
      height: {HEIGHT}px;
      overflow: hidden;
      font-family: 'Open Sans', system-ui, sans-serif;
      background: #070B14;
      position: relative;
    }
  </style>
</head>
<body>
  <!-- Layer 0: Background gradient (multi-source radial + linear) -->
  <!-- Layer 1: Dot grid texture -->
  <!-- Layer 2: Teal/Blue glow orbs at canvas edges -->
  <!-- Layer 3: Structural accents (lines, rings) -->
  <!-- Layer 4: Content -->
  <!-- Layer 5: Bottom accent bar -->
</body>
</html>
```

Body dimensions must match the chosen viewport preset exactly.
All CSS is inline — no external stylesheets beyond the Google Fonts import.

---

### Decorative Layer Recipes

#### Dot Grid (Livvo signature texture — present on virtually all designs)

The dot grid is the single most important decorative element in Livvo's system.
Creates a sense of technical precision and depth without adding visual noise.

```css
.dot-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, #1A2240 1px, transparent 1px);
  background-size: 22px 22px;
  opacity: 0.75;
  z-index: 0;
}
```

Scale by canvas size:

| Canvas Height | Dot Color | Dot Size | Spacing | Opacity |
|---------------|-----------|----------|---------|---------|
| < 400px | `#1A2240` | 0.6px | 16px | 0.6 |
| 400–800px | `#1A2240` | 0.8px | 20px | 0.7 |
| 800–1200px | `#1A2240` | 1px | 22px | 0.75 |
| > 1200px | `#0C1530` | 1.2px | 28px | 0.85 |

Use `#0C1530` (darker) on cover/hero pages for the deepest dark-first feel.

#### Teal Glow Orbs

Soft teal and blue radial orbs positioned bleeding off canvas edges.
They should be felt as ambient energy — not visible as distinct shapes.

```css
.orb {
  position: absolute;
  border-radius: 50%;
  z-index: 1;
  pointer-events: none;
}
/* Top-left teal glow */
.orb-tl {
  width: 480px; height: 480px;
  top: -180px; left: -80px;
  background: radial-gradient(circle, rgba(0, 199, 180, 0.12) 0%, transparent 60%);
}
/* Bottom-right blue glow */
.orb-br {
  width: 400px; height: 400px;
  bottom: -120px; right: -80px;
  background: radial-gradient(circle, rgba(59, 126, 255, 0.08) 0%, transparent 60%);
}
/* Center ambient (hero/cover only) */
.orb-center {
  width: 600px; height: 300px;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(ellipse, rgba(0, 199, 180, 0.04) 0%, transparent 60%);
}
```

Opacity guide:
- Standard: 0.08–0.12 (teal), 0.06–0.08 (blue)
- Hero / high-impact: 0.14–0.20 (teal), 0.09–0.12 (blue)
- Luisa IA sections: swap blue orb for violet `rgba(108, 99, 255, 0.12)`
- XL canvases (2560px+): add `filter: blur(60px)` for atmospheric softness

#### Density Guide

| Canvas | Teal Orbs | Orb Size | Rings | Dot Spacing |
|--------|-----------|----------|-------|-------------|
| Small (~1128×191) | 1–2, offset edges | 200–280px | no | 16px |
| Medium (~1584×396) | 2, offset corners | 280–420px | optional | 20px |
| Large (~1080×1080) | 2–3, offset corners | 360–520px | 1 group | 22px |
| XL (~1920×1080) | 3, offset + blurred | 400–600px | optional | 28px |
| XXL (~2560×1440) | 4–5, blurred | 500–700px | 1–2 groups | 28px |

#### Concentric Rings (Livvo pattern 2 — Luisa IA + hero accents)

One focused group per design maximum. Used for Luisa IA sections and cover accents.
Never scattered randomly.

```css
/* Render as stacked circle divs centered on a focal point */
.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(0, 199, 180, 0.28);
  transform: translate(-50%, -50%);
  /* Luisa IA: rgba(108, 99, 255, 0.28) */
}
```

Ring sequence (inner to outer):
r=20px opacity 0.50 · r=36px opacity 0.35 · r=56px opacity 0.22 · r=80px opacity 0.14 · r=108px opacity 0.08

#### Diagonal Lines (Livvo pattern 3 — accent panels)

Confined to a specific region, never full-bleed. Used as a texture on accent zones.

```css
.diagonal-lines {
  position: absolute;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(0, 199, 180, 0.035) 10px,
    rgba(0, 199, 180, 0.035) 11px
  );
  z-index: 0;
}
```

#### Accent Lines (structural, not decorative)

Teal lines define hierarchy — they are not ornamental. Use sparingly.

```css
.accent-line-h {
  width: 48px; height: 3px;
  background: linear-gradient(90deg, #00C7B4, rgba(0, 199, 180, 0.15));
  border-radius: 2px;
  margin-bottom: 16px;
}
.accent-line-v {
  width: 2px;
  background: linear-gradient(to bottom, transparent, #1A2240 20%, #1A2240 80%, transparent);
  border-radius: 1px;
  align-self: stretch;
}
```

#### Teal Particles (canvases 1080px+ only)

4–7 tiny teal glow dots scattered sparsely for depth. Never clustered.

```css
.particle {
  position: absolute;
  width: 4px; height: 4px;
  background: radial-gradient(circle, rgba(0, 199, 180, 0.7) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 2;
}
```

---

### Component Recipes

#### Bottom Accent Bar (brand signature — present on virtually every design)

```css
.bottom-bar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 4px; /* 3px small, 4px medium, 6px large canvases */
  background: linear-gradient(90deg, #00C7B4 0%, #3B7EFF 50%, #00C7B4 100%);
  box-shadow: 0 -2px 16px rgba(0, 199, 180, 0.4);
  z-index: 100;
}
```

#### Teal Badge / Pill

```css
.badge {
  background: linear-gradient(135deg, #00C7B4 0%, #0099A8 100%);
  color: #070B14;
  padding: 8px 20px;
  border-radius: 20px;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  box-shadow: 0 4px 16px rgba(0, 199, 180, 0.35), inset 0 1px 0 rgba(255,255,255,0.2);
  display: inline-block;
}
.badge-outline {
  background: transparent;
  border: 1.5px solid #00C7B4;
  color: #00C7B4;
  box-shadow: none;
}
```

#### Card (dark surface)

```css
.card {
  background: #0D1424;
  border: 1px solid #1A2240;
  border-radius: 12px;
  padding: 20px 24px;
  position: relative;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}
.card-accent {
  background: linear-gradient(135deg, rgba(0, 199, 180, 0.06) 0%, rgba(59, 126, 255, 0.04) 100%);
  border: 1px solid rgba(0, 199, 180, 0.25);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 199, 180, 0.08);
}
.card-luisa {
  background: #130F2A;
  border: 1px solid rgba(108, 99, 255, 0.4);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(108, 99, 255, 0.1);
}
```

#### Stat / Metric Box

```css
.stat-box {
  background: #0D1424;
  border: 1px solid #1A2240;
  border-radius: 10px;
  padding: 16px 20px;
}
.stat-value {
  font-family: 'Geist Mono', monospace;
  font-size: 28px; font-weight: 700;
  color: #00C7B4; line-height: 1;
}
.stat-label {
  font-family: 'Open Sans', sans-serif;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.5px;
  color: #8B96AF; margin-top: 6px;
}
```

#### Info Box (teal-accented, dark)

```css
.info-box {
  background: rgba(0, 199, 180, 0.05);
  border: 1.5px solid rgba(0, 199, 180, 0.3);
  border-radius: 12px;
  padding: 20px 24px;
  position: relative;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 199, 180, 0.06);
}
.info-box::before {
  content: '';
  position: absolute;
  top: 0; left: 50%; transform: translateX(-50%);
  width: 80%; height: 2px;
  background: linear-gradient(90deg, transparent 0%, #00C7B4 50%, transparent 100%);
  box-shadow: 0 0 12px rgba(0, 199, 180, 0.7);
  border-radius: 0 0 2px 2px;
}
```

#### Channel Pill (WhatsApp / Instagram / Facebook / Luisa)

```css
.channel-pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: #111827; border: 1px solid #1A2240;
  border-radius: 8px; padding: 8px 14px;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px; font-weight: 600; color: #F0F4FF;
}
.channel-dot {
  width: 8px; height: 8px; border-radius: 50%;
  /* WhatsApp: #22C55E | Instagram: #E1306C | Facebook: #1877F2 | Luisa: #6C63FF */
}
```

#### Luisa IA Avatar

```css
.luisa-avatar {
  width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, #6C63FF 0%, #4A44CC 100%);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Open Sans', sans-serif;
  font-size: 24px; font-weight: 700; color: #FFFFFF;
  box-shadow:
    0 0 0 6px rgba(108, 99, 255, 0.2),
    0 0 0 12px rgba(108, 99, 255, 0.1),
    0 0 0 20px rgba(108, 99, 255, 0.05);
}
```

#### CTA Button

```css
.btn-primary {
  background: linear-gradient(135deg, #00C7B4 0%, #0099A8 100%);
  color: #070B14; border: none; border-radius: 8px;
  padding: 12px 24px; font-family: 'Open Sans', sans-serif;
  font-size: 14px; font-weight: 700;
  box-shadow: 0 4px 16px rgba(0, 199, 180, 0.35);
  letter-spacing: 0.3px;
}
.btn-secondary {
  background: #111827; color: #F0F4FF;
  border: 1px solid #1A2240; border-radius: 8px;
  padding: 12px 24px; font-family: 'Open Sans', sans-serif;
  font-size: 14px; font-weight: 600;
}
```

#### Separator Line

```css
.separator {
  height: 1px;
  background: linear-gradient(90deg, transparent, #1A2240 20%, #1A2240 80%, transparent);
  margin: 24px 0;
}
```

---

### The Livvo Logo (Inline SVG)

El SVG canónico vive en `C:\Users\USUARIO\Documents\design_handoff_livvo_ds\Livvo_logo.svg`
(wordmark, con `currentColor` en las letras) y `Livvo_symbol.svg` (símbolo VV standalone).
Control letter colors per group via `fill` attribute.

#### Dark Background (white `livv` + teal `o` + teal dot)

```html
<!-- viewBox recortado: el original ("0 0 122.25 31.5") dejaba un hueco a la
     izquierda y el punto flotando lejos de la o -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="24.4 0 48.5 31.5"
     style="height: {SIZE}px; width: auto; display: block;">
  <!-- l, i, v, v — white -->
  <g fill="#F0F4FF" fill-opacity="1">
    <g transform="translate(25.436345, 23.17278)">
      <path d="M 3.640625 -13.9375 L 3.640625 0 L 1.03125 0 L 1.03125 -13.359375 Z"/>
    </g>
    <g transform="translate(29.521585, 23.17278)">
      <path d="M 2.328125 -11.125 C 1.921875 -11.125 1.570312 -11.269531 1.28125 -11.5625 C 0.988281 -11.863281 0.84375 -12.21875 0.84375 -12.625 C 0.84375 -13.03125 0.988281 -13.378906 1.28125 -13.671875 C 1.570312 -13.960938 1.921875 -14.109375 2.328125 -14.109375 C 2.734375 -14.109375 3.082031 -13.960938 3.375 -13.671875 C 3.664062 -13.378906 3.8125 -13.03125 3.8125 -12.625 C 3.8125 -12.21875 3.664062 -11.863281 3.375 -11.5625 C 3.082031 -11.269531 2.734375 -11.125 2.328125 -11.125 Z M 3.640625 -9.953125 L 3.640625 0 L 1.03125 0 L 1.03125 -9.953125 Z"/>
    </g>
    <g transform="translate(33.606825, 23.17278)">
      <path d="M 4.28125 0 L 0 -9.953125 L 2.84375 -9.953125 L 5.578125 -3.328125 L 8.28125 -9.953125 L 11.078125 -9.953125 L 6.796875 0 Z"/>
    </g>
    <g transform="translate(44.106807, 23.17278)">
      <path d="M 4.28125 0 L 0 -9.953125 L 2.84375 -9.953125 L 5.578125 -3.328125 L 8.28125 -9.953125 L 11.078125 -9.953125 L 6.796875 0 Z"/>
    </g>
  </g>
  <!-- o — Livvo Teal (brand color signature in the wordmark) -->
  <g fill="#00C7B4" fill-opacity="1">
    <g transform="translate(54.606789, 23.17278)">
      <path d="M 0.578125 -4.96875 C 0.578125 -5.6875 0.710938 -6.359375 0.984375 -6.984375 C 1.253906 -7.617188 1.628906 -8.171875 2.109375 -8.640625 C 2.585938 -9.109375 3.148438 -9.472656 3.796875 -9.734375 C 4.453125 -10.003906 5.144531 -10.140625 5.875 -10.140625 C 6.613281 -10.140625 7.304688 -10.003906 7.953125 -9.734375 C 8.609375 -9.472656 9.175781 -9.109375 9.65625 -8.640625 C 10.132812 -8.171875 10.507812 -7.617188 10.78125 -6.984375 C 11.050781 -6.359375 11.1875 -5.6875 11.1875 -4.96875 C 11.1875 -4.238281 11.050781 -3.554688 10.78125 -2.921875 C 10.507812 -2.296875 10.132812 -1.753906 9.65625 -1.296875 C 9.175781 -0.835938 8.609375 -0.472656 7.953125 -0.203125 C 7.304688 0.0546875 6.613281 0.1875 5.875 0.1875 C 5.144531 0.1875 4.453125 0.0546875 3.796875 -0.203125 C 3.148438 -0.472656 2.585938 -0.835938 2.109375 -1.296875 C 1.628906 -1.753906 1.253906 -2.296875 0.984375 -2.921875 C 0.710938 -3.554688 0.578125 -4.238281 0.578125 -4.96875 Z M 5.875 -2.078125 C 6.644531 -2.078125 7.296875 -2.359375 7.828125 -2.921875 C 8.359375 -3.484375 8.625 -4.164062 8.625 -4.96875 C 8.625 -5.78125 8.359375 -6.460938 7.828125 -7.015625 C 7.296875 -7.578125 6.644531 -7.859375 5.875 -7.859375 C 5.113281 -7.859375 4.460938 -7.578125 3.921875 -7.015625 C 3.390625 -6.460938 3.125 -5.78125 3.125 -4.96875 C 3.125 -4.164062 3.390625 -3.484375 3.921875 -2.921875 C 4.460938 -2.359375 5.113281 -2.078125 5.875 -2.078125 Z"/>
    </g>
  </g>
  <!-- Teal dot · — the brand signature, as essential as the letters -->
  <circle cx="69.4" cy="20.9" r="2.3" fill="#00C7B4"/>
</svg>
```

#### Light Background (dark `livv` + teal `o` + teal dot)

Same SVG — replace `fill="#F0F4FF"` with `fill="#070B14"` on the first `<g>`.

#### HTML Wordmark (pure CSS — use when SVG alignment is tricky)

```html
<div style="font-family: 'Open Sans', sans-serif; font-weight: 700;
            display: inline-flex; align-items: baseline; line-height: 1;">
  <span style="color: #F0F4FF; letter-spacing: -0.5px;">livv</span>
  <span style="color: #00C7B4; letter-spacing: -0.5px;">o</span>
  <span style="color: #00C7B4; margin-left: 3px; font-size: 1.15em; line-height: 0;">·</span>
</div>
<!-- Light bg: replace #F0F4FF with #070B14 -->
```

**Logo size & placement guide**:

| Canvas | Logo Height | Placement |
|--------|-------------|-----------|
| `linkedin_page_banner` 1128×191 | 20px | top-left |
| `linkedin_banner` 1584×396 | 28px | top-left |
| `linkedin_post` 1200×627 | 28px | top-right |
| `carousel_square` 1080×1080 | 32px | top-right |
| `presentation` 1920×1080 | 36px | top-left |
| `story` 1080×1920 | 30px | top-left or top-center |

**Rules**: Never center the logo on horizontal banners. Never omit the teal dot ·.
Minimum 16px clearance around wordmark at all times.

---

### Light vs Dark Mode

**Dark Mode** (default — 90%+ of all Livvo designs):
- Base: `#070B14` with multi-source radial glow layers
- Dot grid: `#1A2240` or `#0C1530`
- Headlines: `#F0F4FF` · Body: `#8B96AF`
- Cards: `#0D1424` bg, `#1A2240` border
- Teal orb opacity: 0.08–0.14 standard / 0.14–0.20 hero
- Logo: white `livv` + teal `o` + teal dot

**Light Mode** (only when explicitly requested — external presentations, print):
- Base: `#F5F0E8` → `#ECEAE4` (warm cream, never pure white)
- Headlines: `#070B14` · Body: `#8B96AF`
- Cards: `#FFFFFF` with teal border `rgba(0, 199, 180, 0.25)`
- Teal orb opacity: 0.10–0.16
- Dot grid: `rgba(26, 34, 64, 0.4)` on cream
- Logo: dark `livv` (`#070B14`) + teal `o` + teal dot

---

### Design Type Layout Patterns

**LinkedIn Banner (1584×396)**:
Dark base. Dot grid. Teal glow bleeding off top-right corner. Logo top-left (28px). Teal bar bottom.
Left 55%: 2–3 line headline (Open Sans 42px, one word teal gradient) + subtitle (Muted).
Right 45%: 2–3 stat boxes or channel pills stacked vertically. Separator between columns.

**LinkedIn Page Banner (1128×191)**:
Tiny canvas — every pixel counts. Dark base, dot grid. Logo top-left (20px). Teal bar bottom (3px).
Single centered headline (Open Sans 28px, one word teal gradient).
Tagline below (Open Sans 12px, Muted). 1–2 teal badge pills. Minimal orbs.

**LinkedIn Post / OG Image (1200×627)**:
Dark base. Logo top-right (28px). Teal badge pill (UPPERCASE label) top area.
Center: bold headline 2–3 lines (52–60px), one word teal gradient.
Bottom: stat row or CTA with teal accent line above.

**Carousel Square (1080×1080)**:
Slide number top-left (Geist Mono, Muted). Logo top-right (32px).
Teal accent line + badge above headline. Large title with teal gradient on key word.
Content area: cards, stats, or channel pills. Bottom accent bar.
Keep consistent layout across all slides in the series.

**Presentation Slide (1920×1080)**:
Logo top-left (36px). Slide number top-right (Geist Mono, Muted).
Section label (Open Sans, UPPERCASE, Teal, 11px) above headline.
Two-column: text left (40–45%), visual/stats right (55–60%).
Teal vertical accent line as column divider.
Full-bleed dot grid. Teal glow top-left, blue glow bottom-right.

**WhatsApp Story (1080×1920)**:
Full dark background. Logo top-left (30px). Teal badge pill below.
Large bold title center (Open Sans 72–80px, teal gradient on key word).
Supporting stats row in Geist Mono.
CTA button (teal primary) + livvo.tech URL in Geist Mono bottom.
Concentric rings behind the title as a single decorative accent.

**Webinar / Event Cover (1080×1080)**:
Header row: teal badge (left) + logo (right).
Two-column: text left 55% (headline + speaker info + info boxes), visual right 45% (stats card or photo frame).
Bottom accent bar. High-impact teal glow top-left.

---

### Absolute Don'ts

- Never use sharp corners — minimum 8px border-radius, 12px+ for cards
- Never use a flat `#070B14` background without the radial glow gradient layers
- Never use Livvo Teal as a background fill (only as accent, CTA, and text gradient)
- Never use Luisa Violet (`#6C63FF`) outside of Luisa IA specific content
- Never use more than 3 chromatic colors simultaneously in one composition
- Never apply the teal gradient text to body copy (headlines and key words only)
- Never use fonts other than Open Sans or Geist Mono
- Never center the logo on a horizontal banner (top-left or top-right only)
- Never omit the teal dot (·) after "livvo" in the wordmark
- Never place the wordmark on a low-contrast background
- Never use more than one concentric ring group per composition
- Never add prisms, diamonds, stars, or non-system ornamental elements
- Never use solid-color shadows (teal-tinted or dark only, no pure black shadows on teal elements)

---

## STEP 2: RENDER TO OUTPUT

After creating the HTML file, render it to `.png` or `.pdf` using Playwright.

### Python (Playwright)

```python
import asyncio
from playwright.async_api import async_playwright

async def render_livvo(html_path: str, output_path: str, width: int, height: int):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": width, "height": height})
        await page.goto(f"file://{html_path}", wait_until="networkidle")

        if output_path.endswith(".png"):
            await page.screenshot(path=output_path, full_page=False)
        elif output_path.endswith(".pdf"):
            await page.pdf(
                path=output_path,
                width=f"{width}px",
                height=f"{height}px",
                print_background=True,
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}
            )
        await browser.close()

# asyncio.run(render_livvo("/home/claude/design.html", "/mnt/user-data/outputs/design.png", 1584, 396))
```

### Node.js (Playwright)

```javascript
const { chromium } = require('playwright');

async function renderLivvo(htmlPath, outputPath, width, height) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

  if (outputPath.endsWith('.png')) {
    await page.screenshot({ path: outputPath, fullPage: false });
  } else if (outputPath.endsWith('.pdf')) {
    await page.pdf({
      path: outputPath,
      width: `${width}px`,
      height: `${height}px`,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });
  }
  await browser.close();
}

// renderLivvo('/home/claude/design.html', '/mnt/user-data/outputs/design.png', 1584, 396);
```

### Quick CLI

```bash
# Install if needed
npx playwright install chromium

# Screenshot at exact viewport
npx playwright screenshot --viewport-size="1584,396" --full-page=false design.html design.png
```

### Local (Windows — este equipo)

En esta máquina NO hay Playwright ni ImageMagick; usa `puppeteer-core` con el Chrome
instalado (pipeline ya probado — ver `scratchpad/og/render.mjs` como referencia):

```javascript
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 }); // 2x para nitidez
await page.goto(new URL('./design.html', import.meta.url).href, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready); // esperar Google Fonts
await page.screenshot({ path: 'design.png', clip: { x: 0, y: 0, width: W, height: H } });
await browser.close();
```

Nota de marca (jul-2026): el azul oficial es `#3B7EFF` y el dominio es **livvo.tech**.

---

## QUALITY CHECKLIST

Before finalizing, verify every point:

- [ ] Body dimensions match the chosen viewport preset exactly
- [ ] Google Fonts import for Open Sans + Geist Mono is present
- [ ] Background uses layered radial gradients — not a flat `#070B14`
- [ ] Dot grid layer is present with correct spacing and color for the canvas size
- [ ] At least 2 teal/blue glow orbs positioned bleeding off canvas edges
- [ ] Bottom accent bar (teal-to-blue gradient, 3–6px) is present with `z-index: 100`
- [ ] Logo is present — "livvo" with teal "o" and teal dot ·, correct color for background
- [ ] At least one headline word uses the teal-to-blue gradient text effect
- [ ] All border-radius values are 8px+ — no sharp corners anywhere
- [ ] Livvo Teal only on CTAs, accents, and gradient text — not as a fill color
- [ ] Luisa Violet only appears if content features Luisa IA
- [ ] No more than 3 chromatic colors in the composition
- [ ] Text is fully readable against its background (`#F0F4FF` on `#070B14` passes contrast)
- [ ] All content stays within the margin insets — nothing raw against canvas edges
- [ ] Geist Mono is used for every numeric metric or technical value
- [ ] HTML is fully self-contained — no external CSS, no broken asset references

---

## SALES DECK — PPTX (White Theme)

When the user asks to create, edit, or extend a **PowerPoint / sales deck** for Livvo, use `pptxgenjs` with the white-theme system below — NOT the dark HTML/Playwright pipeline.

### Source file
`/home/claude/livvo-sales/build_clean.js` — 11-slide sales deck, fully working.
Output: `/mnt/user-data/outputs/Livvo-Sales-Deck.pptx`

### White-Theme Palette (PPTX)

| Token | Hex | Role |
|-------|-----|------|
| `bg` | `FFFFFF` | All slide backgrounds |
| `surf1` | `F4F6FA` | Card / panel fill |
| `surf2` | `EEF1F8` | Alternating row, lighter panel |
| `surf3` | `E5EAF4` | Chip bg, tag bg |
| `navy` | `0D1424` | All body/headline text |
| `muted` | `64748B` | Secondary text, captions |
| `line` | `DDE3EF` | Borders, separators |
| `teal` | `00C7B4` | Primary accent (bars, CTAs, values) |
| `blue` | `3B7EFF` | Secondary accent |
| `violet` | `6C63FF` | Step 3 / Propiedades |
| `red` | `FF5470` | Problem stats, NO column |
| `gold` | `FFB547` | Warning, cost, objeciones |
| `green` | `22C55E` | Success, YES column |

### Logo rendering (ImageMagick + sharp)

SVG text rendering fails in `sharp` — fonts not installed. Use ImageMagick:

```javascript
const { execSync } = require('child_process');
const sharp = require('sharp');

async function buildLogo(heightPx = 88) {
  const scale = heightPx / 72;
  const fs_px = Math.round(60 * scale);
  const symW  = Math.round(heightPx * 0.80);
  const gap   = Math.round(heightPx * 0.18);
  const baseline = Math.round(heightPx * 0.82);

  const livvW = parseInt(execSync(`convert -font DejaVu-Sans-Bold -pointsize ${fs_px} -format '%[fx:w]' label:livv info: 2>/dev/null`).toString().trim());
  const oW    = parseInt(execSync(`convert -font DejaVu-Sans-Bold -pointsize ${fs_px} -format '%[fx:w]' label:o info: 2>/dev/null`).toString().trim());
  const totalW = symW + gap + livvW + oW + 6;
  const H2    = heightPx + 4;

  // VV symbol via sharp SVG
  const sw = symW * 0.115, cx = symW / 2, cy = symW / 2;
  const p1 = `${cx-symW*0.26},${cy-symW*0.30} ${cx-symW*0.07},${cy+symW*0.30} ${cx+symW*0.12},${cy-symW*0.30}`;
  const p2 = `${cx-symW*0.10},${cy-symW*0.30} ${cx+symW*0.09},${cy+symW*0.30} ${cx+symW*0.28},${cy-symW*0.30}`;
  const symSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${symW}" height="${symW}">
    <polyline points="${p1}" fill="none" stroke="#0D1424" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="${p2}" fill="none" stroke="#00C7B4" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  const symFile = '/tmp/sym_tmp.png';
  require('fs').writeFileSync(symFile, await sharp(Buffer.from(symSvg)).resize(symW, symW).png().toBuffer());

  const textX = symW + gap, oX = textX + livvW;
  const outFile = '/tmp/logo_clean.png';
  execSync([
    'convert',
    `-size ${totalW}x${H2} xc:white`,
    `-draw "image Over 0,${Math.round((H2-symW)/2)} ${symW},${symW} '${symFile}'"`,
    `-font DejaVu-Sans-Bold -pointsize ${fs_px}`,
    `-fill '#0D1424' -annotate +${textX}+${baseline} "livv"`,
    `-fill '#00C7B4' -annotate +${oX}+${baseline} "o"`,
    outFile
  ].join(' '));

  const buf = require('fs').readFileSync(outFile);
  return { data: 'image/png;base64,' + buf.toString('base64'), w: totalW, h: H2 };
}

async function addLogo(slide, x = 0.38, y = 0.18, hIn = 0.38) {
  const lr = await buildLogo(Math.round(hIn * 96 * 2));
  slide.addImage({ data: lr.data, x, y, h: hIn, w: hIn * (lr.w / lr.h) });
}
```

### VV Symbol (standalone, for icons/thumbnails)

```javascript
async function symB64(size) {
  const sw = size*0.115, cx = size/2, cy = size/2;
  const p1 = `${cx-size*0.26},${cy-size*0.30} ${cx-size*0.07},${cy+size*0.30} ${cx+size*0.12},${cy-size*0.30}`;
  const p2 = `${cx-size*0.10},${cy-size*0.30} ${cx+size*0.09},${cy+size*0.30} ${cx+size*0.28},${cy-size*0.30}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <polyline points="${p1}" fill="none" stroke="#0D1424" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="${p2}" fill="none" stroke="#00C7B4" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  const buf = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  return 'image/png;base64,' + buf.toString('base64');
}
```

### Dot grid (subtle, white bg)

```javascript
function dotGrid(slide, pres) {
  for (let r = 0; r < 12; r++) for (let c = 0; c < 20; c++) {
    slide.addShape(pres.shapes.OVAL, {
      x: c*(10/20)+0.1, y: r*(5.625/12)+0.1, w: 0.04, h: 0.04,
      fill: { color: "C8D4E8", transparency: 30 },
      line: { color: "C8D4E8", transparency: 100 }
    });
  }
}
```

### Shadow factory

```javascript
// Always use factory functions — pptxgenjs mutates shadow objects in-place
const mkSh   = () => ({ type:"outer", color:"000000", blur:10, offset:2, angle:135, opacity:0.08 });
const mkShSm = () => ({ type:"outer", color:"000000", blur:5,  offset:1, angle:135, opacity:0.08 });
```

### Slide structure pattern

Every content slide follows this pattern:
1. `s.background = { color: "FFFFFF" }`
2. `dotGrid(s, pres)`
3. Top accent bar: `s.addShape(RECTANGLE, { x:0, y:0, w:10, h:0.06, fill:{color: ACCENT_COLOR} })`
4. `await addLogo(s, 0.5, 0.12, 0.28)`
5. Headline at `y:0.44`
6. Content cards/grid below `y:1.18`

### pptxgenjs critical rules

- **NEVER use `#` in hex colors** — causes file corruption
- **NEVER reuse shadow objects** — use `mkSh()` factory each time
- **Icons**: use `react-icons/fa` + `sharp` to rasterize SVG → PNG base64
- **Text colors on dark callout boxes** must be hardcoded (`"F0F4FF"`), not `C.navy`

### 11-slide deck structure

| # | Slide | Key accent color |
|---|-------|-----------------|
| 1 | Cover — headline + WhatsApp mockup | Teal |
| 2 | El Problema — 3 stat cards + quote | Red |
| 3 | El Costo Real — flow diagram + impact banner | Gold |
| 4 | La Solución — 4 process cards with icons | Teal |
| 5 | Dashboard — 4 KPI cards + 4 feature rows | Blue |
| 6 | Integraciones — 2×4 grid | Violet |
| 7 | ROI — table left + dark green callout right | Teal |
| 8 | ¿Para quién es? — YES/NO columns | Green / Red |
| 9 | Objeciones — 2×2 Q&A cards | Gold |
| 10 | Próximos Pasos — 3 steps + teal CTA banner | Teal |
| 11 | Back Cover — logo centered + concentric rings | Teal |

---

## REFINEMENT PASS

After completing the initial design, review it from two perspectives.

First, as a real estate director in Bogotá or Medellín evaluating a SaaS tool for their team:
Does this look like software they would trust with every lead that comes through WhatsApp?
Does the precision feel earned, not performed? Does the teal read as "system active" — not as decoration?

Then, as a designer: is the spacing tight and consistent? Does the dot grid breathe
without dominating? Is the wordmark "livvo·" unmistakably present and correctly colored?
Does the teal gradient on that one headline word create hierarchy, or just noise?

Tighten anything loose. This should look like the output of a team that builds their product
with the same care they put into their brand — because Livvo does.

