import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import { readFileSync, readdirSync } from 'node:fs';

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

  // La URL vieja de Agentes IA; en Vercel el 308 real lo da vercel.json
  redirects: {
    '/empleados-ia': '/agentes-ia',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    react(),
    // Iconos Phosphor (@iconify-json/ph) inline en build, sin JS en runtime.
    // Una sola familia de iconos en el proyecto: no dibujar paths SVG a mano.
    icon(),
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