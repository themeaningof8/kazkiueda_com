"use client";

import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Component, type ReactNode } from "react";

interface RichTextRendererProps {
  data: SerializedEditorState | null | undefined;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class RichTextErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error("RichText rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          コンテンツの読み込みに失敗しました
        </div>
      );
    }

    return this.props.children;
  }
}

export function RichTextRenderer({ data }: RichTextRendererProps) {
  if (!data) {
    return null;
  }

  return (
    <RichTextErrorBoundary>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <RichText data={data} />
      </div>
    </RichTextErrorBoundary>
  );
}
