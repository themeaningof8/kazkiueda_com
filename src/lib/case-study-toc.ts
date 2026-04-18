import GithubSlugger from 'github-slugger';
import type { Heading, Root } from 'mdast';
import { toString } from 'mdast-util-to-string';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

/** マークダウン見出し（`##`〜`######`）から組み立てた TOC ノード */
export interface TocNode {
  text: string;
  slug: string;
  children: TocNode[];
}

type HeadingInfo = { depth: number; text: string; slug: string };

/**
 * 本文の mdast から `##`〜`######` を抽出し、`rehype-slug` と同様にプレーン見出しテキストを
 * `github-slugger` で slug 化したツリーを返す。
 * 階層は見出しレベルに従い、h2 をルート、h3 以降は親の子になる。
 */
export function tocFromMarkdownHeadings(body: string): TocNode[] {
  const tree = unified().use(remarkParse).parse(body) as Root;
  const slugger = new GithubSlugger();
  const flat: HeadingInfo[] = [];

  visit(tree, 'heading', (node: Heading) => {
    if (node.depth < 2 || node.depth > 6) return;
    const text = toString(node).trim();
    if (!text) return;
    const slug = slugger.slug(text);
    flat.push({ depth: node.depth, text, slug });
  });

  const roots: TocNode[] = [];
  const stack: { level: number; node: TocNode }[] = [];

  for (const { depth, text, slug } of flat) {
    const node: TocNode = { text, slug, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= depth) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1].node.children.push(node);
    }

    stack.push({ level: depth, node });
  }

  return roots;
}
