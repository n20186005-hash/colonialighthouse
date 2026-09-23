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

// Single-entity SEO facts for the Colonia del Sacramento Lighthouse.
// These feed the TouristAttraction / BreadcrumbList structured data and the
// visible geographic breadcrumb. Keep all values factual and in sync.
export const attraction = {
  fullName: 'Colonia del Sacramento Lighthouse',
  fullNameEs: 'Faro de Colonia del Sacramento',
  shortName: 'Colonia Lighthouse',
  city: 'Colonia del Sacramento',
  stateProvince: 'Departamento de Colonia',
  country: 'Uruguay',
  countryCode: 'UY',
  postalCode: '70000',
  streetAddress: 'Calle de San Francisco, Barrio Histórico',
  latitude: -34.4578,
  longitude: -57.8443,
  mapsShareUrl: 'https://maps.app.goo.gl/eo5dSdxMzLinv3Qw6',
  mapsEmbedSrc: 'https://www.google.com/maps?q=Faro+de+Colonia+del+Sacramento&output=embed',
  govtTourismUrl: 'https://www.gub.uy/ministerio-turismo/',
  nearbyLandmark1: 'Calle de los Suspiros',
  nearbyLandmark2: 'Portón de Campo',
  ratingValue: 4.6,
  reviewCount: 8838,
};

export function attractionJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    '@id': `${siteConfig.baseUrl}/#attraction`,
    name: attraction.fullName,
    alternateName: [attraction.fullNameEs, attraction.shortName],
    description: `Complete visitor guide to the ${attraction.fullName} (${attraction.fullNameEs}), a 19th-century lighthouse built on 17th-century convent ruins in ${attraction.city}, ${attraction.stateProvince}, ${attraction.country}.`,
    url: siteConfig.baseUrl,
    image: [`${siteConfig.baseUrl}/images/hero.jpg`],
    address: {
      '@type': 'PostalAddress',
      streetAddress: attraction.streetAddress,
      addressLocality: attraction.city,
      addressRegion: attraction.stateProvince,
      postalCode: attraction.postalCode,
      addressCountry: attraction.countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: attraction.latitude,
      longitude: attraction.longitude,
    },
    hasMap: attraction.mapsShareUrl,
    sameAs: [
      attraction.mapsShareUrl,
      attraction.govtTourismUrl,
      'https://uruguaynatural.com/',
      'https://www.colonia.gub.uy/',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: attraction.ratingValue,
      reviewCount: attraction.reviewCount,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '10:30',
      closes: '17:30',
    },
  };
}

export function breadcrumbJsonLd(): object {
  const base = siteConfig.baseUrl;
  const item = (pos: number, name: string, url: string) => ({
    '@type': 'ListItem',
    position: pos,
    name,
    item: url,
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      item(1, attraction.fullName, base),
      item(2, attraction.city, base),
      item(3, attraction.stateProvince, base),
      item(4, attraction.country, base),
    ],
  };
}
