// Live tidal levels at the Colonia del Sacramento waterfront via Open-Meteo
// Marine Weather API (no API key required). The Río de la Plata is a tidal
// estuary fed by the Atlantic, so the shoreline rises and falls roughly twice
// a day. Front-facing copy stays neutral — no data-source or key wording.
import { attraction } from '../config';

export type TideTrend = 'rising' | 'falling' | 'flat';

export interface TideExtremum {
  time: string; // local ISO, e.g. 2026-09-23T14:00
  height: number; // metres relative to mean sea level
  type: 'high' | 'low';
}

export interface TidesData {
  current: { height: number; trend: TideTrend };
  nextHigh: TideExtremum | null;
  nextLow: TideExtremum | null;
  extrema: TideExtremum[];
}

export function buildTidesUrl(): string {
  const params = new URLSearchParams({
    latitude: String(attraction.latitude),
    longitude: String(attraction.longitude),
    hourly: 'sea_level_height_msl',
    timezone: 'auto',
    forecast_days: '2',
  });
  return `https://marine-api.open-meteo.com/v1/marine?${params.toString()}`;
}

export async function getTides(): Promise<TidesData | null> {
  try {
    const res = await fetch(buildTidesUrl());
    if (!res.ok) return null;
    const d = (await res.json()) as any;
    const times: string[] = d.hourly.time;
    const heights: number[] = d.hourly.sea_level_height_msl;
    if (!times || !heights || times.length === 0) return null;

    // Local maxima/minima of the hourly curve = high/low tides.
    const extrema: TideExtremum[] = [];
    for (let i = 1; i < heights.length - 1; i++) {
      const h = heights[i];
      if (h > heights[i - 1] && h >= heights[i + 1]) {
        extrema.push({ time: times[i], height: round2(h), type: 'high' });
      } else if (h < heights[i - 1] && h <= heights[i + 1]) {
        extrema.push({ time: times[i], height: round2(h), type: 'low' });
      }
    }

    const now = Date.now();
    let curIdx = 0;
    let best = Infinity;
    for (let i = 0; i < times.length; i++) {
      const diff = Math.abs(new Date(times[i]).getTime() - now);
      if (diff < best) { best = diff; curIdx = i; }
    }
    const curHeight = round2(heights[curIdx]);
    const next = heights[curIdx + 1] ?? heights[curIdx];
    const trend: TideTrend =
      next > heights[curIdx] ? 'rising' : next < heights[curIdx] ? 'falling' : 'flat';

    const curTime = times[curIdx];
    const future = extrema.filter((e) => e.time >= curTime);
    const nextHigh = future.find((e) => e.type === 'high') ?? null;
    const nextLow = future.find((e) => e.type === 'low') ?? null;

    return {
      current: { height: curHeight, trend },
      nextHigh,
      nextLow,
      extrema: future.slice(0, 6),
    };
  } catch {
    return null;
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
