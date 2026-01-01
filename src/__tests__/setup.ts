import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";

// Next.js Image のモック（fillプロパティを除外、SSR不要のため通常のimgタグに変換）
vi.mock("next/image", () => ({
  default: ({ fill, ...props }: any) => {
    // fillプロパティはimgタグには存在しないため除外
    return React.createElement("img", props);
  },
}));

// Next.js Link のモック（通常のaタグに変換）
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => {
    return React.createElement("a", { href, ...props }, children);
  },
}));
