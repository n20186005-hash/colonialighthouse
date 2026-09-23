// Real-time weather for the Colonia del Sacramento Lighthouse via Open-Meteo
// (no API key required). Used both at build time (server-side snapshot in the
// component) and at runtime by the Cloudflare Worker (/api/weather) which adds
// edge caching. Front-facing copy never mentions the data source or API keys.
import { attraction } from '../config';

export type Lang = 'es' | 'en' | 'zh' | 'gn';

// WMO weather code -> localized short description + glyph.
const WMO: Record<number, { es: string; en: string; zh: string; gn: string; icon: string }> = {
  0: { es: 'Despejado', en: 'Clear', zh: '晴朗', gn: 'Claro', icon: '☀️' },
  1: { es: 'Mayormente despejado', en: 'Mainly clear', zh: '晴间多云', gn: 'Oĩva claro', icon: '🌤️' },
  2: { es: 'Parcialmente nublado', en: 'Partly cloudy', zh: '局部多云', gn: 'Parcialmente nublado', icon: '⛅' },
  3: { es: 'Nublado', en: 'Overcast', zh: '阴', gn: 'Nublado', icon: '☁️' },
  45: { es: 'Niebla', en: 'Fog', zh: '雾', gn: 'Kaʼaru', icon: '🌫️' },
  48: { es: 'Niebla helada', en: 'Rime fog', zh: '雾凇', gn: 'Kaʼaru rupy', icon: '🌫️' },
  51: { es: 'Llovizna leve', en: 'Light drizzle', zh: '小毛毛雨', gn: 'Arapy mitã', icon: '🌦️' },
  53: { es: 'Llovizna', en: 'Drizzle', zh: '毛毛雨', gn: 'Arapy', icon: '🌦️' },
  55: { es: 'Llovizna densa', en: 'Dense drizzle', zh: '浓毛毛雨', gn: 'Arapy tuichakue', icon: '🌦️' },
  56: { es: 'Lluvia helada', en: 'Freezing drizzle', zh: '冻毛毛雨', gn: 'Arapy rupy', icon: '🌧️' },
  57: { es: 'Lluvia helada', en: 'Freezing drizzle', zh: '冻毛毛雨', gn: 'Arapy rupy', icon: '🌧️' },
  61: { es: 'Lluvia leve', en: 'Slight rain', zh: '小雨', gn: 'Arapy michĩ', icon: '🌧️' },
  63: { es: 'Lluvia moderada', en: 'Moderate rain', zh: '中雨', gn: 'Arapy', icon: '🌧️' },
  65: { es: 'Lluvia intensa', en: 'Heavy rain', zh: '大雨', gn: 'Arapy tuicha', icon: '🌧️' },
  66: { es: 'Lluvia helada', en: 'Freezing rain', zh: '冻雨', gn: 'Arapy rupy', icon: '🌧️' },
  67: { es: 'Lluvia helada', en: 'Freezing rain', zh: '冻雨', gn: 'Arapy rupy', icon: '🌧️' },
  71: { es: 'Nieve leve', en: 'Slight snow', zh: '小雪', gn: 'Yvu michĩ', icon: '🌨️' },
  73: { es: 'Nieve moderada', en: 'Moderate snow', zh: '中雪', gn: 'Yvu', icon: '🌨️' },
  75: { es: 'Nieve intensa', en: 'Heavy snow', zh: '大雪', gn: 'Yvu tuicha', icon: '🌨️' },
  77: { es: 'Granos de nieve', en: 'Snow grains', zh: '雪粒', gn: 'Yvu', icon: '🌨️' },
  80: { es: 'Chubascos leves', en: 'Slight showers', zh: '小阵雨', gn: 'Arapy', icon: '🌦️' },
  81: { es: 'Chubascos', en: 'Showers', zh: '阵雨', gn: 'Arapy', icon: '🌧️' },
  82: { es: 'Chubascos intensos', en: 'Violent showers', zh: '强阵雨', gn: 'Arapy tuicha', icon: '⛈️' },
  85: { es: 'Chubascos de nieve', en: 'Snow showers', zh: '阵雪', gn: 'Yvu', icon: '🌨️' },
  86: { es: 'Chubascos de nieve', en: 'Snow showers', zh: '阵雪', gn: 'Yvu', icon: '🌨️' },
  95: { es: 'Tormenta eléctrica', en: 'Thunderstorm', zh: '雷暴', gn: 'Arai', icon: '⛈️' },
  96: { es: 'Tormenta con granizo', en: 'Thunderstorm w/ hail', zh: '雷暴伴冰雹', gn: 'Arai', icon: '⛈️' },
  99: { es: 'Tormenta con granizo', en: 'Thunderstorm w/ hail', zh: '雷暴伴冰雹', gn: 'Arai', icon: '⛈️' },
};

export function wmo(code: number, lang: Lang): { desc: string; icon: string } {
  const m = WMO[code] ?? WMO[3];
  return { desc: m[lang], icon: m.icon };
}

export function buildWeatherUrl(): string {
  const params = new URLSearchParams({
    latitude: String(attraction.latitude),
    longitude: String(attraction.longitude),
    current: 'weather_code,temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation_probability',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max',
    timezone: 'auto',
    forecast_days: '7',
    wind_speed_unit: 'kmh',
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

// Localized advice library. Independent rules — each fires on its own
// condition and is pushed into the right bucket (outfit / plan / items /
// alert / risk). Visitor-facing, plain language, no data-source wording.
const ADVICE: Record<Lang, {
  cold: string; hot: string; layering: string; windy: string; mild: string;
  sunny: string; cloudy: string; rainPlan: string; slippery: string; noOutdoor: string;
  waterClose: string; foggy: string;
  umbrella: string; foldUmbrella: string; raincoat: string; sunItems: string; water: string; mask: string;
  stormAlert: string; windRisk: string; heavyRainRisk: string; fogRisk: string;
}> = {
  es: {
    cold: 'Temperaturas bajas: abrígate con capas, gorro y guantes; las mañanas y noches junto al Río de la Plata son frescas.',
    hot: 'Hace calor: ropa ligera, sombrero y protección solar; evita la exposición al mediodía.',
    layering: 'Gran diferencia entre el día y la noche: lleva una chaqueta ligera para abrigarte o quitarte según la hora.',
    windy: 'Viento notable: el paseo en barco por el río y algunas actividades al aire libre pueden suspenderse; el sombrero vuela, mejor sin falda amplia.',
    mild: 'Viste en capas ligeras; la costa cambia de temperatura a lo largo del día.',
    sunny: 'Cielo despejado: buen momento para subir al faro y recorrer el casco histórico; la luz es mejor al amanecer y al atardecer.',
    cloudy: 'Luz suave y sin sol fuerte: ideal para fotografiar el Barrio Histórico y caminar largas horas.',
    rainPlan: 'Si llueve, prioriza el interior del museo y una cafetería; la subida al faro puede cerrar.',
    slippery: 'Suelo mojado: camina con cuidado por las piedras y las murallas empedradas.',
    noOutdoor: 'No conviene estar al aire libre; el paseo en barco y el teleférico pueden estar fuera de servicio.',
    waterClose: 'Las actividades en el agua y la orilla del río probablemente cierran; no te metas al agua.',
    foggy: 'Visibilidad reducida: no es buen momento para subir al faro ni para ver el río.',
    umbrella: 'Lleva paraguas o impermeable: la lluvia es bastante probable hoy y en los próximos días.',
    foldUmbrella: 'Lleva un paraguas plegable: hay llovizna y el suelo está resbaladizo.',
    raincoat: 'Lleva impermeable (mejor que el paraguas largo con viento): la lluvia es intensa.',
    sunItems: 'Usa protector solar, gafas de sol y gorra; la radiación es fuerte.',
    water: 'Lleva agua, sobre todo en las rutas a pie por el Barrio Histórico.',
    mask: 'Lleva mascarilla si la niebla o el aire te molestan al caminar.',
    stormAlert: 'Precaución con los rayos: no subas al faro, no te metas al río ni te refugies bajo los árboles; las actividades acuáticas suelen cerrar.',
    windRisk: 'Viento fuerte: aléjate de carteles y de las rocas junto al río; las salidas al agua probablemente cierran.',
    heavyRainRisk: 'Lluvia intensa: evita las zonas bajas y la orilla del agua; el barco y el teleférico pueden suspenderse.',
    fogRisk: 'Visibilidad baja: el transbordador y los vuelos suelen retrasarse; no es buen momento para las vistas.',
  },
  en: {
    cold: 'Low temperatures: dress in warm layers, a hat and gloves; mornings and evenings by the Río de la Plata are cool.',
    hot: 'It is hot: light clothing, a hat and sun protection; avoid midday exposure.',
    layering: 'Big day-to-night swing: bring a light jacket you can add or remove as the hours change.',
    windy: 'Breezy: river boat trips and some open-air activities may be suspended; hats blow away, so skip the long flowy dress.',
    mild: 'Light layers work well; the riverside temperature shifts through the day.',
    sunny: 'Clear skies: a good time to climb the lighthouse and wander the old town; light is best at sunrise and sunset.',
    cloudy: 'Soft, glare-free light: ideal for photographing the Barrio Histórico and long walks.',
    rainPlan: 'If it rains, favour the museum interior and a café; the climb may close.',
    slippery: 'Wet ground: take care on the cobbles and stone ramparts.',
    noOutdoor: 'Better not to be outdoors; boat trips and the cable car may be out of service.',
    waterClose: 'Waterfront and in-water activities likely close; do not go into the river.',
    foggy: 'Poor visibility: not a good time to climb the lighthouse or view the river.',
    umbrella: 'Carry an umbrella or raincoat: rain is quite likely today and over the next few days.',
    foldUmbrella: 'Carry a folding umbrella: there is drizzle and the ground is slippery.',
    raincoat: 'Wear a raincoat (better than a long umbrella in wind): the rain is heavy.',
    sunItems: 'Use sunscreen, sunglasses and a cap; the UV is strong.',
    water: 'Carry water, especially on walking routes through the Barrio Histórico.',
    mask: 'Bring a mask if the fog or air bothers you while walking.',
    stormAlert: 'Lightning risk: do not climb the lighthouse, go into the river or shelter under trees; water activities usually close.',
    windRisk: 'Strong wind: stay away from signs and the rocks by the river; water outings likely close.',
    heavyRainRisk: 'Heavy rain: avoid low spots and the water\'s edge; boats and the cable car may be suspended.',
    fogRisk: 'Low visibility: the ferry and flights are often delayed; not a good time for the views.',
  },
  zh: {
    cold: '气温偏低：穿保暖分层衣物、戴帽与手套；拉普拉塔河畔清晨与夜晚转凉。',
    hot: '天气炎热：轻薄衣物、戴帽并做好防晒；正午尽量减少暴晒。',
    layering: '昼夜温差大：带一件外套，方便随时增减。',
    windy: '风力偏大：河边游船与部分露天项目可能停航；帽子易被吹落，不宜穿宽松长裙。',
    mild: '轻便分层穿搭即可；滨河气温在一天内起伏。',
    sunny: '天气晴好：适合登塔并漫步历史城区；清晨与傍晚光线最佳。',
    cloudy: '光线柔和、无强晒：很适合拍摄历史城区与长时间散步。',
    rainPlan: '若遇雨，优先参观博物馆室内与咖啡馆；登塔可能临时关闭。',
    slippery: '地面湿滑：在鹅卵石路与古城墙边行走请当心。',
    noOutdoor: '不宜在户外逗留；游船与缆车可能停运。',
    waterClose: '水上与临河活动大概率关闭，请勿下水。',
    foggy: '能见度差：不适合登塔，也不宜看河景。',
    umbrella: '请带雨伞或雨衣：今日及未来几天降雨概率较高。',
    foldUmbrella: '请带折叠伞：有毛毛雨，路面较滑。',
    raincoat: '穿雨衣（风大时优于长柄伞）：降雨较强。',
    sunItems: '使用防晒霜、墨镜与遮阳帽；紫外线较强。',
    water: '请带饮用水，尤其在历史城区步行时。',
    mask: '雾天或空气不适时，散步可戴口罩。',
    stormAlert: '谨防雷电：勿登塔、勿下河、勿在树下避雨；水上项目多会关闭。',
    windRisk: '大风天气：远离广告牌与河边礁石；水上项目大概率关闭。',
    heavyRainRisk: '降雨较强：避开低洼与临水处；游船缆车可能停运。',
    fogRisk: '能见度低：轮渡与航班易延误；不宜观景。',
  },
  gn: {
    cold: 'Ara roky: año rwake, gorro ha guante; ara pytu ha pyhare Río de la Plata peakedĩ.',
    hot: 'Ára hakú: año michĩ, gorro ha sol; ani oiko kuarahy mediodía.',
    layering: 'Ára oñemoambue: egueru ao michĩ oĩva emoambue hag̃ua.',
    windy: 'Yvytu hetave: barco ha actividad ikatu oñemboí; gorro opyta, ani ao puku.',
    mild: 'Año michĩ variado; ara oñemoambue ára jave.',
    sunny: 'Ára porã: iporã hupá ha guata Barrio Histórico; sol porã ama ha 17:00 rire.',
    cloudy: 'Ára hendy, sol ijyvu: iporã taʼanga ha pyaʼe.',
    rainPlan: 'Oky ramo, museo ha café; hupá ikatu oñemboí.',
    slippery: 'Calle mođói: cuidado calle itáva ha muralla.',
    noOutdoor: 'Ani oiko kaʼaguy: barco ha teleférico ikatu oñemboí.',
    waterClose: 'Y ha rire actividad oñemboí; ani oike y-pe.',
    foggy: 'Tavovéicha: ndahaʼéi iporã hupá térã hecha río.',
    umbrella: 'Egueru paraguas térã impermeable: arapy oikotava koʼága ha upeigua.',
    foldUmbrella: 'Egueru paraguas plegable: oĩ arapy mitã ha calle mođói.',
    raincoat: 'Egueru impermeable (iporãve paraguas yvytu): arapy tuicha.',
    sunItems: 'Eipurú sunscreen, goggles ha gorro; UV tuicha.',
    water: 'Egueru y, hade guata Barrio Histórico-pe.',
    mask: 'Egueru mascarilla oky ara térã aire.',
    stormAlert: 'Arai cuidado: ani hupá, ani y-pe, ani kaʼakupe; actividad y oñemboí.',
    windRisk: 'Yvytu tuicha: ani cartel ha ita rire; y actividad oñemboí.',
    heavyRainRisk: 'Arapy tuicha: ani ambue michĩ ha y; barco ha teleférico oñemboí.',
    fogRisk: 'Tavovéicha: transbordador ha vuelo oky; ndahaʼéi iporã hecha.',
  },
};

const STORM_CODES = new Set([95, 96, 99]);
const HEAVY_CODES = new Set([65, 82]); // heavy rain, violent showers
const LIGHT_RAIN = new Set([51, 53, 55, 56, 57, 61, 80]); // drizzle / slight rain / slight showers
const FOG_CODES = new Set([45, 48]);

// km/h -> Beaufort wind force, used for level-based advice (5-6, >=7).
export function kmhToBeaufort(kmh: number): number {
  const ms = kmh / 3.6;
  const steps = [0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7];
  let b = 0;
  for (let i = 0; i < steps.length; i++) if (ms >= steps[i]) b = i + 1;
  return b;
}

export interface DayForecast {
  date: string;
  code: number;
  desc: string;
  icon: string;
  tmax: number;
  tmin: number;
  precipProb: number;
  wind: number;
  uv: number;
}

export interface WeatherData {
  current: {
    code: number; desc: string; icon: string;
    temp: number; feels: number; humidity: number; wind: number; precipProb: number | null;
  };
  daily: DayForecast[];
  advice: { alert?: string[]; risk?: string[]; outfit: string[]; plan: string[]; items: string[] };
}

export async function getWeather(lang: Lang): Promise<WeatherData | null> {
  try {
    const res = await fetch(buildWeatherUrl());
    if (!res.ok) return null;
    const d = (await res.json()) as any;
    const cur = d.current;
    const current = {
      code: cur.weather_code as number,
      desc: wmo(cur.weather_code, lang).desc,
      icon: wmo(cur.weather_code, lang).icon,
      temp: Math.round(cur.temperature_2m),
      feels: Math.round(cur.apparent_temperature),
      humidity: Math.round(cur.relative_humidity_2m),
      wind: Math.round(cur.wind_speed_10m),
      precipProb: cur.precipitation_probability == null ? null : Math.round(cur.precipitation_probability),
    };
    const time: string[] = d.daily.time;
    const daily: DayForecast[] = time.map((date, i) => {
      const code = d.daily.weather_code[i] as number;
      const { desc, icon } = wmo(code, lang);
      return {
        date,
        code,
        desc,
        icon,
        tmax: Math.round(d.daily.temperature_2m_max[i]),
        tmin: Math.round(d.daily.temperature_2m_min[i]),
        precipProb: Math.round(d.daily.precipitation_probability_max[i]),
        wind: Math.round(d.daily.wind_speed_10m_max[i]),
        uv: Math.round(d.daily.uv_index_max[i]),
      };
    });

    const T = ADVICE[lang];
    const today = daily[0];
    const diff = today.tmax - today.tmin;
    const bf = kmhToBeaufort(current.wind);

    const hasStorm = STORM_CODES.has(current.code) || daily.some((x) => STORM_CODES.has(x.code));
    const isHeavy = HEAVY_CODES.has(current.code) || daily.some((x) => HEAVY_CODES.has(x.code));
    const isLight = LIGHT_RAIN.has(current.code);
    const isFog = FOG_CODES.has(current.code) || daily.some((x) => FOG_CODES.has(x.code));
    const nearPrecip = Math.max(current.precipProb ?? 0, ...daily.slice(0, 3).map((x) => x.precipProb));

    const advice: WeatherData['advice'] = { outfit: [], plan: [], items: [] };

    // Temperature -> outfit (each condition adds its own line; multi-select).
    if (today.tmax >= 32) advice.outfit.push(T.hot);
    if (today.tmin <= 10) advice.outfit.push(T.cold);
    if (diff > 8) advice.outfit.push(T.layering);
    if (advice.outfit.length === 0) advice.outfit.push(T.mild);

    // Wind -> outfit note or top risk by Beaufort level.
    if (bf >= 7) (advice.risk = advice.risk || []).push(T.windRisk);
    else if (bf >= 5) advice.outfit.push(T.windy);

    // Precip / storm / fog — risks are evaluated before generic plans.
    if (hasStorm) {
      advice.alert = [T.stormAlert];
      advice.plan.push(T.waterClose);
    } else if (isHeavy) {
      (advice.risk = advice.risk || []).push(T.heavyRainRisk);
      advice.items.push(T.raincoat);
      advice.plan.push(T.noOutdoor);
    } else if (isLight || nearPrecip >= 60) {
      if (isLight && nearPrecip < 60) {
        advice.items.push(T.foldUmbrella);
        advice.plan.push(T.slippery);
      } else {
        advice.items.push(T.umbrella);
        advice.plan.push(T.rainPlan);
      }
    }

    if (isFog) {
      (advice.risk = advice.risk || []).push(T.fogRisk);
      advice.plan.push(T.foggy);
      advice.items.push(T.mask);
    }

    // Calm / clear plan only when nothing disruptive is dominating.
    if (!hasStorm && !isHeavy && !isFog) {
      if (current.code === 0 || current.code === 1) advice.plan.push(T.sunny);
      else if (current.code === 2 || current.code === 3) advice.plan.push(T.cloudy);
    }

    // UV -> items.
    if ((today.uv ?? 0) >= 5 || current.temp >= 26) advice.items.push(T.sunItems);

    // Hydration is always sensible on a walking tour.
    advice.items.push(T.water);

    if (advice.plan.length === 0) advice.plan.push(T.cloudy);

    return { current, daily, advice };
  } catch {
    return null;
  }
}
