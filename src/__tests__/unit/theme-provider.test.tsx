import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ThemeProvider } from "@/components/theme-provider";

// next-themesのThemeProviderをモック
vi.mock("next-themes", () => ({
  ThemeProvider: vi.fn(({ children, ...props }) => (
    <div data-testid="next-themes-provider" data-props={JSON.stringify(props)}>
      {children}
    </div>
  )),
}));

describe("ThemeProvider", () => {
  test("childrenが正しくレンダリングされる", () => {
    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  test("propsがnext-themesのThemeProviderに正しく渡される", () => {
    const mockProps = {
      defaultTheme: "light",
      enableSystem: true,
      disableTransitionOnChange: true,
    };

    render(
      <ThemeProvider {...mockProps}>
        <div>Content</div>
      </ThemeProvider>,
    );

    const provider = screen.getByTestId("next-themes-provider");
    const passedProps = JSON.parse(provider.getAttribute("data-props") || "{}");

    expect(passedProps).toEqual(mockProps);
  });

  test("デフォルトpropsが適用される", () => {
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>,
    );

    const provider = screen.getByTestId("next-themes-provider");
    const passedProps = JSON.parse(provider.getAttribute("data-props") || "{}");

    // next-themesのデフォルトpropsが適用されていることを確認
    expect(passedProps).toEqual({});
  });
});
