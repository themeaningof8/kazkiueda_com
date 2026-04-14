import GithubSlugger from 'github-slugger';

/** マークダウン見出し（`##`〜`######`）から組み立てた TOC ノード */
export interface TocNode {
  text: string;
  slug: string;
  children: TocNode[];
}

/**
 * 本文から `##`〜`######` を抽出し、`rehype-slug` と同様に `github-slugger` で slug 化したツリーを返す。
 * 階層は見出しレベルに従い、h2 をルート、h3 以降は親の子になる。
 */
export function tocFromMarkdownHeadings(body: string): TocNode[] {
  const slugger = new GithubSlugger();
  const roots: TocNode[] = [];
  const stack: { level: number; node: TocNode }[] = [];

  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    const m = /^(#{2,6})\s+(.+)$/.exec(trimmed);
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].trim();
    if (!text) continue;
    const slug = slugger.slug(text);
    const node: TocNode = { text, slug, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1].node.children.push(node);
    }
    stack.push({ level, node });
  }

  return roots;
}
