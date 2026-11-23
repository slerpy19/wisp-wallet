/* Wisp Wallet — Home: balance hero, portfolio chart, quick actions,
 * token list with full manage mode (reorder / hide / edit / delete). */

import { useMemo, useState } from 'react'
import { useNav } from '../nav'
import { useWisp } from '../lib/store'
import {
  usePortfolio, usePortfolioRangeChange, usePortfolioSeries,
} from '../lib/engine'
import { useMarket } from '../lib/market'
import { compactMoney, money, pct, qty as fmtQty, signedMoney } from '../lib/format'
import { PriceChart } from '../components/PriceChart'
import { TokenIcon } from '../components/TokenIcon'
import { useAnimatedNumber } from '../components/AnimatedNumber'
import { MarketChip, RangeTabs, SectionHead, SimBanner } from '../components/common'
import {
  IconArrowDown, IconArrowUp, IconBuy, IconChevronRight, IconEdit, IconEye, IconEyeOff,
  IconPlus, IconReceive, IconSend, IconSwap, IconTrash, IconAlert, IconSort,
} from '../components/icons'
import type { ChartRange } from '../lib/types'
import type { PricedHolding } from '../lib/engine'

export function HomeScreen() {
  const nav = useNav()
  const settings = useWisp(s => s.data.settings)
  const hiddenBalances = settings.hideBalances
  const { total, change24hUsd, change24hPct, holdings } = usePortfolio()
  const [range, setRange] = useState<ChartRange>('1D')
  const series = usePortfolioSeries(range)
  const rangeChange = usePortfolioRangeChange(range)
  const animatedTotal = useAnimatedNumber(total)

  const marketStatus = useMarket(s => s.status)
  const marketUpdated = useMarket(s => s.lastUpdated)

  const visible = useMemo(() => {
    const hidden = new Set(useWisp.getState().data.accounts.find(a => a.id === useWisp.getState().data.activeAccountId)?.hidden)
    return holdings.filter(h => !hidden.has(h.token.id))
  }, [holdings])

  const hiddenTokens = useMemo(() => {
    const acct = useWisp.getState().data.accounts.find(a => a.id === useWisp.getState().data.activeAccountId)
    const set = new Set(acct?.hidden ?? [])
    return holdings.filter(h => set.has(h.token.id))
  }, [holdings])

  const up = change24hPct >= 0

  return (
    <div className="screen">
      {/* ——— hero ——— */}
      <section className="home-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="wallet-name-btn" onClick={() => nav.openFlow('wallet-name')}>
            {settings.walletName}
            <IconChevronRight width={13} height={13} />
          </button>
          {settings.watermark ? <span className="chip custom" style={{ fontSize: 10, padding: '2px 8px', letterSpacing: '0.12em' }}>DEMO</span> : null}
        </div>
        <div className="balance-row">
          <h1 className="total-balance num" style={{ margin: 0 }}>
            {hiddenBalances
              ? '••••••'
              : money(animatedTotal, settings.currency)}
          </h1>
          <button
            className="hide-toggle"
            onClick={() => useWisp.getState().setSettings({ hideBalances: !hiddenBalances })}
            aria-label={hiddenBalances ? 'Show balances' : 'Hide balances'}
          >
            {hiddenBalances ? <IconEyeOff /> : <IconEye />}
          </button>
        </div>
        {!hiddenBalances ? (
          <div className="change-row">
            <span className={up ? 't-up' : 't-down'}>{signedMoney(change24hUsd, settings.currency)}</span>
            <span className={`pct-pill ${up ? 'up' : 'down'}`}>
              {up ? <IconArrowUp width={12} height={12} /> : <IconArrowDown width={12} height={12} />}
              {pct(Math.abs(change24hPct))}
            </span>
            <span className="t-dim" style={{ fontSize: 12 }}>24h</span>
          </div>
        ) : null}
      </section>

      {/* ——— portfolio chart ——— */}
      <section className="home-chart" aria-label="Portfolio chart">
        <PriceChart series={series} range={range} currency={settings.currency} />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <RangeTabs range={range} onChange={setRange} />
        </div>
        <div className="market-status-row">
          <MarketChip status={marketStatus} lastUpdated={marketUpdated} />
          <span className="status-note">
            {range === '1D' ? 'Past 24h' : range === '1H' ? 'Past hour' : range === '1W' ? 'Past week' : range === '1M' ? 'Past month' : range === '1Y' ? 'Past year' : 'All time'}
            {' · simulated history'}
          </span>
        </div>
      </section>

      {/* ——— quick actions ——— */}
      <section className="home-actions action-grid" aria-label="Quick actions">
        <button className="action-btn" onClick={() => nav.openTokenFlow('receive')}>
          <IconReceive />
          <span>Receive</span>
        </button>
        <button className="action-btn" onClick={() => nav.openTokenFlow('send')}>
          <IconSend />
          <span>Send</span>
        </button>
        <button className="action-btn" onClick={() => nav.gotoSwap(visible[0]?.token.id)}>
          <IconSwap />
          <span>Swap</span>
        </button>
        <button className="action-btn" onClick={() => nav.openTokenFlow('buy')}>
          <IconBuy />
          <span>Buy</span>
        </button>
      </section>

      <div style={{ height: 14 }} />
      <SimBanner />

      {/* ——— tokens ——— */}
      <SectionHead
        title={`Tokens`}
        action={
          <button
            className={`link-btn ${nav.manage ? '' : ''}`}
            onClick={() => nav.setManage(!nav.manage)}
            aria-pressed={nav.manage}
          >
            {nav.manage ? 'Done' : 'Manage'}
            <IconSort width={14} height={14} />
          </button>
        }
      />

      {visible.length === 0 ? (
        <p className="manage-hint">
          This account has no tokens yet. Use <b>Receive</b> or the “+ Add token”
          row below to add one — you can set any quantity you like.
        </p>
      ) : null}

      <div className="asset-list">
        {visible.map((h, i) => (
          <TokenRow
            key={h.token.id}
            holding={h}
            currency={settings.currency}
            hideValue={hiddenBalances}
            manage={nav.manage}
            first={i === 0}
            last={i === visible.length - 1}
          />
        ))}
      </div>

      <button className="add-token-row" onClick={() => nav.openFlow('edit-token')}>
        <span className="plus-disc"><IconPlus /></span>
        Add a custom token
      </button>

      {nav.manage && hiddenTokens.length > 0 ? (
        <>
          <SectionHead title="Hidden" />
          <div className="asset-list">
            {hiddenTokens.map(h => (
              <TokenRow
                key={h.token.id}
                holding={h}
                currency={settings.currency}
                hideValue={hiddenBalances}
                manage
                hidden
                first
                last
              />
            ))}
          </div>
        </>
      ) : null}

      <div style={{ height: 10 }} />
    </div>
  )
}

function TokenRow({
  holding, currency, hideValue, manage, hidden, first, last,
}: {
  holding: PricedHolding
  currency: string
  hideValue: boolean
  manage: boolean
  hidden?: boolean
  first: boolean
  last: boolean
}) {
  const nav = useNav()
  const { token, qty, change24h, value } = holding
  const up = change24h >= 0

  if (manage) {
    return (
      <div className="asset-row-wrap manage">
        <TokenIcon token={token} size={42} showChain={false} />
        <div className="asset-meta">
          <div className="name">
            {token.symbol}
            {hidden ? <span className="hidden-token-label">Hidden</span> : null}
            {token.custom ? <span className="chip custom" style={{ fontSize: 10, padding: '1px 7px' }}>Custom</span> : null}
          </div>
          <div className="sub">{fmtQty(qty)} · {money(holding.price, currency as 'USD')}</div>
        </div>
        <div className="row-actions">
          <button
            className="icon-btn"
            disabled={first}
            style={{ opacity: first ? 0.3 : 1 }}
            onClick={() => useWisp.getState().reorderHolding(activeAcctId(), token.id, -1)}
            aria-label={`Move ${token.symbol} up`}
          >
            <IconArrowUp />
          </button>
          <button
            className="icon-btn"
            disabled={last}
            style={{ opacity: last ? 0.3 : 1 }}
            onClick={() => useWisp.getState().reorderHolding(activeAcctId(), token.id, 1)}
            aria-label={`Move ${token.symbol} down`}
          >
            <IconArrowDown />
          </button>
          <button
            className="icon-btn"
            onClick={() => useWisp.getState().toggleHidden(activeAcctId(), token.id)}
            aria-label={hidden ? `Show ${token.symbol}` : `Hide ${token.symbol}`}
          >
            {hidden ? <IconEye /> : <IconEyeOff />}
          </button>
          <button
            className="icon-btn accent"
            onClick={() => nav.openFlow('edit-token', token.id)}
            aria-label={`Edit ${token.symbol}`}
          >
            <IconEdit />
          </button>
          <button
            className="icon-btn"
            style={{ color: 'var(--red)' }}
            onClick={() => {
              useWisp.getState().removeHolding(activeAcctId(), token.id)
            }}
            aria-label={`Remove ${token.symbol} from this account`}
          >
            <IconTrash />
          </button>
        </div>
      </div>
    )
  }

  return (
    <button className="asset-row-wrap" onClick={() => nav.openToken(token.id)}>
      <span className="asset-row-main">
        <TokenIcon token={token} size={44} showChain />
        <span className="asset-meta">
          <span className="name">
            {token.name}
            {token.custom ? <span className="chip custom" style={{ fontSize: 10, padding: '1px 7px' }}>Custom</span> : null}
          </span>
          <span className="sub">{fmtQty(qty)} {token.symbol}</span>
        </span>
      </span>
      <span className="asset-amounts">
        <span className="value num">
          {hideValue ? '•••' : compactMoney(value)}
        </span>
        <span className={`delta ${up ? 't-up' : 't-down'}`}>
          {pct(change24h)}
        </span>
      </span>
    </button>
  )
}

function activeAcctId(): string {
  return useWisp.getState().data.activeAccountId
}
