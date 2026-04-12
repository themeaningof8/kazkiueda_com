import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const caseStudies = defineCollection({
  loader: glob({ base: './src/content/case-studies', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      tags: z.array(z.string()),
      order: z.number().int(),
      preset: z.enum(['01', '02', '03', '04']),
      heroImage: image(),
      heroAlt: z.string(),
      roleBadge: z.string(),
      outcomeLabel: z.string(),
      outcomeTitle: z.string(),
      linkLabel: z.string().optional(),
    }),
});

export const collections = { caseStudies };
