/* Wisp Wallet — display formatting helpers. */

import type { Currency, Settings, TokenMeta } from './types'

export const FX: Record<Currency, number> = { USD: 1, EUR: 0.92, GBP: 0.79 }
export const CURRENCY_SYMBOL: Record<Currency, string> = { USD: '$', EUR: '€', GBP: '£' }

const nf = (min: number, max: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: min, maximumFractionDigits: max })

const nfInt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/** $1.23M · $45.6B style compact money. */
export function compactMoney(usd: number): string {
  const abs = Math.abs(usd)
  if (abs >= 1e12) return `${sign(usd)}$${nf(1, 2).format(usd / 1e12)}T`
  if (abs >= 1e9) return `${sign(usd)}$${nf(1, 2).format(usd / 1e9)}B`
  if (abs >= 1e6) return `${sign(usd)}$${nf(1, 2).format(usd / 1e6)}M`
  if (abs >= 1e3) return `${sign(usd)}$${nf(1, 1).format(usd / 1e3)}K`
  return money(usd)
}

const sign = (n: number) => (n < 0 ? '-' : '')

export function money(usd: number, currency: Currency = 'USD'): string {
  const value = usd * FX[currency]
  const abs = Math.abs(value)
  const sym = CURRENCY_SYMBOL[currency]
  if (abs === 0) return `${sym}0.00`
  if (abs < 0.01) return `${sign(value)}${sym}${value.toFixed(6)}`
  if (abs >= 1000) return `${sign(value)}${sym}${nf(2, 2).format(value)}`
  return `${sign(value)}${sym}${nf(2, 2).format(value)}`
}

/** Token quantity formatting: trims to meaningful precision. */
export function qty(n: number, mode: Settings['qtyDecimals'] = 'auto'): string {
  if (!Number.isFinite(n)) return '0'
  const abs = Math.abs(n)
  if (mode !== 'auto') return nf(mode, mode).format(n)
  if (abs === 0) return '0'
  if (abs >= 1e6) return nfInt.format(n)
  if (abs >= 1000) return nf(2, 4).format(n)
  if (abs >= 1) return nf(2, 4).format(n)
  if (abs >= 0.001) return nf(3, 6).format(n)
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 9 }).format(n)
}

/** Unit price formatting: small prices get more precision. */
export function price(usd: number, currency: Currency = 'USD'): string {
  const value = usd * FX[currency]
  const abs = Math.abs(value)
  const sym = CURRENCY_SYMBOL[currency]
  if (abs === 0) return `${sym}0`
  if (abs < 0.0001) return `${sign(value)}${sym}${value.toPrecision(3)}`
  if (abs < 0.01) return `${sign(value)}${sym}${value.toFixed(6)}`
  if (abs < 1) return `${sign(value)}${sym}${value.toFixed(4)}`
  if (abs < 1000) return `${sign(value)}${sym}${nf(2, 2).format(value)}`
  return `${sign(value)}${sym}${nf(2, 2).format(value)}`
}

export function pct(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '0%'
  return `${sign(n)}${Math.abs(n).toFixed(digits)}%`
}

export function signedMoney(usd: number, currency: Currency = 'USD'): string {
  const m = money(Math.abs(usd), currency)
  return `${usd < 0 ? '-' : '+'}${m}`
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function timeOfDay(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false })
}

/** True when the token's quoted price follows live data. */
export function isLiveToken(t: TokenMeta): boolean {
  return Boolean(t.coingeckoId)
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.eE+-]/g, '')
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}
