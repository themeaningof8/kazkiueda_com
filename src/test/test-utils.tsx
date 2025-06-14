import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';

// テスト用Provider統合（Context使用時の手間を削減）
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // 将来的にContext追加時はここに追加
  // 例: QueryClient, ThemeProvider, AuthProvider等

  return <div data-testid="test-provider-wrapper">{children}</div>;
};

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Testing Library の全機能をre-export + カスタムrender
export * from '@testing-library/react';
export { customRender as render };
export { default as userEvent } from '@testing-library/user-event';

// よく使用するMock工場関数
export const createMockComponent = (
  name: string,
  props?: Record<string, unknown>
) => {
  const MockComponent = ({
    children,
    ...otherProps
  }: {
    children?: React.ReactNode;
  }) => (
    <div
      data-testid={`mock-${name.toLowerCase()}`}
      data-props={JSON.stringify({ ...props, ...otherProps })}
    >
      {children}
    </div>
  );

  MockComponent.displayName = `Mock${name}`;
  return MockComponent;
};
