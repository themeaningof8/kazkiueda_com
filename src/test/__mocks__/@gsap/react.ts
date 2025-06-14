import { vi } from 'vitest';

export const useGSAP = vi.fn(callback => {
  // テスト環境では即座にcallbackを実行
  if (typeof callback === 'function') {
    callback();
  }
});
