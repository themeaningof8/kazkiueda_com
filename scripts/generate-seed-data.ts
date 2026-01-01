import { faker } from '@faker-js/faker';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { makeLexicalContent } from '../src/test/helpers/lexical';

const POSTS_COUNT = 25;

type SeedPost = {
  title: string;
  slug: string;
  content: any;
  status: 'published' | 'draft';
  tags: { tag: string }[];
};

function generateSeedData() {
  const posts: SeedPost[] = Array.from({ length: POSTS_COUNT - 1 }, (_, i) => ({
    title: `Test Post ${i + 1}`,
    slug: `test-post-${i + 1}`,
    content: makeLexicalContent(faker.lorem.paragraphs(3)),
    status: 'published' as const,
    tags: [{ tag: 'test' }],
  }));

  // 最後に下書き投稿を追加
  posts.push({
    title: 'E2E Test Draft Post',
    slug: 'e2e-test-draft-post',
    content: makeLexicalContent('This is a draft post for E2E testing.'),
    status: 'draft' as const,
    tags: [{ tag: 'draft' }],
  });

  return {
    version: '1.0.0',
    users: [
      {
        email: 'e2e-admin@test.com',
        password: 'test-password',
        role: 'admin',
      }
    ],
    posts,
  };
}

async function main() {
  const seedData = generateSeedData();
  const outputPath = join(process.cwd(), 'tests/e2e/fixtures/seed-data.json');

  await writeFile(outputPath, JSON.stringify(seedData, null, 2));
  console.log(`✅ Generated seed data: ${outputPath}`);
}

main();