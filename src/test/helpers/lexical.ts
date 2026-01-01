/**
 * Payload CMSのRich Textフィールド（Lexical）で使用するコンテンツを作成する
 * @param text 挿入するテキスト
 * @returns Lexical形式のコンテンツオブジェクト
 */
export function makeLexicalContent(text: string) {
  return {
    root: {
      type: "root",
      version: 1,
      format: "" as const,
      indent: 0,
      direction: "ltr" as const,
      children: [
        {
          type: "paragraph",
          version: 1,
          format: "" as const,
          indent: 0,
          direction: "ltr" as const,
          children: [
            {
              type: "text",
              version: 1,
              text,
              detail: 0,
              format: 0,
              mode: "normal" as const,
              style: "",
            },
          ],
        },
      ],
    },
  };
}
