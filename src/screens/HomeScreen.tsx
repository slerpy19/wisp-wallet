/* Wisp Wallet — Home: Phantom-style hero (wallet name, big balance,
 * "+$x Today"), token cards and manage mode (reorder / hide / edit / delete). */

import { useMemo, useState } from 'react'
import { useNav } from '../nav'
import { useWisp } from '../lib/store'
import { usePortfolio } from '../lib/engine'
import { compactMoney, money, pct, qty as fmtQty, signedMoney } from '../lib/format'
import { TokenIcon } from '../components/TokenIcon'
import { useAnimatedNumber } from '../components/AnimatedNumber'
import { SectionHead } from '../components/common'
import {
  IconArrowDown, IconArrowUp, IconChevronDown, IconEdit, IconEye, IconEyeOff,
  IconPlus, IconSort, IconTrash, IconWallet,
} from '../components/icons'
import type { PricedHolding } from '../lib/engine'

export function HomeScreen() {
  const nav = useNav()
  const settings = useWisp(s => s.data.settings)
  const hiddenBalances = settings.hideBalances
  const { total, change24hUsd, holdings } = usePortfolio()
  const animatedTotal = useAnimatedNumber(total)

  const visible = useMemo(() => {
    const hidden = new Set(useWisp.getState().data.accounts.find(a => a.id === useWisp.getState().data.activeAccountId)?.hidden)
    return holdings.filter(h => !hidden.has(h.token.id))
  }, [holdings])

  const hiddenTokens = useMemo(() => {
    const acct = useWisp.getState().data.accounts.find(a => a.id === useWisp.getState().data.activeAccountId)
    const set = new Set(acct?.hidden ?? [])
    return holdings.filter(h => set.has(h.token.id))
  }, [holdings])

  const up = change24hUsd >= 0

  return (
    <div className="screen">
      {/* ——— Phantom-style hero ——— */}
      <section className="home-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="wallet-name-btn" onClick={() => nav.openFlow('wallet-name')}>
            {settings.walletName}
            <IconChevronDown width={14} height={14} />
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
          <div className="today-row">
            <span className={up ? 't-up' : 't-down'}>{signedMoney(change24hUsd, settings.currency)}</span>
            <span className="today-label">Today</span>
          </div>
        ) : null}
      </section>

      {/* ——— cash-style row (like the real Cash card) ——— */}
      <button
        className="cash-row"
        onClick={() => nav.gotoSwap(visible[0]?.token.id, 'usd-coin')}
        aria-label="Swap into the demo stable"
      >
        <span className="cash-icon"><IconWallet /></span>
        <span className="cash-name">Cash · USDC</span>
        <span className="cash-value num">
          {hiddenBalances
            ? '•••'
            : compactMoney(holdings.find(h => h.token.id === 'usd-coin')?.value ?? 0)}
        </span>
      </button>

      {/* ——— tokens ——— */}
      <SectionHead
        title={`Tokens`}
        action={
          <button
            className="link-btn"
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
