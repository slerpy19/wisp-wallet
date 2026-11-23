/* Wisp Wallet — Trade: Phantom-style swap (You Pay / You Receive cards with a
 * floating purple flip button) plus a live market table below.
 * Rates derive from effective prices with a fixed demo spread. */

import { useEffect, useMemo, useState } from 'react'
import { useNav } from '../nav'
import { useWisp } from '../lib/store'
import { effectiveChange24h, effectivePrice, usePricedHoldings, useTokens } from '../lib/engine'
import { compactMoney, parseAmount, price as fmtPrice, qty as fmtQty, money as fmtMoney } from '../lib/format'
import { TokenIcon, TokenPill } from '../components/TokenIcon'
import { Sheet, useToasts } from '../components/Sheet'
import { EmptyState, SearchBox, TokenPicker } from '../components/common'
import { IconSparkle, IconSwap, IconRefresh, IconInfo } from '../components/icons'
import type { TokenMeta } from '../lib/types'

const SPREAD = 0.004

type SortMode = 'featured' | 'volume' | 'gainers'

export function TradeScreen() {
  const nav = useNav()
  const tokens = useTokens()
  const holdings = usePricedHoldings()
  const toasts = useToasts()
  const currency = useWisp(s => s.data.settings.currency)
  const preset = nav.swapPreset

  const [fromId, setFromId] = useState<string | undefined>(preset?.from ?? holdings[0]?.token.id)
  const [toId, setToId] = useState<string | undefined>(preset?.to ?? 'usd-coin')
  const [amount, setAmount] = useState('')
  const [picking, setPicking] = useState<'from' | 'to' | null>(null)
  const [search, setSearch] = useState('')
  const [flipped, setFlipped] = useState(false)
  const [sort, setSort] = useState<SortMode>('featured')

  // apply presets arriving from token detail / home
  useEffect(() => {
    if (preset?.from) setFromId(preset.from)
    if (preset?.to) setToId(preset.to)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset])

  const from = tokens.find(t => t.id === fromId)
  const to = tokens.find(t => t.id === toId)
  const amountNum = parseAmount(amount)
  const heldQty = holdings.find(h => h.token.id === fromId)?.qty ?? 0
  const outAmount = useMemo(() => {
    if (!from || !to || !(amountNum > 0)) return 0
    return (amountNum * effectivePrice(from) * (1 - SPREAD)) / Math.max(effectivePrice(to), 1e-12)
  }, [from, to, amountNum])

  const inUsd = useMemo(
    () => (from && amountNum > 0 ? amountNum * effectivePrice(from) : 0),
    [from, amountNum],
  )

  const rate = useMemo(() => {
    if (!from || !to) return 0
    return effectivePrice(from) / Math.max(effectivePrice(to), 1e-12)
  }, [from, to])

  const flip = () => {
    setFlipped(f => !f)
    setFromId(toId)
    setToId(fromId)
    setAmount('')
  }

  const execute = () => {
    if (!from || !to || !(amountNum > 0)) return
    if (amountNum > heldQty) {
      toasts.error(`Amount exceeds your simulated ${from.symbol} balance`)
      return
    }
    const out = useWisp.getState().swap(from.id, to.id, amountNum)
    if (out > 0) {
      toasts.success(`Swapped ${fmtQty(amountNum)} ${from.symbol} → ${fmtQty(out)} ${to.symbol} (simulated)`)
      setAmount('')
    } else {
      toasts.error('Swap could not complete — check the amount')
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = q
      ? tokens.filter(t => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q))
      : tokens
    return list.slice(0, 60)
  }, [tokens, search])

  /* market table rows, sorted by the selected pill */
  const marketRows = useMemo(() => {
    const priced = tokens.map(t => ({
      token: t,
      mcap: t.marketCap ?? effectivePrice(t) * 1e6,
      change: effectiveChange24h(t),
    }))
    if (sort === 'gainers') return [...priced].sort((a, b) => b.change - a.change)
    if (sort === 'volume') return [...priced].sort((a, b) => (b.token.volume24h ?? 0) - (a.token.volume24h ?? 0))
    return [...priced].sort((a, b) => b.mcap - a.mcap)
  }, [tokens, sort])

  return (
    <div className="screen">
      {/* ——— sort pills, like the real Trade tab ——— */}
      <div className="filter-pills" role="tablist">
        <button className={sort === 'featured' ? 'selected' : ''} onClick={() => setSort('featured')} role="tab" aria-selected={sort === 'featured'}>
          <IconSparkle /> Featured
        </button>
        <button className={sort === 'volume' ? 'selected' : ''} onClick={() => setSort('volume')} role="tab" aria-selected={sort === 'volume'}>
          Top Volume
        </button>
        <button className={sort === 'gainers' ? 'selected' : ''} onClick={() => setSort('gainers')} role="tab" aria-selected={sort === 'gainers'}>
          Top Gainers
        </button>
      </div>

      {/* ——— swap card ——— */}
      <div className="trade-wrap">
        <div className="trade-leg-card">
          <div className="leg-label">
            <span>You Pay</span>
            {from ? (
              <button onClick={() => setAmount(String(heldQty))} aria-label="Use full simulated balance">
                Max: {fmtQty(heldQty)}
              </button>
            ) : null}
          </div>
          <div className="leg-input-row">
            <input
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              aria-label="Amount to pay"
            />
            <TokenPill token={from ?? PLACEHOLDER} onClick={() => setPicking('from')} label="Choose token to pay" />
          </div>
          <div className="leg-sub">
            <span>{inUsd > 0 ? fmtMoney(inUsd, currency as 'USD') : '$0.00'}</span>
            <span>{fmtQty(heldQty)} {from?.symbol ?? ''} available</span>
          </div>
        </div>

        <div className="trade-leg-card">
          <div className="leg-label">
            <span>You Receive</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-3)' }}>
              <IconInfo width={12} height={12} /> estimated
            </span>
          </div>
          <div className="leg-input-row">
            <div className="leg-out num" style={{ opacity: outAmount > 0 ? 1 : 0.4 }}>
              {outAmount > 0 ? fmtQty(outAmount) : '0'}
            </div>
            <TokenPill token={to ?? PLACEHOLDER} onClick={() => setPicking('to')} label="Choose token to receive" />
          </div>
          <div className="leg-sub">
            <span>{to && outAmount > 0 ? fmtMoney(outAmount * effectivePrice(to) * (1 - SPREAD), currency as 'USD') : '$0.00'}</span>
            <span>{from && to && amountNum > 0 ? `${fmtQty(amountNum * rate)} ${to.symbol}` : '—'}</span>
          </div>
        </div>

        <button className={`swap-flip-fab ${flipped ? 'rotated' : ''}`} onClick={flip} aria-label="Flip swap direction">
          <IconSwap />
        </button>
      </div>

      <div className="swap-summary">
        <div className="sum-row">
          <span className="k">Rate</span>
          <span className="v num">
            {from && to ? `1 ${from.symbol} ≈ ${fmtPrice(rate)}` : '—'}
            {from && to ? <span style={{ fontWeight: 600 }}>{to.symbol}</span> : null}
          </span>
        </div>
        <div className="sum-row">
          <span className="k">Demo spread</span>
          <span className="v">{(SPREAD * 100).toFixed(1)}%</span>
        </div>
        <div className="sum-row">
          <span className="k">Network fee</span>
          <span className="v">Simulated · $0</span>
        </div>
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        <button
          className="btn btn-accent btn-block"
          disabled={!from || !to || !(amountNum > 0)}
          onClick={execute}
        >
          <IconRefresh />
          {amountNum > heldQty && from ? 'Insufficient balance' : 'Execute simulated swap'}
        </button>
        <p className="sheet-note" style={{ textAlign: 'center' }}>
          Swaps move demo balances only and are recorded in your local Activity log.
        </p>
      </div>

      {/* ——— market table, like the real Trade tab ——— */}
      <div className="mkt-table-wrap">
        <div className="section-head" style={{ paddingTop: 22 }}>
          <h2>Tokens</h2>
        </div>
        <div className="mkt-table">
          <div className="mkt-head">
            <span>Token</span>
            <span>Mcap</span>
            <span>Change</span>
          </div>
          {marketRows.map(r => {
            const up = r.change >= 0
            return (
              <button key={r.token.id} className="mkt-row" onClick={() => nav.openToken(r.token.id)}>
                <span className="mkt-token">
                  <TokenIcon token={r.token} size={32} showChain={false} />
                  <span className="sym">{r.token.symbol}</span>
                </span>
                <span className="mkt-mcap">{compactMoney(r.mcap)}</span>
                <span className={`mkt-change ${up ? 't-up' : 't-down'}`}>
                  {r.change >= 0 ? '+' : ''}{r.change.toFixed(2)}%
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {holdings.length === 0 ? (
        <EmptyState
          title="Nothing to trade yet"
          body="Add a token with a balance first — receive one or create a custom token from the Home tab."
          icon={<IconSwap />}
        />
      ) : null}

      {/* token picker sheet */}
      <Sheet
        open={picking !== null}
        onClose={() => { setPicking(null); setSearch('') }}
        title={picking === 'from' ? 'Swap from' : 'Swap to'}
      >
        <SearchBox value={search} onChange={setSearch} />
        <TokenPicker
          tokens={filtered}
          selectedId={picking === 'from' ? fromId : toId}
          onSelect={t => {
            if (picking === 'from') setFromId(t.id)
            else setToId(t.id)
            setPicking(null)
            setSearch('')
          }}
        />
      </Sheet>
    </div>
  )
}

const PLACEHOLDER: TokenMeta = {
  id: '',
  symbol: 'Select',
  name: 'Select a token',
  chain: 'Other',
  color: 'var(--surface-3)',
  basePrice: 0,
  baseChange24h: 0,
  volatility: 0,
  followMarket: false,
  customPrice: 0,
}

/* re-export TokenIcon for convenience of the swap picker rows */
export { TokenIcon }
