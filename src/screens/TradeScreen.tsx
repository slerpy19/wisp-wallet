/* Wisp Wallet — Trade screen: a fully simulated swap between any two tokens.
 * Rates derive from effective prices with a fixed demo spread. */

import { useEffect, useMemo, useState } from 'react'
import { useNav } from '../nav'
import { useWisp } from '../lib/store'
import { effectivePrice, usePricedHoldings, useTokens } from '../lib/engine'
import { parseAmount, price as fmtPrice, qty as fmtQty } from '../lib/format'
import { TokenIcon, TokenPill } from '../components/TokenIcon'
import { Sheet, useToasts } from '../components/Sheet'
import { EmptyState, SearchBox, TokenPicker } from '../components/common'
import { IconInfo, IconSwap, IconRefresh } from '../components/icons'
import type { TokenMeta } from '../lib/types'

const SPREAD = 0.004

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

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 2, marginBottom: 4 }}>
        <span className="chip custom"><IconInfo width={12} height={12} /> Simulation — nothing touches a chain</span>
      </div>

      <div className="trade-card">
        <div className="trade-leg">
          <div className="leg-label">
            <span>You pay</span>
            {from ? (
              <button
                style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => { setAmount(String(heldQty)); }}
              >
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
        </div>

        <div className="swap-divider">
          <span className="line" />
          <button className={`swap-flip ${flipped ? 'rotated' : ''}`} onClick={flip} aria-label="Flip swap direction">
            <IconSwap />
          </button>
          <span className="line" />
        </div>

        <div className="trade-leg">
          <div className="leg-label">
            <span>You receive (estimated)</span>
          </div>
          <div className="leg-input-row">
            <div className="num" style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-0.02em', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: outAmount > 0 ? 1 : 0.4 }}>
              {outAmount > 0 ? fmtQty(outAmount) : '0'}
            </div>
            <TokenPill token={to ?? PLACEHOLDER} onClick={() => setPicking('to')} label="Choose token to receive" />
          </div>
        </div>
      </div>

      <div className="swap-summary">
        <div className="sum-row">
          <span className="k">Rate</span>
          <span className="v num">
            {from && to
              ? `1 ${from.symbol} ≈ ${fmtPrice(rate)} ${to.symbol === 'USDC' || to.symbol === 'USDT' ? '' : ''}`
              : '—'}
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
          Swaps move demo balances only and are recorded in your local Activity tab.
        </p>
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
