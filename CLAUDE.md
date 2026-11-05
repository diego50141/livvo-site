# Blog de Livvo — guía de estilo

Referencia para escribir o adaptar posts en `src/content/blog/*.md`. Todos los posts publicados deben seguir esta estructura para mantener consistencia.

## Frontmatter

```yaml
title: "Gancho: especificidad"        # sin año entre paréntesis
description: "1-2 frases, 120-155 caracteres (Google corta en ~155), con el dato clave al principio"
pubDate: YYYY-MM-DD
category: "..."                        # una de las 5 fijas, ver content.config.ts
tags: ["...", "..."]                   # 2-4, minúsculas, un solo nombre por concepto (p. ej. "agente de ia", nunca "agente ia"); se muestran como chips y salen como article:tag
author: "Diego Alfonso"
faq:
  - q: "..."
    a: "..."                           # prosa autocontenida, NUNCA tablas ni markdown
```

- No se usa el campo `image`: el cover sale automático por categoría vía `BlogCoverArt.astro` (`src/components/BlogCoverArt.astro`). Solo se pasa `image` si un post necesita una imagen específica que reemplace el cover procedural.
- **Imagen para compartir (Open Graph)**: se genera sola en cada build para cada post, a partir de `title` + `category` (`src/lib/og-image.ts`, endpoint `src/pages/blog/og/[slug].png.ts` → `/blog/og/<slug>.png`, 1200×630, ~100 KB). No hay que subir ni crear nada: publicar el post basta. El `og:image:alt` sale como "Portada del artículo: {título}". Si el post define `image`, esa tiene prioridad. Para cambiar el diseño se edita solo `og-image.ts`; los títulos muy largos (>80 caracteres) bajan de tamaño automáticamente.
- **Páginas de etiqueta**: toda etiqueta con 3 o más posts publicados genera sola `/blog/etiqueta/<slug>/` (`src/pages/blog/etiqueta/[tag].astro`, umbral `MIN_POSTS_FOR_TAG_PAGE` en `src/lib/blog.ts`) y su chip en el post pasa a ser un enlace. Para darle H1 y descripción propios (120-155 caracteres) se agrega la etiqueta a `TAG_COPY` en `src/lib/blog.ts`; sin entrada usa una plantilla genérica. Reutiliza siempre los mismos nombres de etiqueta: una etiqueta nueva de un solo uso no crea página.
- `faq`: 5-6 pares. Se renderizan aparte al final de la página (no los repitas en el cuerpo del post).

## Categorías (`src/content.config.ts`)

- **Agentes de IA** — Luisa, IA vs. chatbot, casos de uso de IA.
- **WhatsApp para inmobiliarias** — bloqueos, calidad de número, catálogo, API oficial, leads. Aquí cae la mayoría del SEO programático por ciudad/portal.
- **Plataforma Livvo** — CRM, gestor de propiedades, atención al cliente.
- **Guías y casos de uso** — prácticas generales no atadas a WhatsApp/IA.
- **Actualidad del sector** — noticias, cambios de Meta, regulación, mercado.

El color del cover procedural depende de la categoría (violeta solo para Agentes de IA — es el color exclusivo de Luisa, no se usa en otras categorías).

## Estructura del cuerpo

1. **Párrafo de apertura**: responde la pregunta principal de una vez, con los datos clave. No uses la frase "La respuesta corta:" ni variantes ("La respuesta directa:") — el post entra directo a la respuesta, sin etiquetarla.
2. 1-2 párrafos de contexto: por qué le importa a una inmobiliaria. Opcional un párrafo-preview ("En esta guía vas a encontrar...") cuando el post es largo y se beneficia de un roadmap.
3. H2s en progresión lógica: qué es / datos y tablas / reglas o pasos prácticos / tabla comparativa (competencia o status quo vs. Livvo) / tabla "según tu situación" / CTA / Fuentes.
4. Tablas comparativas como recurso recurrente: `| Aspecto | Opción A | Opción B |`. Una línea de nota debajo si aplica (dato metodológico, no cita: "Precios según... / Pesos con la TRM del [fecha]").
5. Enlaces internos siempre como `[texto](/ruta)`, nunca URL pelada: a otros posts del blog, a `/agentes-ia`, `/plataforma-de-atencion-al-cliente`, `/herramientas/simulador-costos-whatsapp` y demás páginas de producto.
6. **CTA final**: H2 con título propio del post (no genérico), párrafo reencuadrando el problema, bullets nombrando los dos productos con link — `[Luisa](/agentes-ia)...` y `[Livvo Chat](/plataforma-de-atencion-al-cliente)...` —, cierre con pregunta en **negrita** + link de WhatsApp:
   `https://wa.me/573144267806?text=Hola%20equipo%20livvo%2C%20quiero%20...` (mensaje específico al tema del post, acentos codificados en UTF-8).
7. `## Fuentes` al final, solo si el post cita datos externos: lista plana `Fuente — descripción`, sin links y sin citas parentéticas intercaladas en el cuerpo (nada de "(Meta)", "(Coursiv)"). Si el post es puramente conceptual/de producto, se omite la sección.

### Tamaño de párrafo

- Párrafo de apertura: 2-4 frases (~50-80 palabras) — es el único que puede ir más cargado, porque tiene que dar la respuesta completa de una vez.
- Párrafos de cuerpo: 2-3 frases (~20-45 palabras). Una idea por párrafo.
- **Ningún párrafo de una sola frase.** Ese remate corto y aislado (tipo "La diferencia no es de grado, es de capacidad.") lee como AI slop. Todo párrafo necesita mínimo 2 frases — intégralo al párrafo anterior o siguiente, o dale una segunda frase real, no relleno.
- Dos excepciones: el cierre de CTA (pregunta en negrita + link) y una frase corta que termina en `:` e introduce una lista, tabla o cita (ej. "Lo que hace:", "Actúa en este orden, sin improvisar:"). Ninguna de las dos es prosa narrativa, así que no cuentan como "párrafo de una frase".
- Si una idea necesita más de ~5 frases o empieza a enumerar cosas paralelas ("primero... también... además..."), no alargues el párrafo: conviértelo en lista o pasa a un H3.

## Vocabulario

- Nunca "empleado virtual" para Luisa — siempre "agente de IA" o "Agentes IA".
- El positioning vende dos productos, no una lista de features: **Luisa IA** (el agente) + **Livvo Chat** (la plataforma/bandeja compartida). Casi todo CTA los menciona a ambos.
- "sobre la API oficial de WhatsApp Business" es el framing técnico recurrente para diferenciar de herramientas no oficiales.
