// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://vsfurnitures.in',
  // Sitemap is hand-maintained at public/sitemap.xml (it carries per-page
  // <lastmod> dates that the auto-generated one lacks). When adding a new
  // page, add its URL there too.
  integrations: [react()],
});