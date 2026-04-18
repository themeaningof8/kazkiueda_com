/**
 * ケーススタディ左カラム目次用。UI は `TocNode` の木を想定。
 *
 * 見出しの `slug` / テキストは **`render(entry)` が返す `headings`** からだけ取る。
 * これは Astro が Markdown を処理した結果（`getHeadings()` と同系）なので、
 * 本文に `rehype-slug` が付与する `id` とズレにくい。
 *
 * @see https://docs.astro.build/en/reference/modules/astro-content/#render
 */

/** 左カラム目次の 1 ノード（`##`〜`######` の階層） */
export interface TocNode {
  text: string;
  slug: string;
  children: TocNode[];
}

/** `render()` / `getHeadings()` が返す見出しの最小形 */
type RenderHeading = {
  depth: number;
  slug: string;
  text: string;
};

/**
 * `render(entry).headings` を、h2 をルートとする `TocNode` の木に変換する。
 * depth 2〜6 のみ対象（h1 は目次に含めない）。
 */
export function tocTreeFromRenderHeadings(headings: readonly RenderHeading[]): TocNode[] {
  const flat = headings
    .filter((h) => h.depth >= 2 && h.depth <= 6)
    .map((h) => ({
      depth: h.depth,
      text: h.text.trim(),
      slug: h.slug,
    }))
    .filter((h) => h.text.length > 0);

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
