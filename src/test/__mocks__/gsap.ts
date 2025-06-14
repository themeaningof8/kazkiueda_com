import { vi } from 'vitest';

const gsapMock = {
  to: vi.fn().mockReturnValue({ kill: vi.fn() }),
  from: vi.fn().mockReturnValue({ kill: vi.fn() }),
  set: vi.fn(),
  timeline: vi.fn().mockReturnValue({
    to: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    kill: vi.fn(),
  }),
  registerPlugin: vi.fn(),
};

export const gsap = gsapMock;
export default gsapMock;
