import GithubSlugger from 'github-slugger';

export interface CaseStudyTocItem {
  text: string;
  slug: string;
}

export function tocFromMarkdownH2(body: string): CaseStudyTocItem[] {
  const slugger = new GithubSlugger();
  const items: CaseStudyTocItem[] = [];
  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    const m = /^##\s+(.+)$/.exec(trimmed);
    if (!m) continue;
    const text = m[1].trim();
    if (!text) continue;
    items.push({ text, slug: slugger.slug(text) });
  }
  return items;
}
