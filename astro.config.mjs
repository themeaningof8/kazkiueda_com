// @ts-check
import { defineConfig, sessionDrivers } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Astro 6: default `static` supports on-demand routes via `prerender = false`.
  // Avoid auto-injected SESSION KV + Cloudflare Images bindings until needed.
  // In-memory per isolate (no KV). Good enough until password sessions are designed.
  session: { driver: sessionDrivers.lruCache() },
  adapter: cloudflare({ imageService: 'compile' }),
});