import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

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
      filter: (page) =>
        !page.includes('/design-system') &&
        !page.includes('/presentacion') &&
        !page.includes('/herramientas/calculadora-roi'),
    }),
  ],
});