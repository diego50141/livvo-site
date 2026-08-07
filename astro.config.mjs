import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

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
    sitemap({
      filter: (page) =>
        !page.includes('/design-system') &&
        !page.includes('/presentacion') &&
        !page.includes('/herramientas/calculadora-roi'),
    }),
  ],
});