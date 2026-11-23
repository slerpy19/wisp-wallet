/* Wisp Wallet — pricing & portfolio engine.
 * Bridges the persisted wallet store with live quotes and the simulated
 * history generator. All price resolution goes through here so the UI, flows
 * and charts agree on what a token is worth. */

import { useMemo } from 'react'
import { useMarket } from './market'
import { tokenSeries, portfolioSeriesFrom, rangeChange, type Point } from './history'
import { activeAccountOf, useWisp } from './store'
import type { Account, ChartRange, Quote, TokenMeta, WispData } from './types'

/** Quote for a token if one is available (live only). */
export function quoteForToken(token: TokenMeta): Quote | undefined {
  if (!token.coingeckoId) return undefined
  const q = useMarket.getState().quotes[token.coingeckoId]
  return q?.live ? q : undefined
}

/** The price a token is displayed at right now. */
export function effectivePrice(token: TokenMeta): number {
  if (token.followMarket && token.coingeckoId) {
    const q = quoteForToken(token)
    if (q) return q.usd
    return token.basePrice
  }
  return token.customPrice
}

/** The 24h change a token is displayed at right now. */
export function effectiveChange24h(token: TokenMeta): number {
  if (token.followMarket && token.coingeckoId) {
    const q = quoteForToken(token)
    if (q) return q.change24h
  }
  return token.baseChange24h
}

/** Whether the displayed price is a live quote (vs snapshot or custom pin). */
export function isLivePrice(token: TokenMeta): boolean {
  return Boolean(
    token.followMarket && token.coingeckoId && quoteForToken(token),
  )
}

export function useActiveAccount(): Account {
  return useWisp(s => activeAccountOf(s.data))
}

export function useTokens(): TokenMeta[] {
  return useWisp(s => s.data.tokens)
}

export function useSettings() {
  return useWisp(s => s.data.settings)
}

export type PricedHolding = {
  token: TokenMeta
  qty: number
  price: number
  change24h: number
  value: number
  live: boolean
}

/** Ordered, visible holdings of the active account with live-ish pricing. */
export function usePricedHoldings(): PricedHolding[] {
  const account = useActiveAccount()
  const tokens = useTokens()
  const quotes = useMarket(s => s.quotes)
  return useMemo(() => {
    const byId = new Map(tokens.map(t => [t.id, t]))
    const out: PricedHolding[] = []
    const ordered = [
      ...account.order
        .map(id => byId.get(id))
        .filter((t): t is TokenMeta => Boolean(t)),
      ...account.holdings
        .map(h => byId.get(h.tokenId))
        .filter((t): t is TokenMeta => Boolean(t) && !account.order.includes((t as TokenMeta).id)),
    ]
    for (const token of ordered) {
      const holding = account.holdings.find(h => h.tokenId === token.id)
      if (!holding) continue
      const price = effectivePrice(token)
      out.push({
        token,
        qty: holding.qty,
        price,
        change24h: effectiveChange24h(token),
        value: price * holding.qty,
        live: isLivePrice(token),
      })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, tokens, quotes])
}

export function usePortfolio(): {
  total: number
  change24hUsd: number
  change24hPct: number
  holdings: PricedHolding[]
} {
  const holdings = usePricedHoldings()
  return useMemo(() => {
    const total = holdings.reduce((s, h) => s + h.value, 0)
    const base = holdings.reduce(
      (s, h) => s + h.value / (1 + h.change24h / 100),
      0,
    )
    const change24hUsd = total - base
    const change24hPct = base > 0 ? (change24hUsd / base) * 100 : 0
    return { total, change24hUsd, change24hPct, holdings }
  }, [holdings])
}

/** Simulated series for a token in a range (anchored to its current price). */
export function useTokenSeries(token: TokenMeta | undefined, range: ChartRange): Point[] {
  const quotes = useMarket(s => s.quotes)
  return useMemo(() => {
    if (!token) return []
    return tokenSeries(
      token,
      effectivePrice(token),
      range,
      effectiveChange24h(token),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token?.id, range, token?.followMarket, token?.customPrice, quotes, token?.basePrice, token?.volatility])
}

/** Simulated portfolio series for the active account in a range. */
export function usePortfolioSeries(range: ChartRange): Point[] {
  const holdings = usePricedHoldings()
  const quotes = useMarket(s => s.quotes)
  return useMemo(() => {
    const parts = holdings.map(h => ({
      series: tokenSeries(h.token, h.price, range, h.change24h),
      weight: h.qty,
    }))
    return portfolioSeriesFrom(parts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdings, range, quotes])
}

export function usePortfolioRangeChange(range: ChartRange): number {
  const series = usePortfolioSeries(range)
  return useMemo(() => rangeChange(series), [series])
}

export function findToken(data: WispData, id: string): TokenMeta | undefined {
  return data.tokens.find(t => t.id === id)
}
