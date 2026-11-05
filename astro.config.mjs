import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Enlaces internos siempre con barra final (/agentes-ia → /agentes-ia/), para que ningún
// clic interno pase por la redirección 308 de trailingSlash. Respeta #ancla, ?query y
// archivos con extensión (.xml, .png, .txt…).
function internalLinksTrailingSlash() {
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.html') ? [join(dir, e.name)] : []
    );
  return {
    name: 'internal-links-trailing-slash',
    hooks: {
      'astro:build:done': ({ dir }) => {
        for (const file of walk(fileURLToPath(dir))) {
          const html = readFileSync(file, 'utf-8');
          const out = html.replace(
            /href="(\/(?!\/)[^"?#]*)([?#][^"]*)?"/g,
            (match, path, tail = '') => {
              if (path.endsWith('/') || /\.[a-z0-9]+$/i.test(path.split('/').pop())) return match;
              return `href="${path}/${tail}"`;
            }
          );
          if (out !== html) writeFileSync(file, out);
        }
      },
    },
  };
}

// lastmod de los posts, leído del frontmatter (updatedDate > pubDate).
const blogDates = Object.fromEntries(
  readdirSync('./src/content/blog')
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const fm = readFileSync(`./src/content/blog/${f}`, 'utf-8').split('---')[1] ?? '';
      const date = fm.match(/^updatedDate:\s*(\S+)/m)?.[1] ?? fm.match(/^pubDate:\s*(\S+)/m)?.[1];
      return [f.replace(/\.md$/, ''), date];
    })
);

export default defineConfig({
  site: 'https://livvo.tech',

  // Una sola forma de URL (con barra final): canonical y sitemap ya la usan; en Vercel
  // la redirección 308 de la otra forma la da "trailingSlash" en vercel.json.
  trailingSlash: 'always',

  // La URL vieja de Agentes IA; en Vercel el 308 real lo da vercel.json
  redirects: {
    '/empleados-ia': '/agentes-ia',
    '/blog/leads-portales-inmobiliarios-whatsapp-metrocuadrado-fincaraiz-ciencuadras':
      '/blog/leads-portales-inmobiliarios-whatsapp',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    react(),
    // Iconos Phosphor (@iconify-json/ph) inline en build, sin JS en runtime.
    // Una sola familia de iconos en el proyecto: no dibujar paths SVG a mano.
    icon(),
    internalLinksTrailingSlash(),
    sitemap({
      serialize(item) {
        const slug = item.url.match(/\/blog\/([^/]+)\/$/)?.[1];
        if (slug && blogDates[slug]) item.lastmod = new Date(blogDates[slug]).toISOString();
        return item;
      },
      filter: (page) => !page.includes('/design-system') && !page.includes('/presentacion'),
    }),
  ],
});