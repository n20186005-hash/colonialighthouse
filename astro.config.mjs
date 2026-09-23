import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://colonialighthouse.com',
  output: 'static',
  // Emit only the no-trailing-slash form (e.g. /es) to match the canonical
  // tags and every internal link; prevents GSC splitting /es and /es/.
  trailingSlash: 'never',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'zh', 'gn'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
