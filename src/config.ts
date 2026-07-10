export const siteConfig = {
  name: 'Colonia del Sacramento Lighthouse',
  baseUrl: 'https://colonialighthouse.com',
  locales: ['es', 'en', 'zh', 'gn'] as const,
};

export const ogLocale: Record<string, string> = {
  es: 'es_ES',
  en: 'en_US',
  zh: 'zh_CN',
  gn: 'gn',
};
