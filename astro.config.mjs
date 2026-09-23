// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Demo static. La proiectul real catalogul trece pe SSR (VPS + Coolify),
// pentru că anunțurile se schimbă zilnic: vezi README-DEMO.md.
export default defineConfig({
  site: process.env.SITE_URL || 'https://demo.rtr.ro',
  base: process.env.SITE_BASE || '/',
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
  },
});
