import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum([
      'IA para inmobiliarias',
      'Gestión de leads y WhatsApp',
      'Plataforma de atención al cliente',
      'Guías y casos de uso',
      'Actualidad del sector',
    ]),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Equipo Livvo'),
    featured: z.boolean().default(false),
    faq: z
      .array(
        z.object({
          q: z.string(),
          a: z.string(),
        })
      )
      .default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
