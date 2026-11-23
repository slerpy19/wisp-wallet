/* Wisp Wallet — deterministic, clearly-simulated chart history.
 * Series are anchored to the current price, use each token's real 24h change
 * for the 1D range so short-term moves agree with market data, and are a
 * seeded random walk elsewhere. Nothing here is real market history. */

import type { ChartRange, TokenMeta } from './types'

export type Point = { t: number; v: number }

const RANGE_POINTS: Record<ChartRange, number> = {
  '1H': 60,
  '1D': 96,
  '1W': 112,
  '1M': 120,
  '1Y': 156,
  ALL: 160,
}

const RANGE_MS: Record<ChartRange, number> = {
  '1H': 60 * 60_000,
  '1D': 24 * 60 * 60_000,
  '1W': 7 * 24 * 60 * 60_000,
  '1M': 30 * 24 * 60 * 60_000,
  '1Y': 365 * 24 * 60 * 60_000,
  ALL: 730 * 24 * 60 * 60_000,
}

function seedFrom(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

/** Mulberry32 — tiny seeded PRNG for reproducible series. */
function prng(seed: number): () => number {
  let a = seed * 4294967296
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Build a simulated series ending at `endValue`.
 * `drift` is the total fractional change across the window (e.g. the real 24h
 * change when range is 1D); the path itself is a seeded random walk.
 */
export function simulateSeries(
  key: string,
  endValue: number,
  range: ChartRange,
  volatility: number,
  drift: number,
): Point[] {
  const n = RANGE_POINTS[range]
  const rnd = prng(seedFrom(`${key}:${range}`) * 1e6 + 7)
  const stepVol = volatility / Math.sqrt(RANGE_POINTS['1D'])
  const now = Date.now()
  const dt = RANGE_MS[range] / (n - 1)

  // walk backwards from the end, then renormalize so the path ends exactly at endValue
  const values = new Array<number>(n)
  values[n - 1] = 1
  for (let i = n - 2; i >= 0; i--) {
    const shock = (rnd() * 2 - 1) * stepVol * 2.2
    const pull = (rnd() - 0.5) * stepVol
    values[i] = values[i + 1] / (1 + shock + pull)
  }
  const scale = endValue / values[n - 1]
  const startTarget = endValue / (1 + drift)
  const wobble = 1 + (rnd() - 0.5) * 0.12
  const startScale = (startTarget / (values[0] * scale)) * wobble
  const t0 = now - (n - 1) * dt
  return values.map((v, i) => {
    // blend renormalization so the walk keeps character but hits both anchors
    const mix = i / (n - 1)
    const adj = 1 + (startScale - 1) * (1 - mix)
    return { t: t0 + i * dt, v: v * scale * adj }
  })
}

/** Simulated series for one token in one range. */
export function tokenSeries(
  token: TokenMeta,
  endPrice: number,
  range: ChartRange,
  change24h: number,
): Point[] {
  const drift = range === '1D' ? change24h / 100 : driftForRange(range, token.volatility, change24h)
  return simulateSeries(token.id, endPrice, range, token.volatility, drift)
}

function driftForRange(range: ChartRange, vol: number, change24h: number): number {
  const rnd = prng(seedFrom(`drift:${range}`) * 1e6 + 3)
  const biased = (change24h / 100) * 0.35
  const noise = (rnd() * 2 - 1) * vol
  switch (range) {
    case '1W': return (biased + noise * 2.1) * 1
    case '1M': return (biased + noise * 3.2) * 1
    case '1Y': return (0.18 + noise * 2.6) * 1
    case 'ALL': return (0.85 + noise * 3.4) * 1
    default: return change24h / 100
  }
}

/** Sum of token series weighted by quantities → portfolio series. */
export function portfolioSeriesFrom(
  parts: Array<{ series: Point[]; weight: number }>,
): Point[] {
  if (parts.length === 0) return []
  const base = parts[0].series
  const out: Point[] = []
  for (let i = 0; i < base.length; i++) {
    let v = 0
    for (const p of parts) v += (p.series[i]?.v ?? 0) * p.weight
    out.push({ t: base[i].t, v })
  }
  return out
}

export function rangeChange(series: Point[]): number {
  if (series.length < 2) return 0
  const first = series[0].v
  const last = series[series.length - 1].v
  if (!Number.isFinite(first) || first === 0) return 0
  return ((last - first) / Math.abs(first)) * 100
}
