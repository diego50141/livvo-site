const WORDS_PER_MINUTE = 200;

export function getReadingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function formatPostDate(date: Date): string {
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export const BLOG_PAGE_SIZE = 9;

// Páginas de etiqueta (/blog/etiqueta/<slug>/): solo para etiquetas con suficientes posts,
// para no publicar páginas delgadas.
export const MIN_POSTS_FOR_TAG_PAGE = 3;

export function tagSlug(tag: string): string {
  return tag
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function countTags(posts: { data: { tags: string[] } }[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of posts) for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return counts;
}

// Título (H1) y descripción propios de cada etiqueta; si falta, se usa una plantilla.
export const TAG_COPY: Record<string, { title: string; description: string }> = {
  'api de whatsapp': {
    title: 'API de WhatsApp para inmobiliarias',
    description:
      'Guías sobre la API oficial de WhatsApp Business para inmobiliarias: precios, bloqueos, plantillas y cómo operar a escala sin perder el número.',
  },
  'leads inmobiliarios': {
    title: 'Leads inmobiliarios',
    description:
      'Cómo captar, responder y dar seguimiento a leads inmobiliarios por WhatsApp: portales, tiempos de respuesta y calificación para agendar más visitas.',
  },
  'whatsapp business': {
    title: 'WhatsApp Business',
    description:
      'WhatsApp Business para inmobiliarias: app vs. API, calidad del número, coexistencia y buenas prácticas para atender clientes sin bloqueos.',
  },
  'agente de ia': {
    title: 'Agentes de IA',
    description:
      'Qué es un agente de IA, en qué se diferencia de un chatbot y cómo usarlo en una inmobiliaria para calificar leads y agendar visitas.',
  },
};
