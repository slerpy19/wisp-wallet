/* Wisp Wallet — small shared UI pieces used across screens. */

import type { ReactNode } from 'react'
import type { ChartRange, TokenMeta } from '../lib/types'
import { IconAlert, IconCheck, IconSearch } from './icons'
import { TokenIcon } from './TokenIcon'
import { money } from '../lib/format'

export const RANGES: ChartRange[] = ['1H', '1D', '1W', '1M', '1Y', 'ALL']

export function RangeTabs({
  range,
  onChange,
}: {
  range: ChartRange
  onChange: (r: ChartRange) => void
}) {
  return (
    <div className="range-tabs" role="tablist" aria-label="Chart time range">
      {RANGES.map(r => (
        <button
          key={r}
          role="tab"
          aria-selected={range === r}
          className={range === r ? 'selected' : ''}
          onClick={() => onChange(r)}
        >
          {r}
        </button>
      ))}
    </div>
  )
}

/** "Live / Snapshot / Custom" status chip for market data. */
export function MarketChip({
  status,
  lastUpdated,
  compact,
}: {
  status: 'idle' | 'loading' | 'live' | 'stale' | 'error'
  lastUpdated: number | null
  compact?: boolean
}) {
  const label =
    status === 'live' ? 'Live prices'
    : status === 'stale' ? 'Cached prices'
    : status === 'loading' ? 'Fetching…'
    : status === 'error' ? 'Prices unavailable'
    : 'Simulated prices'

  const time = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-US', { hour12: false })
    : null

  return (
    <span className={`chip ${status}`} title="Market data status">
      <span className="dot" aria-hidden />
      {compact ? status === 'live' ? 'Live' : status === 'error' ? 'Offline' : label : label}
      {!compact && time ? <span style={{ fontWeight: 600 }}>· {time}</span> : null}
    </span>
  )
}

export function SectionHead({
  title,
  action,
}: {
  title: string
  action?: ReactNode
}) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {action}
    </div>
  )
}

export function EmptyState({
  title,
  body,
  icon,
  action,
}: {
  title: string
  body: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <div className="glyph">{icon ?? <IconSearch />}</div>
      <h4>{title}</h4>
      <p>{body}</p>
      {action}
    </div>
  )
}

/** Scrollable token picker used by send / receive / buy / swap sheets. */
export function TokenPicker({
  tokens,
  selectedId,
  onSelect,
  filterOwned,
}: {
  tokens: TokenMeta[]
  selectedId?: string
  onSelect: (t: TokenMeta) => void
  filterOwned?: Map<string, number>
}) {
  const list = tokens
  if (list.length === 0) {
    return (
      <EmptyState
        title="No tokens found"
        body="Try a different search, or add a custom token from the home screen."
      />
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {list.map(t => {
        const owned = filterOwned?.get(t.id)
        return (
          <button
            key={t.id}
            type="button"
            className={`pick-row ${selectedId === t.id ? 'selected' : ''}`}
            onClick={() => onSelect(t)}
          >
            <TokenIcon token={t} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{t.symbol}</div>
              <div className="t-dim" style={{ fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t.name}
                {owned !== undefined ? ` · ${owned.toLocaleString('en-US', { maximumFractionDigits: 6 })} available` : ''}
              </div>
            </div>
            {selectedId === t.id ? (
              <span className="pick-check"><IconCheck /></span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

/** Search box wrapper for pickers. */
export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="search-shell">
      <IconSearch />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? 'Search tokens'}
        aria-label={placeholder ?? 'Search tokens'}
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
      />
    </div>
  )
}

export function DisclaimerDialog({ onAccept }: { onAccept: () => void }) {
  return (
    <>
      <div className="sheet-backdrop" />
      <div className="dialog-center" role="dialog" aria-modal="true" aria-label="Welcome to Wisp Wallet">
        <div className="dialog-card">
          <div
            style={{
              width: 54, height: 54, borderRadius: 18,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
              display: 'grid', placeItems: 'center',
              fontSize: 26, color: 'var(--accent-ink)', margin: '0 auto 14px',
              boxShadow: 'var(--glow-accent)',
            }}
          >
            ✦
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: 19, fontWeight: 800, textAlign: 'center', letterSpacing: '-0.02em' }}>
            A simulated wallet
          </h2>
          <p style={{ margin: '0 0 14px', fontSize: 13.5, color: 'var(--text-2)', textAlign: 'center', lineHeight: 1.55 }}>
            Wisp is a <b style={{ color: 'var(--text)' }}>demo interface</b>. Balances,
            tokens and transactions are fictional numbers stored only in your browser.
            <br /><br />
            No seed phrases. No private keys. No real funds. Nothing here touches a blockchain.
          </p>
          <button className="btn btn-accent btn-block" onClick={onAccept}>
            Got it — explore the demo
          </button>
          <p className="sheet-note" style={{ textAlign: 'center' }}>
            Don't use Wisp to impersonate real wealth. Screenshots are for demos, decks and fun.
          </p>
        </div>
      </div>
    </>
  )
}

export function SimBanner() {
  return (
    <div className="sim-banner" role="note">
      <IconAlert />
      <div>
        <b>Simulation.</b> Every balance, price action and transaction on this
        screen is fictional demo data. Wisp never holds keys or funds and
        cannot make real transfers.
      </div>
    </div>
  )
}

/** Right-aligned formatted money value helper. */
export function MoneyValue({ usd, currency }: { usd: number; currency: string }) {
  return <span className="num">{money(usd, currency as 'USD')}</span>
}
