/* Wisp Wallet — live market quotes.
 * Uses the CoinGecko public API (no key). Quotes are cached in memory +
 * localStorage; failures degrade to the labelled reference snapshot instead of
 * inventing data. Custom (user-created) tokens never use live quotes. */

import { create } from 'zustand'
import type { MarketState, Quote } from './types'

const API = 'https://api.coingecko.com/api/v3'
export const REFRESH_MS = 60_000
const CACHE_KEY = 'wisp.quotes.v1'
const CACHE_TTL = 24 * 60 * 60_000 // keep last good quotes for a day
const TIMEOUT_MS = 9_000

type CachedQuotes = { ts: number; quotes: Record<string, Quote> }

function loadCache(): CachedQuotes | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedQuotes
    if (!parsed || typeof parsed.ts !== 'number' || !parsed.quotes) return null
    if (Date.now() - parsed.ts > CACHE_TTL) return null
    return parsed
  } catch {
    return null
  }
}

function saveCache(q: Record<string, Quote>, ts: number): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts, quotes: q } satisfies CachedQuotes))
  } catch {
    /* storage full or unavailable — memory cache still applies */
  }
}

export const useMarket = create<MarketState & {
  fetchQuotes: (ids: string[], liveEnabled: boolean) => Promise<boolean>
  mergeQuotes: (q: Record<string, Quote>, live: boolean) => void
  _timer: ReturnType<typeof setInterval> | null
  _inflight: Map<string, Promise<boolean>>
  startPolling: (getIds: () => string[], liveEnabled: () => boolean) => void
  stopPolling: () => void
}>((set, get) => ({
  quotes: {},
  status: 'idle',
  lastUpdated: null,
  _timer: null,
  _inflight: new Map(),

  mergeQuotes: (q, live) => {
    if (!live) return
    const ts = Date.now()
    set(state => ({
      quotes: { ...state.quotes, ...q },
      status: 'live',
      lastUpdated: ts,
    }))
    saveCache({ ...get().quotes }, ts)
  },

  fetchQuotes: async (ids, liveEnabled) => {
    const unique = [...new Set(ids)].filter(Boolean)
    if (unique.length === 0 || !liveEnabled) return false

    // coalesce duplicate concurrent requests for the same id set
    const inflightKey = unique.slice().sort().join(',')
    const existing = get()._inflight.get(inflightKey)
    if (existing) return existing

    set(state => (state.status === 'live' || state.status === 'stale' ? state : { status: 'loading' }))
    const promise = (async () => {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
      try {
        const url = `${API}/simple/price?ids=${encodeURIComponent(unique.join(','))}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
        const res = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json' } })
        clearTimeout(timer)
        if (!res.ok) {
          set({ status: get().quotes && Object.keys(get().quotes).length ? 'stale' : 'error' })
          return false
        }
        const data = (await res.json()) as Record<
          string,
          { usd: number; usd_24h_change?: number; usd_market_cap?: number }
        >
        const q: Record<string, Quote> = {}
        for (const [id, d] of Object.entries(data)) {
          if (!d || !Number.isFinite(d.usd) || d.usd <= 0) continue
          q[id] = {
            usd: d.usd,
            change24h: Number.isFinite(d.usd_24h_change) ? (d.usd_24h_change as number) : 0,
            ts: Date.now(),
            live: true,
          }
        }
        if (Object.keys(q).length === 0) {
          set({ status: Object.keys(get().quotes).length ? 'stale' : 'error' })
          return false
        }
        get().mergeQuotes(q, true)
        return true
      } catch {
        const had = Object.keys(get().quotes).length > 0
        set({ status: had ? 'stale' : 'error' })
        return false
      } finally {
        get()._inflight.delete(inflightKey)
      }
    })()
    get()._inflight.set(inflightKey, promise)
    return promise
  },

  startPolling: (getIds, liveEnabled) => {
    // hydrate from cache first so the UI has something honest to show
    const cached = loadCache()
    if (cached) {
      set({ quotes: cached.quotes, lastUpdated: cached.ts, status: 'stale' })
    }
    const tick = () => {
      if (document.visibilityState === 'visible' && liveEnabled()) {
        void get().fetchQuotes(getIds(), true)
      }
    }
    tick()
    const timer = setInterval(tick, REFRESH_MS)
    document.addEventListener('visibilitychange', tick)
    set({ _timer: timer })
  },

  stopPolling: () => {
    const timer = get()._timer
    if (timer) clearInterval(timer)
    set({ _timer: null })
  },
}))

/** Current effective quote for a catalog id. */
export function quoteFor(state: MarketState, id: string | undefined): Quote | undefined {
  if (!id) return undefined
  return state.quotes[id]
}
