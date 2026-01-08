import { describe, expect, test } from "vitest";
import { makeLexicalContent } from "@/test/helpers/lexical";

describe("makeLexicalContent", () => {
  test("基本的なテキストをLexicalコンテンツに変換", () => {
    const result = makeLexicalContent("Hello World");

    expect(result).toEqual({
      root: {
        type: "root",
        version: 1,
        format: "",
        indent: 0,
        direction: "ltr",
        children: [
          {
            type: "paragraph",
            version: 1,
            format: "",
            indent: 0,
            direction: "ltr",
            children: [
              {
                type: "text",
                version: 1,
                text: "Hello World",
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
              },
            ],
          },
        ],
      },
    });
  });

  test("空文字列をLexicalコンテンツに変換", () => {
    const result = makeLexicalContent("");

    expect(result.root.children[0].children[0].text).toBe("");
  });

  test("特殊文字を含むテキストを正しく変換", () => {
    const specialText = "Hello 世界! @#$%^&*()";
    const result = makeLexicalContent(specialText);

    expect(result.root.children[0].children[0].text).toBe(specialText);
  });

  test("改行やタブを含むテキストを正しく変換", () => {
    const multilineText = "Line 1\nLine 2\tTabbed";
    const result = makeLexicalContent(multilineText);

    expect(result.root.children[0].children[0].text).toBe(multilineText);
  });

  test("返されるオブジェクトの構造が正しい", () => {
    const result = makeLexicalContent("test");

    // root構造の検証
    expect(result).toHaveProperty("root");
    expect(result.root).toHaveProperty("type", "root");
    expect(result.root).toHaveProperty("version", 1);
    expect(result.root).toHaveProperty("children");
    expect(Array.isArray(result.root.children)).toBe(true);

    // paragraph構造の検証
    const paragraph = result.root.children[0];
    expect(paragraph).toHaveProperty("type", "paragraph");
    expect(paragraph).toHaveProperty("version", 1);
    expect(paragraph).toHaveProperty("children");
    expect(Array.isArray(paragraph.children)).toBe(true);

    // text node構造の検証
    const textNode = paragraph.children[0];
    expect(textNode).toHaveProperty("type", "text");
    expect(textNode).toHaveProperty("version", 1);
    expect(textNode).toHaveProperty("text", "test");
    expect(textNode).toHaveProperty("detail", 0);
    expect(textNode).toHaveProperty("format", 0);
    expect(textNode).toHaveProperty("mode", "normal");
    expect(textNode).toHaveProperty("style", "");
  });
});
