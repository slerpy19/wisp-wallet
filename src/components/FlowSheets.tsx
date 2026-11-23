/* Wisp Wallet — Send / Receive / Buy flows and wallet-name editing.
 * Every transfer is explicitly simulated: nothing is broadcast, and the
 * receive address is a fictional string with an honest disclaimer. */

import { useEffect, useMemo, useState } from 'react'
import { useNav } from '../nav'
import { useWisp } from '../lib/store'
import { effectivePrice, usePricedHoldings, useTokens } from '../lib/engine'
import { fakeAddress } from '../lib/catalog'
import { money, parseAmount, price as fmtPrice, qty as fmtQty } from '../lib/format'
import { Sheet, useToasts } from './Sheet'
import { TokenIcon } from './TokenIcon'
import { SearchBox, TokenPicker } from './common'
import { QRCodeSVG } from 'qrcode.react'
import { IconCopy, IconAlert, IconShield, IconSend, IconBuy, IconReceive } from './icons'
import type { FlowState } from '../nav'
import type { TokenMeta } from '../lib/types'

export function FlowSheets({ flow, onClose }: { flow: FlowState; onClose: () => void }) {
  if (!flow || flow.kind === 'accounts' || flow.kind === 'edit-token') return null
  if (flow.kind === 'wallet-name') return <WalletNameSheet onClose={onClose} />
  if (flow.kind === 'send') return <SendSheet presetId={flow.tokenId} onClose={onClose} />
  if (flow.kind === 'receive') return <ReceiveSheet presetId={flow.tokenId} onClose={onClose} />
  return <BuySheet presetId={flow.tokenId} onClose={onClose} />
}

/* ——— shared token selection step ——— */

function TokenSelectStep({
  onPick, title,
}: {
  onPick: (t: TokenMeta) => void
  title: string
}) {
  const tokens = useTokens()
  const holdings = usePricedHoldings()
  const [search, setSearch] = useState('')

  const ownedIds = useMemo(() => {
    const map = new Map<string, number>()
    for (const h of holdings) map.set(h.token.id, h.qty)
    return map
  }, [holdings])

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = holdings.length > 0 && !q
      ? holdings.map(h => h.token)
      : tokens
    const filtered = q
      ? tokens.filter(t => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q))
      : base
    return filtered.slice(0, 50)
  }, [tokens, holdings, search])

  return (
    <>
      <SearchBox value={search} onChange={setSearch} />
      <TokenPicker tokens={list} onSelect={onPick} filterOwned={ownedIds} />
      <p className="sheet-note">{title}</p>
    </>
  )
}

function balanceOf(tokenId: string): number {
  const s = useWisp.getState()
  return s.data.accounts.find(a => a.id === s.data.activeAccountId)
    ?.holdings.find(h => h.tokenId === tokenId)?.qty ?? 0
}

/* ——— send ——— */

function SendSheet({ presetId, onClose }: { presetId?: string; onClose: () => void }) {
  const [tokenId, setTokenId] = useState<string | undefined>(presetId)
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [recipientTouched, setRecipientTouched] = useState(false)
  const toasts = useToasts()
  const currency = useWisp(s => s.data.settings.currency)
  const token = useTokens().find(t => t.id === tokenId)
  const held = tokenId ? balanceOf(tokenId) : 0
  const amountNum = parseAmount(amount)
  const value = token ? amountNum * effectivePrice(token) : 0

  useEffect(() => {
    if (token && !recipientTouched) {
      setRecipient(fakeAddress())
      setRecipientTouched(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token?.id])

  if (!token) {
    return (
      <Sheet open onClose={onClose} title="Send">
        <TokenSelectStep onPick={t => setTokenId(t.id)} title="Pick a token to send. You can only send balances this account holds." />
      </Sheet>
    )
  }

  const over = amountNum > held

  return (
    <Sheet open onClose={onClose} title={`Send ${token.symbol}`} subtitle="Simulation only — nothing is broadcast">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '2px 0 16px' }}>
        <TokenIcon token={token} size={42} showChain />
        <div>
          <div style={{ fontWeight: 750, fontSize: 15 }}>{token.name}</div>
          <div className="t-dim" style={{ fontSize: 12.5 }}>
            {fmtPrice(effectivePrice(token))} · balance {fmtQty(held)} {token.symbol}
          </div>
        </div>
      </div>

      <div className="field">
        <label>Amount</label>
        <div className="input-shell amount-input">
          <input
            inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0"
            aria-label="Amount to send"
            autoFocus
          />
          <span className="unit">{token.symbol}</span>
        </div>
        <div className="quick-chips">
          <button onClick={() => setAmount(String(held * 0.25))}>25%</button>
          <button onClick={() => setAmount(String(held * 0.5))}>50%</button>
          <button onClick={() => setAmount(String(held))}>Max</button>
        </div>
        {amountNum > 0 ? (
          <p className="sheet-note">≈ {money(value, currency)}</p>
        ) : null}
      </div>

      <div className="field">
        <label>Recipient (fictional — any text works)</label>
        <div className="input-shell">
          <input
            value={recipient}
            onChange={e => { setRecipient(e.target.value); setRecipientTouched(true) }}
            placeholder="wisp.sim.… or any name"
            aria-label="Recipient"
          />
        </div>
      </div>

      <div className="sim-banner" style={{ margin: '4px 0 12px' }}>
        <IconAlert />
        <div>
          <b>This is a demo.</b> “Sending” subtracts from your simulated balance
          and adds an Activity entry. No network is contacted and no real asset moves.
        </div>
      </div>

      <button
        className="btn btn-accent btn-block"
        disabled={!(amountNum > 0) || over || !recipient.trim()}
        onClick={() => {
          useWisp.getState().send(token.id, amountNum, recipient)
          toasts.success(`Sent ${fmtQty(amountNum)} ${token.symbol} to ${recipient} (simulated)`)
          onClose()
        }}
      >
        <IconSend />
        {over ? 'Amount exceeds balance' : 'Confirm simulated send'}
      </button>
    </Sheet>
  )
}

/* ——— receive ——— */

function ReceiveSheet({ presetId, onClose }: { presetId?: string; onClose: () => void }) {
  const [tokenId, setTokenId] = useState<string | undefined>(presetId)
  const [copied, setCopied] = useState(false)
  const account = useWisp(s => s.data.accounts.find(a => a.id === s.data.activeAccountId))
  const token = useTokens().find(t => t.id === tokenId)

  if (!token) {
    return (
      <Sheet open onClose={onClose} title="Receive">
        <TokenSelectStep onPick={t => setTokenId(t.id)} title="Pick a token to receive into this account." />
      </Sheet>
    )
  }

  const address = account?.address ?? 'wisp.sim.demo'

  return (
    <Sheet open onClose={onClose} title={`Receive ${token.symbol}`}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 14 }}>
        <TokenIcon token={token} size={46} showChain />
        <div style={{ fontWeight: 750 }}>{token.name}</div>
      </div>

      <div className="qr-card">
        <QRCodeSVG
          value={`wisp-sim:${token.symbol}:${address}`}
          size={168}
          bgColor="#ffffff"
          fgColor="#16141f"
          level="M"
          aria-label="Simulated receive QR code"
        />
      </div>
      <p className="sheet-note" style={{ textAlign: 'center', marginBottom: 14 }}>
        Scanning this sends real funds to <b>nowhere</b>. It is a decorative
        simulation of a wallet QR code.
      </p>

      <div className="address-shell">
        <code>{address}</code>
        <button
          className="icon-btn"
          onClick={() => {
            navigator.clipboard?.writeText(address).then(
              () => { setCopied(true); window.setTimeout(() => setCopied(false), 1600) },
              () => undefined,
            )
          }}
          aria-label="Copy simulated address"
        >
          <IconCopy />
        </button>
      </div>
      {copied ? <p className="sheet-note">Copied — it is still fictional.</p> : null}

      <div className="sim-banner" style={{ margin: '12px 0 0' }}>
        <IconShield />
        <div>
          Wisp never generates real deposit addresses, seed phrases or keys. The
          string above is random demo text created in your browser.
        </div>
      </div>
    </Sheet>
  )
}

/* ——— buy ——— */

function BuySheet({ presetId, onClose }: { presetId?: string; onClose: () => void }) {
  const [tokenId, setTokenId] = useState<string | undefined>(presetId)
  const [usd, setUsd] = useState('')
  const toasts = useToasts()
  const currency = useWisp(s => s.data.settings.currency)
  const token = useTokens().find(t => t.id === tokenId)
  const usdNum = parseAmount(usd)

  if (!token) {
    return (
      <Sheet open onClose={onClose} title="Buy">
        <TokenSelectStep onPick={t => setTokenId(t.id)} title="Pick a token to top up. Purchases are simulated — no payment is processed." />
      </Sheet>
    )
  }

  const p = effectivePrice(token)
  const qty = p > 0 ? usdNum / p : 0

  return (
    <Sheet open onClose={onClose} title={`Buy ${token.symbol}`} subtitle="Simulated top-up — no payment processed">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '2px 0 16px' }}>
        <TokenIcon token={token} size={42} showChain />
        <div>
          <div style={{ fontWeight: 750, fontSize: 15 }}>{token.name}</div>
          <div className="t-dim" style={{ fontSize: 12.5 }}>at {fmtPrice(p)}</div>
        </div>
      </div>

      <div className="field">
        <label>Amount (USD)</label>
        <div className="input-shell amount-input">
          <span className="unit" style={{ fontSize: 22 }}>$</span>
          <input
            inputMode="decimal"
            value={usd}
            onChange={e => setUsd(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0"
            aria-label="Amount in USD"
            autoFocus
          />
        </div>
        <div className="quick-chips">
          {[100, 500, 1000, 10000].map(v => (
            <button key={v} onClick={() => setUsd(String(v))}>${v.toLocaleString('en-US')}</button>
          ))}
        </div>
        {usdNum > 0 ? (
          <p className="sheet-note">You would receive ≈ {fmtQty(qty)} {token.symbol}</p>
        ) : null}
      </div>

      <div className="sim-banner" style={{ margin: '4px 0 12px' }}>
        <IconAlert />
        <div>
          <b>No checkout, no card, no crypto.</b> “Buying” adds tokens to your
          simulated balance so you can stage realistic portfolios.
        </div>
      </div>

      <button
        className="btn btn-accent btn-block"
        disabled={!(usdNum > 0) || !(p > 0)}
        onClick={() => {
          useWisp.getState().buy(token.id, qty)
          toasts.success(`Bought ${fmtQty(qty)} ${token.symbol} (simulated · ${money(usdNum, currency)})`)
          onClose()
        }}
      >
        <IconBuy />
        Complete simulated purchase
      </button>
    </Sheet>
  )
}

/* ——— wallet name ——— */

function WalletNameSheet({ onClose }: { onClose: () => void }) {
  const settings = useWisp(s => s.data.settings)
  const [name, setName] = useState(settings.walletName)
  const toasts = useToasts()

  useEffect(() => { setName(useWisp.getState().data.settings.walletName) }, [])

  return (
    <Sheet open onClose={onClose} title="Wallet name">
      <div className="field">
        <label>Shown on your home screen</label>
        <div className="input-shell">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Wisp Wallet"
            maxLength={30}
            autoFocus
          />
        </div>
      </div>
      <button
        className="btn btn-accent btn-block"
        disabled={!name.trim()}
        onClick={() => {
          useWisp.getState().setSettings({ walletName: name.trim() })
          toasts.success('Wallet name updated')
          onClose()
        }}
      >
        Save name
      </button>
    </Sheet>
  )
}

export { IconReceive }
