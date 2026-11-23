/* Wisp Wallet — Explore: Phantom-style trending cards. Trending Tokens shows
 * live-ish prices with a watchlist; Trending Sites is a labelled demo list.
 * All simulated balances. */

import { useMemo, useState } from 'react'
import { useNav } from '../nav'
import { effectiveChange24h, effectivePrice, isLivePrice, useTokens } from '../lib/engine'
import { useMarket } from '../lib/market'
import { compactMoney, pct, price as fmtPrice } from '../lib/format'
import { TokenIcon } from '../components/TokenIcon'
import { MarketChip, SectionHead, EmptyState } from '../components/common'
import { IconStar, IconStarFilled, IconArrowUpRight, IconInfo } from '../components/icons'

type ExploreTab = 'trending' | 'movers' | 'watchlist'

/* demo site directory — decorative entries that match the real Explore tab */
const TRENDING_SITES = [
  { rank: 1, name: 'Jupiter', cat: 'DeFi', emoji: '🪐' },
  { rank: 2, name: 'Raydium', cat: 'DeFi', emoji: '🟣' },
  { rank: 3, name: 'pump.fun', cat: 'DeFi', emoji: '💊' },
]

export function ExploreScreen() {
  const nav = useNav()
  const tokens = useTokens()
  const marketStatus = useMarket(s => s.status)
  const marketUpdated = useMarket(s => s.lastUpdated)
  const [tab, setTab] = useState<ExploreTab>('trending')
  const [watchlist, setWatchlist] = useState<Set<string>>(() => new Set(['solana', 'bitcoin', 'hyperliquid']))

  const rows = useMemo(() => {
    const priced = tokens.map(t => ({
      token: t,
      price: effectivePrice(t),
      change: effectiveChange24h(t),
      live: isLivePrice(t),
    }))
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
  }, [tokens, tab, watchlist])

  const toggleWatch = (id: string) => {
    setWatchlist(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const tabLabel = (t: ExploreTab) => (t === 'trending' ? 'Top Tokens' : t === 'movers' ? 'Movers' : 'Watchlist')

  return (
    <div className="screen">
      <div className="explore-tabs" role="tablist">
        {(['trending', 'movers', 'watchlist'] as const).map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? 'selected' : ''}
            onClick={() => setTab(t)}
          >
            {tabLabel(t)}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 4px' }}>
        <MarketChip status={marketStatus} lastUpdated={marketUpdated} compact />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
          <IconInfo width={12} height={12} />
          demo market
        </span>
      </div>

      <SectionHead title="Trending Tokens" />
      <div className="trend-card">
        {rows.length === 0 ? (
          <EmptyState
            title={tab === 'watchlist' ? 'Your watchlist is empty' : 'No matches'}
            body={tab === 'watchlist'
              ? 'Tap the star next to any token to keep an eye on its simulated price.'
              : 'Try a different tab — the simulated market covers the built-in catalog.'}
            icon={<IconStar />}
          />
        ) : rows.map((r, i) => (
          <div key={r.token.id} style={{ display: 'flex', alignItems: 'center' }}>
            <span className="trend-row" style={{ width: 34, padding: 0, justifyContent: 'center', flex: 'none' }}>
              <span className="t-rank">{i + 1}</span>
            </span>
            <button className="trend-row" style={{ flex: 1 }} onClick={() => nav.openToken(r.token.id)}>
              <TokenIcon token={r.token} size={42} showChain />
              <span className="t-name">
                <span className="n">
                  {r.token.symbol}
                  {r.token.custom ? <span className="chip custom" style={{ fontSize: 10, padding: '1px 7px' }}>Custom</span> : null}
                </span>
                <span className="s">{compactMoney(r.token.marketCap ?? r.price * 1e6)}</span>
              </span>
              <span className="t-price">
                <span className="p num">{fmtPrice(r.price)}</span>
                <span className={`c ${r.change >= 0 ? 't-up' : 't-down'}`}>{pct(r.change)}</span>
              </span>
            </button>
            <button
              className={`watch-btn ${watchlist.has(r.token.id) ? 'on' : ''}`}
              style={{ margin: '0 10px 0 4px' }}
              onClick={() => toggleWatch(r.token.id)}
              aria-label={watchlist.has(r.token.id) ? `Remove ${r.token.symbol} from watchlist` : `Add ${r.token.symbol} to watchlist`}
              aria-pressed={watchlist.has(r.token.id)}
            >
              {watchlist.has(r.token.id) ? <IconStarFilled /> : <IconStar />}
            </button>
          </div>
        ))}
      </div>

      <SectionHead title="Trending Sites" />
      <div className="trend-card">
        {TRENDING_SITES.map(site => (
          <button
            key={site.rank}
            className="site-row"
            onClick={() => window.dispatchEvent(new CustomEvent('wisp-toast', {
              detail: { kind: 'info', message: `${site.name} is a demo entry — no real links in the simulator` },
            }))}
          >
            <span className="site-ico">
              {site.emoji}
              <span className="site-rank">{site.rank}</span>
            </span>
            <span className="site-name">
              <span className="n">{site.name}</span>
              <span className="s">{site.cat}</span>
            </span>
            <span className="site-open"><IconArrowUpRight /></span>
          </button>
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
