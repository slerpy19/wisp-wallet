/* Wisp Wallet — token detail: hero price, interactive chart, holding card,
 * market stats and simulated Send / Receive / Swap actions. */

import { useMemo, useState } from 'react'
import { useNav } from '../nav'
import { useWisp } from '../lib/store'
import {
  effectiveChange24h, effectivePrice, isLivePrice, usePricedHoldings, useTokenSeries,
} from '../lib/engine'
import { compactMoney, money, pct, price as fmtPrice, qty as fmtQty } from '../lib/format'
import type { ChartRange, TokenMeta } from '../lib/types'
import { PriceChart } from '../components/PriceChart'
import { TokenIcon } from '../components/TokenIcon'
import { RangeTabs, MarketChip } from '../components/common'
import {
  IconAlert, IconBuy, IconEdit, IconReceive, IconSend, IconSwap, IconInfo,
} from '../components/icons'
import { useMarket } from '../lib/market'

export function TokenScreen({ token }: { token: TokenMeta }) {
  const nav = useNav()
  const settings = useWisp(s => s.data.settings)
  const [range, setRange] = useState<ChartRange>('1D')
  const series = useTokenSeries(token, range)
  const marketStatus = useMarket(s => s.status)
  const marketUpdated = useMarket(s => s.lastUpdated)

  const price = effectivePrice(token)
  const change24h = effectiveChange24h(token)
  const live = isLivePrice(token)
  const holding = usePricedHoldings().find(h => h.token.id === token.id)
  const accountQty = holding?.qty ?? 0
  const value = price * accountQty

  const portfolioTotal = usePricedHoldings().reduce((s, h) => s + h.value, 0)
  const allocation = portfolioTotal > 0 ? (value / portfolioTotal) * 100 : 0
  const up = change24h >= 0

  const rangeLabel = useMemo(
    () => ({
      '1H': 'Past hour', '1D': 'Past 24 hours', '1W': 'Past week',
      '1M': 'Past month', '1Y': 'Past year', ALL: 'All time',
    })[range],
    [range],
  )

  const hidden = settings.hideBalances

  return (
    <div className="screen push">
      <section className="token-hero">
        <TokenIcon token={token} size={58} showChain />
        <h2>
          {token.name}
          {token.custom ? <span className="chip custom">Custom</span> : null}
        </h2>
        <div className="token-price num">{fmtPrice(price, settings.currency)}</div>
        <div className="token-change">
          <span className={`pct-pill ${up ? 'up' : 'down'}`}>{pct(change24h)}</span>
          <span className="t-dim" style={{ fontSize: 12.5, marginLeft: 6 }}>24h</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <PriceSourceNote live={live} followMarket={token.followMarket && Boolean(token.coingeckoId)} />
        </div>
      </section>

      <section aria-label="Token price chart">
        <PriceChart series={series} range={range} currency={settings.currency} className="token-chart-wrap" />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <RangeTabs range={range} onChange={setRange} />
        </div>
        <div className="market-status-row">
          <MarketChip status={marketStatus} lastUpdated={marketUpdated} compact />
          <span className="status-note">{rangeLabel} · simulated history</span>
        </div>
      </section>

      {/* ——— your balance ——— */}
      <div className="holding-card">
        <div className="hc-head">
          <span>Your balance</span>
          <button
            className="link-btn"
            style={{ fontSize: 12.5, color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}
            onClick={() => nav.openFlow('edit-token', token.id)}
          >
            <IconEdit width={13} height={13} />
            Edit
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="num" style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {hidden ? '•••' : `${fmtQty(accountQty)} ${token.symbol}`}
          </div>
          <div className="num" style={{ fontSize: 16, fontWeight: 700 }}>
            {hidden ? '•••' : compactMoney(value)}
          </div>
        </div>
        <div className="allocation-bar" aria-hidden>
          <i style={{ width: `${Math.min(100, allocation)}%` }} />
        </div>
        <div className="t-dim" style={{ fontSize: 11.5, marginTop: 6 }}>
          {hidden ? '—' : `${allocation.toFixed(1)}% of portfolio value`}
        </div>
      </div>

      {/* ——— actions ——— */}
      <div className="token-actions">
        <button className="action-btn" onClick={() => nav.openTokenFlow('send', token.id)}>
          <IconSend />
          <span>Send</span>
        </button>
        <button className="action-btn" onClick={() => nav.openTokenFlow('receive', token.id)}>
          <IconReceive />
          <span>Receive</span>
        </button>
        <button className="action-btn" onClick={() => nav.gotoSwap(token.id)}>
          <IconSwap />
          <span>Swap</span>
        </button>
      </div>

      {/* ——— market stats ——— */}
      <div className="stat-list">
        <div className="stat-row">
          <span className="k">Market cap</span>
          <span className="v">{token.marketCap ? compactMoney(token.marketCap) : '—'}</span>
        </div>
        <div className="stat-row">
          <span className="k">24h volume</span>
          <span className="v">{token.volume24h ? compactMoney(token.volume24h) : '—'}</span>
        </div>
        <div className="stat-row">
          <span className="k">Network</span>
          <span className="v">{token.chain}</span>
        </div>
        <div className="stat-row">
          <span className="k">Price source</span>
          <span className="v">
            {live ? 'Live · CoinGecko' : token.followMarket && token.coingeckoId ? 'Reference snapshot' : 'Custom price'}
          </span>
        </div>
        <div className="stat-row">
          <span className="k">24h range</span>
          <span className="v num">
            {priceRangeLabel(series)}
          </span>
        </div>
      </div>

      <div style={{ margin: 14 }}>
        <div className="sim-banner">
          <IconAlert />
          <div>
            <b>Demo data.</b> This chart is a simulation anchored to the current
            price — it is not real market history.
          </div>
        </div>
      </div>
      <div style={{ height: 8 }} />
    </div>
  )
}

function priceRangeLabel(series: Array<{ v: number }>): string {
  if (series.length < 2) return '—'
  const vals = series.map(p => p.v)
  const lo = Math.min(...vals)
  const hi = Math.max(...vals)
  return `${fmtPrice(lo)} – ${fmtPrice(hi)}`
}

function PriceSourceNote({ live, followMarket }: { live: boolean; followMarket: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--text-3)' }}>
      <IconInfo width={13} height={13} />
      {live
        ? 'Price is live from CoinGecko'
        : followMarket
          ? 'Live quote unavailable — showing reference snapshot'
          : 'Custom price pinned by you'}
    </span>
  )
}
