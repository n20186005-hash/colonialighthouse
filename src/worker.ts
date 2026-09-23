// Cloudflare Worker entry for static-assets deployment + cached live data.
// Serves the prebuilt `dist/` assets and proxies live weather and tides from
// Open-Meteo with edge caching (Cache API). Manual deploy: `wrangler deploy`.
import { getWeather } from './lib/weather';
import { getTides } from './lib/tides';

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === '/api/weather') {
      const lang = (url.searchParams.get('lang') || 'es') as 'es' | 'en' | 'zh' | 'gn' | 'pt';
      const cache = caches.default;
      const cacheKey = new Request(`https://cache.local/api/weather?lang=${lang}`);

      let res = await cache.match(cacheKey);
      if (!res) {
        const data = await getWeather(lang);
        res = new Response(JSON.stringify(data), {
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'public, max-age=600',
          },
        });
        await cache.put(cacheKey, res.clone());
      }
      return res;
    }

    if (url.pathname === '/api/tides') {
      const cache = caches.default;
      const cacheKey = new Request('https://cache.local/api/tides');

      let res = await cache.match(cacheKey);
      if (!res) {
        const data = await getTides();
        res = new Response(JSON.stringify(data), {
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'public, max-age=1800',
          },
        });
        await cache.put(cacheKey, res.clone());
      }
      return res;
    }

    return env.ASSETS.fetch(req);
  },
};
