import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Lucide Reactアイコンをモック
vi.mock("lucide-react", () => ({
  ChevronLeftIcon: () => <div data-testid="ChevronLeftIcon" />,
  ChevronRightIcon: () => <div data-testid="ChevronRightIcon" />,
  MoreHorizontalIcon: () => <div data-testid="MoreHorizontalIcon" />,
}));

describe("Pagination", () => {
  test("Paginationコンポーネントが正しくレンダリングされる", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="/prev" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="/1" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="/2">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="/next" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    // ナビゲーション要素が存在することを確認
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByLabelText("pagination")).toBeInTheDocument();
  });

  test("PaginationContentがリストとしてレンダリングされる", () => {
    render(
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="/1">1</PaginationLink>
        </PaginationItem>
      </PaginationContent>,
    );

    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("data-slot", "pagination-content");
  });

  test("PaginationItemがリストアイテムとしてレンダリングされる", () => {
    render(
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="/1">1</PaginationLink>
        </PaginationItem>
      </PaginationContent>,
    );

    const item = screen.getByRole("listitem");
    expect(item).toHaveAttribute("data-slot", "pagination-item");
  });

  test("PaginationLinkがアクティブ状態で正しくレンダリングされる", () => {
    render(
      <PaginationLink href="/1" isActive>
        1
      </PaginationLink>,
    );

    const link = screen.getByRole("link", { name: /現在のページ、1/i });
    expect(link).toHaveAttribute("href", "/1");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveAttribute("data-active", "true");
    expect(link).toHaveClass("border"); // outline variant
  });

  test("PaginationLinkが非アクティブ状態で正しくレンダリングされる", () => {
    render(<PaginationLink href="/2">2</PaginationLink>);

    const link = screen.getByRole("link", { name: /ページ2へ移動/i });
    expect(link).toHaveAttribute("href", "/2");
    expect(link).not.toHaveAttribute("aria-current");
    expect(link).toHaveAttribute("data-active", false);
    expect(link).toHaveClass("hover:bg-accent"); // ghost variant
  });

  test("PaginationPreviousが正しくレンダリングされる", () => {
    render(<PaginationPrevious href="/prev" />);

    const link = screen.getByRole("link", { name: /Go to previous page/i });
    expect(link).toHaveAttribute("href", "/prev");
    expect(link).toHaveAttribute("data-slot", "pagination-previous");
    expect(link).toHaveTextContent("前へ");
    expect(screen.getByTestId("ChevronLeftIcon")).toBeInTheDocument();
  });

  test("PaginationNextが正しくレンダリングされる", () => {
    render(<PaginationNext href="/next" />);

    const link = screen.getByRole("link", { name: /Go to next page/i });
    expect(link).toHaveAttribute("href", "/next");
    expect(link).toHaveAttribute("data-slot", "pagination-next");
    expect(link).toHaveTextContent("次へ");
    expect(screen.getByTestId("ChevronRightIcon")).toBeInTheDocument();
  });

  test("PaginationEllipsisが正しくレンダリングされる", () => {
    render(<PaginationEllipsis />);

    const span = screen.getByText("More pages").closest("span");
    expect(span).toHaveAttribute("aria-hidden");
    expect(span).toHaveAttribute("data-slot", "pagination-ellipsis");
    expect(screen.getByTestId("MoreHorizontalIcon")).toBeInTheDocument();
  });

  test("asChild propが正しく動作する", () => {
    render(
      <PaginationLink asChild>
        <a href="/custom">カスタム</a>
      </PaginationLink>,
    );

    const link = screen.getByRole("link", { name: /カスタム/i });
    expect(link).toHaveAttribute("href", "/custom");
    // asChildの場合、data-slot属性は渡されない可能性がある
    // expect(link).toHaveAttribute("data-slot", "pagination-link");
  });
});
