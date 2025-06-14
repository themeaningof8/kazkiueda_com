import { defineCollection, z } from 'astro:content';

// 記事コレクション（ブログ・技術記事）
const articles = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().default('Kaz Kiueda'),
      tags: z.array(z.string()).default([]),
      category: z
        .enum(['tech', 'design', 'thought', 'tutorial'])
        .default('tech'),
      coverImage: image().optional(),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      excerpt: z.string().optional(),
    }),
});

// ポートフォリオコレクション
const portfolio = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      projectDate: z.coerce.date(),
      completedDate: z.coerce.date().optional(),
      client: z.string().optional(),
      role: z.array(z.string()).default([]),
      technologies: z.array(z.string()).default([]),
      category: z
        .enum(['web', 'mobile', 'design', 'api', 'other'])
        .default('web'),
      status: z.enum(['completed', 'ongoing', 'archived']).default('completed'),
      coverImage: image().optional(),
      gallery: z.array(image()).optional(),
      githubUrl: z.string().url().optional(),
      liveUrl: z.string().url().optional(),
      featured: z.boolean().default(false),
      order: z.number().optional(),
    }),
});

// 著者情報（将来的な拡張用）
const authors = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    bio: z.string(),
    avatar: z.string().optional(),
    social: z
      .object({
        twitter: z.string().url().optional(),
        github: z.string().url().optional(),
        linkedin: z.string().url().optional(),
        website: z.string().url().optional(),
      })
      .optional(),
  }),
});

export const collections = {
  articles,
  portfolio,
  authors,
};
