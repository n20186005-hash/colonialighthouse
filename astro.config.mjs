import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://colonialighthouse.com',
  output: 'static',
  // Emit the trailing-slash form (e.g. /es/) consistently and 301-redirect
  // the no-slash variant, so GSC stops splitting /es and /es/.
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'zh', 'gn'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es', en: 'en', zh: 'zh', gn: 'gn' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
