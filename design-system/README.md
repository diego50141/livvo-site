# Livvo Design System — fuente de verdad

Todo el sistema de diseño de Livvo, versionado en un solo lugar.

## Documentación viva

**La referencia principal es la página [/design-system](https://livvo-site.vercel.app/design-system)**
(no indexada): renderiza tokens y componentes **de producción** en ambos temas — nunca se
desactualiza porque usa el mismo código que el sitio. El toggle del navbar cambia claro/oscuro.

## Archivos

| Archivo | Qué es |
|---|---|
| `HANDOFF.md` | Handoff original del DS web (tema claro, fidelidad alta) |
| `tokens.css` | Tokens del handoff (los vigentes viven en `src/styles/global.css`, que agrega el bloque dark) |
| `tailwind.config.js` | Tokens como `theme.extend` para Tailwind v3/v4 |
| `catalog.html` | Catálogo estático original del handoff (histórico — preferir /design-system) |
| `marketing-design-system.md` | Sistema "Dark-First · Teal Core" para piezas gráficas (copia del skill `livvo-designer`) |
| `Livvo_logo.svg` | Wordmark canónico "livvo·" — `currentColor` en letras, teal fijo en o y punto |
| `Livvo_symbol.svg` | Símbolo VV standalone |

## Decisiones de marca vigentes

- Azul oficial: **#3B7EFF** (jul-2026; reemplaza al #3B9EFF del handoff original)
- Tema oscuro web = superficies del sistema de marketing: `#070B14 / #0D1424 / #111827 / #1A2240`,
  texto `#F0F4FF`, muted `#8B96AF`, teal directo sobre oscuro
- Tipografías: Bricolage Grotesque (display) · Instrument Sans (UI) · Geist Mono (datos) — nunca otras
- Teal `#00C7B4` único color de CTA; violeta `#6C63FF` exclusivo de Luisa IA
- El punto del wordmark "livvo·" nunca se omite; logo nunca centrado en banners horizontales
- Dominio: livvo.tech

## Dónde se consume

- **Web**: `src/styles/global.css` (tokens claro + dark) y `src/components/` (este repo)
- **Piezas de marketing**: skill `livvo-designer` en `~/.claude/skills/` (espejo de
  `marketing-design-system.md` — si editas uno, actualiza el otro)
