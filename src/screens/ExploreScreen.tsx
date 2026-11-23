/* Wisp Wallet — Explore: searchable market list with live-ish prices,
 * trending / top movers tabs and a watchlist. All simulated balances. */

import { useMemo, useState } from 'react'
import { useNav } from '../nav'
import { effectiveChange24h, effectivePrice, isLivePrice, useTokens } from '../lib/engine'
import { useMarket } from '../lib/market'
import { compactMoney, pct, price as fmtPrice } from '../lib/format'
import { TokenIcon } from '../components/TokenIcon'
import { MarketChip, SearchBox, EmptyState } from '../components/common'
import { IconStar, IconStarFilled, IconInfo } from '../components/icons'

type ExploreTab = 'trending' | 'movers' | 'watchlist'

export function ExploreScreen() {
  const nav = useNav()
  const tokens = useTokens()
  const marketStatus = useMarket(s => s.status)
  const marketUpdated = useMarket(s => s.lastUpdated)
  const [tab, setTab] = useState<ExploreTab>('trending')
  const [search, setSearch] = useState('')
  const [watchlist, setWatchlist] = useState<Set<string>>(() => new Set(['solana', 'bitcoin', 'hyperliquid']))

  const rows = useMemo(() => {
    const priced = tokens.map(t => ({
      token: t,
      price: effectivePrice(t),
      change: effectiveChange24h(t),
      live: isLivePrice(t),
    }))
    const q = search.trim().toLowerCase()
    if (q) {
      return priced
        .filter(r => r.token.symbol.toLowerCase().includes(q) || r.token.name.toLowerCase().includes(q))
        .sort((a, b) => (b.token.marketCap ?? 0) - (a.token.marketCap ?? 0))
    }
    switch (tab) {
      case 'trending':
        return priced
          .filter(r => r.token.marketCap)
          .sort((a, b) => (b.token.marketCap ?? 0) - (a.token.marketCap ?? 0))
      case 'movers':
        return [...priced].sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      case 'watchlist':
        return priced.filter(r => watchlist.has(r.token.id))
    }
  }, [tokens, search, tab, watchlist])

  const toggleWatch = (id: string) => {
    setWatchlist(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="screen">
      <SearchBox value={search} onChange={setSearch} placeholder="Search the simulated market" />

      {!search ? (
        <div className="explore-tabs" role="tablist">
          {(['trending', 'movers', 'watchlist'] as const).map(t => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={tab === t ? 'selected' : ''}
              onClick={() => setTab(t)}
            >
              {t === 'trending' ? 'Top tokens' : t === 'movers' ? 'Movers' : 'Watchlist'}
            </button>
          ))}
        </div>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 8px' }}>
        <MarketChip status={marketStatus} lastUpdated={marketUpdated} compact />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
          <IconInfo width={12} height={12} />
          demo market
        </span>
      </div>

      <div className="asset-list" style={{ flexDirection: 'column', gap: 2 }}>
        {rows.length === 0 ? (
          <EmptyState
            title={tab === 'watchlist' ? 'Your watchlist is empty' : 'No matches'}
            body={tab === 'watchlist'
              ? 'Tap the star next to any token to keep an eye on its simulated price.'
              : 'Try a different search term — the simulated market covers the built-in catalog.'}
            icon={<IconStar />}
          />
        ) : rows.map((r, i) => (
          <div key={r.token.id} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!search ? (
              <span className="trend-row" style={{ width: 30, padding: 0, justifyContent: 'center' }}>
                <span className="t-rank">{i + 1}</span>
              </span>
            ) : null}
            <button className="trend-row" style={{ flex: 1 }} onClick={() => nav.openToken(r.token.id)}>
              <TokenIcon token={r.token} size={42} showChain />
              <span className="t-name">
                <span className="n">
                  {r.token.name}
                  {r.token.custom ? <span className="chip custom" style={{ fontSize: 10, padding: '1px 7px' }}>Custom</span> : null}
                </span>
                <span className="s">{r.token.symbol} · {compactMoney(r.token.marketCap ?? r.price * 1e6)}</span>
              </span>
              <span className="t-price">
                <span className="p num">{fmtPrice(r.price)}</span>
                <span className={`c ${r.change >= 0 ? 't-up' : 't-down'}`}>{pct(r.change)}</span>
              </span>
            </button>
            <button
              className={`watch-btn ${watchlist.has(r.token.id) ? 'on' : ''}`}
              onClick={() => toggleWatch(r.token.id)}
              aria-label={watchlist.has(r.token.id) ? `Remove ${r.token.symbol} from watchlist` : `Add ${r.token.symbol} to watchlist`}
              aria-pressed={watchlist.has(r.token.id)}
            >
              {watchlist.has(r.token.id) ? <IconStarFilled /> : <IconStar />}
            </button>
          </div>
        ))}
      </div>

      <p className="sheet-note" style={{ padding: '12px 22px 0' }}>
        Rankings and history here are part of the simulation. Live quotes, when
        available, come from the CoinGecko public API; everything else is a
        labelled reference snapshot.
      </p>
      <div style={{ height: 6 }} />
    </div>
  )
}
