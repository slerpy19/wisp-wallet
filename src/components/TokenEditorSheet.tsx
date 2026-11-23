/* Wisp Wallet — token editor: the control room for the simulation.
 * - Add an existing catalog token to the account
 * - Create a brand-new custom token (any symbol, price, icon, quantity)
 * - Edit anything about an existing token: quantity (any number), pinned
 *   price, name, symbol, chain, icon (registry / emoji / upload), plus
 *   reorder, hide and delete.
 * Totals everywhere recalculate automatically. */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNav } from '../nav'
import { useWisp } from '../lib/store'
import { effectiveChange24h, effectivePrice } from '../lib/engine'
import { CHAINS } from '../lib/catalog'
import { TOKEN_ICONS, resolveIcon } from '../lib/icons'
import { money, parseAmount, price as fmtPrice } from '../lib/format'
import { Sheet, useToasts } from './Sheet'
import { TokenIcon } from './TokenIcon'
import { SearchBox, TokenPicker } from './common'
import { IconCheck, IconImage, IconTrash, IconUpload } from './icons'
import { AVATAR_CHOICES } from '../lib/store'
import type { Chain, TokenMeta } from '../lib/types'

type Mode = 'create' | 'edit'

export function TokenEditorSheet({
  open, tokenId, onClose,
}: {
  open: boolean
  tokenId?: string
  onClose: () => void
}) {
  const nav = useNav()
  const tokens = useWisp(s => s.data.tokens)
  const toasts = useToasts()
  const existing = tokenId ? tokens.find(t => t.id === tokenId) : undefined
  const mode: Mode = existing ? 'edit' : 'create'

  const [tab, setTab] = useState<'existing' | 'custom'>('existing')
  const [search, setSearch] = useState('')
  const [pickedId, setPickedId] = useState<string | undefined>(undefined)
  const [qty, setQty] = useState('')
  const [draft, setDraft] = useState<{
    symbol: string; name: string; chain: Chain; price: string; qty: string; icon?: string
  }>({
    symbol: '', name: '', chain: 'Solana' as Chain, price: '', qty: '',
  })
  const [editQty, setEditQty] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [follow, setFollow] = useState(true)
  const [editName, setEditName] = useState('')
  const [editSymbol, setEditSymbol] = useState('')
  const [editChain, setEditChain] = useState<Chain>('Solana')
  const [editIcon, setEditIcon] = useState<string | undefined>(undefined)
  const fileRef = useRef<HTMLInputElement>(null)

  const acctId = useWisp(s => s.data.activeAccountId)

  useEffect(() => {
    if (!open) return
    setSearch('')
    setPickedId(undefined)
    setQty('')
    setTab('existing')
    setDraft({ symbol: '', name: '', chain: 'Solana', price: '', qty: '' })
    if (existing) {
      const state = useWisp.getState()
      const heldQty = state.data.accounts
        .find(a => a.id === state.data.activeAccountId)
        ?.holdings.find(h => h.tokenId === existing.id)?.qty ?? 0
      setEditQty(String(heldQty))
      setEditPrice(String(existing.customPrice))
      setFollow(existing.followMarket)
      setEditName(existing.name)
      setEditSymbol(existing.symbol)
      setEditChain(existing.chain)
      setEditIcon(existing.icon)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tokenId])

  const catalogCandidates = useMemo(() => {
    const accountTokenIds = new Set(
      useWisp.getState().data.accounts.find(a => a.id === acctId)?.holdings.map(h => h.tokenId) ?? [],
    )
    const q = search.trim().toLowerCase()
    return tokens
      .filter(t => !t.custom && !accountTokenIds.has(t.id))
      .filter(t => !q || t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q))
      .slice(0, 40)
  }, [tokens, search, acctId])

  if (mode === 'create') {
    return (
      <Sheet
        open={open}
        onClose={onClose}
        title="Add a token"
        subtitle="Bring an existing token into this account, or invent one"
      >
        <div className="seg-picker" role="tablist" aria-label="Add token method">
          <button role="tab" aria-selected={tab === 'existing'} className={tab === 'existing' ? 'selected' : ''} onClick={() => setTab('existing')}>
            From catalog
          </button>
          <button role="tab" aria-selected={tab === 'custom'} className={tab === 'custom' ? 'selected' : ''} onClick={() => setTab('custom')}>
            Create custom
          </button>
        </div>
        <div style={{ height: 14 }} />

        {tab === 'existing' ? (
          <>
            <SearchBox value={search} onChange={setSearch} placeholder="Search the catalog" />
            <TokenPicker
              tokens={catalogCandidates}
              selectedId={pickedId}
              onSelect={t => {
                setPickedId(t.id)
                setQty('1')
              }}
            />
            {pickedId ? (
              <div style={{ marginTop: 14 }}>
                <div className="field">
                  <label>Quantity — any amount you like</label>
                  <div className="input-shell amount-input">
                    <input
                      inputMode="decimal"
                      value={qty}
                      onChange={e => setQty(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="0"
                      aria-label="Token quantity"
                    />
                    <span className="unit">
                      {tokens.find(t => t.id === pickedId)?.symbol}
                    </span>
                  </div>
                </div>
                <QuickChips onPick={v => setQty(v)} symbol={tokens.find(t => t.id === pickedId)?.symbol ?? ''} />
                <button
                  className="btn btn-accent btn-block"
                  onClick={() => {
                    const n = parseAmount(qty)
                    const t = tokens.find(x => x.id === pickedId)
                    if (!t) return
                    useWisp.getState().setQty(acctId, t.id, n)
                    toasts.success(`${t.symbol} added to this account`)
                    onClose()
                  }}
                >
                  Add to account
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <CustomTokenForm
            draft={draft}
            setDraft={setDraft}
            fileRef={fileRef}
            onFile={(f: File) => {
              if (f.size > 300_000) {
                toasts.error('Please pick an image under 300 KB')
                return
              }
              const reader = new FileReader()
              reader.onload = () => setDraft(d => ({ ...d, icon: String(reader.result) }))
              reader.onerror = () => toasts.error('Could not read that image')
              reader.readAsDataURL(f)
            }}
            onCreate={() => {
              const price = parseAmount(draft.price)
              const quantity = parseAmount(draft.qty)
              if (!draft.symbol.trim() || price <= 0) {
                toasts.error('Give the token a symbol and a price above zero')
                return
              }
              const id = useWisp.getState().createToken({
                symbol: draft.symbol,
                name: draft.name || draft.symbol,
                chain: draft.chain,
                qty: quantity,
                price,
                color: colorFor(draft.symbol),
              })
              if (draft.icon) useWisp.getState().updateTokenMeta(id, { icon: draft.icon })
              toasts.success(`${draft.symbol.toUpperCase()} created`)
              onClose()
            }}
          />
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => {
            const f = e.target.files?.[0]
            if (f && f.size <= 300_000) {
              const reader = new FileReader()
              reader.onload = () => {
                const url = String(reader.result)
                if (tab === 'custom') setDraft(d => ({ ...d, icon: url }))
                else if (pickedId) setEditIcon(url)
              }
              reader.readAsDataURL(f)
            } else if (f) {
              toasts.error('Please pick an image under 300 KB')
            }
            e.target.value = ''
          }}
        />
      </Sheet>
    )
  }

  /* ——— edit mode ——— */
  const currentQty = useWisp.getState().data.accounts
    .find(a => a.id === acctId)?.holdings.find(h => h.tokenId === existing?.id)?.qty ?? 0

  return (
    <Sheet open={open} onClose={onClose} title={`Edit ${existing?.symbol}`} subtitle="Set any balance and price — totals update everywhere">
      <div className="field">
        <label>Quantity</label>
        <div className="input-shell amount-input">
          <input
            inputMode="decimal"
            value={editQty}
            onChange={e => setEditQty(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0"
            aria-label="Quantity"
          />
          <span className="unit">{existing?.symbol}</span>
        </div>
        <QuickChips
          onPick={v => setEditQty(v)}
          symbol={existing?.symbol ?? ''}
          current={currentQty}
        />
        <p className="sheet-note">
          Currently {currentQty.toLocaleString('en-US', { maximumFractionDigits: 9 })} — enter any number, including zero.
        </p>
      </div>

      <div className="field">
        <label>Price</label>
        <div className="input-shell amount-input" style={{ minHeight: 46 }}>
          <span className="unit" style={{ fontSize: 17 }}>$</span>
          <input
            inputMode="decimal"
            value={editPrice}
            onChange={e => setEditPrice(e.target.value.replace(/[^0-9.]/g, ''))}
            style={{ fontSize: 19 }}
            aria-label="Custom price"
          />
        </div>
        {existing?.coingeckoId ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: '10px 14px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>Follow the live market</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {follow
                  ? 'Price updates automatically from CoinGecko'
                  : 'Price is pinned to your custom value'}
              </div>
            </div>
            <button
              className={`toggle ${follow ? 'on' : ''}`}
              role="switch"
              aria-checked={follow}
              aria-label="Follow the live market"
              onClick={() => setFollow(!follow)}
            />
          </div>
        ) : (
          <p className="sheet-note">Custom tokens always use your pinned price.</p>
        )}
      </div>

      <div className="field">
        <label>Identity</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 10 }}>
          <div className="input-shell" style={{ minHeight: 46 }}>
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              maxLength={30}
              aria-label="Token name"
            />
          </div>
          <div className="input-shell" style={{ minHeight: 46 }}>
            <input
              value={editSymbol}
              onChange={e => setEditSymbol(e.target.value.toUpperCase())}
              maxLength={12}
              aria-label="Symbol"
            />
          </div>
        </div>
        <div style={{ height: 10 }} />
        <div className="input-shell">
          <select
            value={editChain}
            onChange={e => setEditChain(e.target.value as Chain)}
            aria-label="Network"
          >
            {CHAINS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <IconPicker
        token={existing}
        icon={editIcon}
        onChange={setEditIcon}
        onUpload={() => fileRef.current?.click()}
      />

      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (!existing) return
            if (existing.custom) {
              useWisp.getState().deleteToken(existing.id)
              toasts.info(`${existing.symbol} deleted everywhere`)
            } else {
              useWisp.getState().removeHolding(acctId, existing.id)
              toasts.info(`${existing.symbol} removed from this account`)
            }
            nav.setManage(true)
            onClose()
          }}
          aria-label="Remove token"
        >
          <IconTrash />
          {existing?.custom ? 'Delete' : 'Remove'}
        </button>
        <button
          className="btn btn-accent"
          style={{ flex: 1 }}
          onClick={() => {
            if (!existing) return
            const store = useWisp.getState()
            store.setQty(acctId, existing.id, parseAmount(editQty))
            if (!follow || !existing.coingeckoId) {
              store.setTokenPrice(existing.id, parseAmount(editPrice))
            } else {
              store.setTokenFollowMarket(existing.id, true)
            }
            store.updateTokenMeta(existing.id, {
              name: editName.trim() || existing.name,
              symbol: editSymbol.trim() || existing.symbol,
              chain: editChain,
              icon: editIcon,
            })
            toasts.success(`${existing.symbol} updated`)
            onClose()
          }}
        >
          Save changes
        </button>
      </div>
      <p className="sheet-note">
        Removing a token only clears it from this account
        {existing?.custom ? ' and deletes the custom token everywhere.' : '. The built-in catalog keeps it.'}
      </p>
    </Sheet>
  )
}

function QuickChips({
  onPick, symbol, current,
}: {
  onPick: (v: string) => void
  symbol: string
  current?: number
}) {
  const base = current ?? 0
  return (
    <div className="quick-chips">
      {base > 0 ? (
        <>
          <button onClick={() => onPick(String(base * 2))}>×2</button>
          <button onClick={() => onPick(String(base / 2))}>÷2</button>
        </>
      ) : null}
      <button onClick={() => onPick('100')}>100 {symbol}</button>
      <button onClick={() => onPick('1000')}>1,000 {symbol}</button>
      <button onClick={() => onPick('100000')}>100K {symbol}</button>
    </div>
  )
}

function IconPicker({
  token, icon, onChange, onUpload,
}: {
  token?: TokenMeta
  icon?: string
  onChange: (icon: string | undefined) => void
  onUpload: () => void
}) {
  const registryOptions = useMemo(() => {
    const entries = Object.entries(TOKEN_ICONS)
    if (token?.icon && TOKEN_ICONS[token.icon]) return entries
    return entries.slice(0, 10)
  }, [token])

  return (
    <div className="field">
      <label>Icon</label>
      <div className="icon-options">
        {/* letter badge */}
        <button
          className={!icon ? 'selected' : ''}
          onClick={() => onChange(undefined)}
          aria-label="Letter badge"
        >
          <span
            className="letter"
            style={{ background: token?.color ?? '#7b74e0' }}
          >
            {(token?.symbol ?? 'A').charAt(0)}
          </span>
        </button>
        {registryOptions.slice(0, 12).map(([key, url]) => (
          <button
            key={key}
            className={icon === key ? 'selected' : ''}
            onClick={() => onChange(key)}
            aria-label={`Icon ${key}`}
          >
            <img src={url} alt="" />
          </button>
        ))}
        {AVATAR_CHOICES.slice(0, 8).map(e => (
          <button
            key={e}
            className={icon === `emoji:${e}` ? 'selected' : ''}
            onClick={() => onChange(`emoji:${e}`)}
            style={{ fontSize: 20 }}
            aria-label={`Emoji ${e}`}
          >
            {e}
          </button>
        ))}
        <button onClick={onUpload} aria-label="Upload an image">
          <IconImage />
        </button>
      </div>
      {icon?.startsWith('data:') ? (
        <p className="sheet-note">Custom image selected.</p>
      ) : null}
    </div>
  )
}

function CustomTokenForm({
  draft, setDraft, onCreate, onFile,
}: {
  draft: { symbol: string; name: string; chain: Chain; price: string; qty: string; icon?: string }
  setDraft: React.Dispatch<React.SetStateAction<{ symbol: string; name: string; chain: Chain; price: string; qty: string; icon?: string }>>
  onCreate: () => void
  onFile: (f: File) => void
  fileRef: React.RefObject<HTMLInputElement | null>
}) {
  const iconUrl = draft.icon ? resolveIcon(draft.icon) : undefined
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 10 }}>
        <div className="field">
          <label>Symbol</label>
          <div className="input-shell">
            <input
              value={draft.symbol}
              onChange={e => setDraft(d => ({ ...d, symbol: e.target.value.toUpperCase() }))}
              placeholder="MOON"
              maxLength={12}
            />
          </div>
        </div>
        <div className="field">
          <label>Name</label>
          <div className="input-shell">
            <input
              value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              placeholder="Mooncoin"
              maxLength={30}
            />
          </div>
        </div>
      </div>

      <div className="field">
        <label>Network</label>
        <div className="input-shell">
          <select
            value={draft.chain}
            onChange={e => setDraft(d => ({ ...d, chain: e.target.value as Chain }))}
          >
            {CHAINS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 10 }}>
        <div className="field">
          <label>Price (USD)</label>
          <div className="input-shell">
            <span className="unit">$</span>
            <input
              inputMode="decimal"
              value={draft.price}
              onChange={e => setDraft(d => ({ ...d, price: e.target.value.replace(/[^0-9.]/g, '') }))}
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="field">
          <label>Quantity</label>
          <div className="input-shell">
            <input
              inputMode="decimal"
              value={draft.qty}
              onChange={e => setDraft(d => ({ ...d, qty: e.target.value.replace(/[^0-9.]/g, '') }))}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="field">
        <label>Icon</label>
        <div className="icon-options">
          <button className={!draft.icon ? 'selected' : ''} onClick={() => setDraft(d => ({ ...d, icon: undefined }))} aria-label="Letter badge">
            <span className="letter" style={{ background: colorFor(draft.symbol || 'A') }}>
              {(draft.symbol || 'A').charAt(0)}
            </span>
          </button>
          {Object.entries(TOKEN_ICONS).slice(0, 10).map(([key, url]) => (
            <button key={key} className={draft.icon === key ? 'selected' : ''} onClick={() => setDraft(d => ({ ...d, icon: key }))} aria-label={`Icon ${key}`}>
              <img src={url} alt="" />
            </button>
          ))}
          {AVATAR_CHOICES.slice(0, 8).map(e => (
            <button
              key={e}
              className={draft.icon === `emoji:${e}` ? 'selected' : ''}
              onClick={() => setDraft(d => ({ ...d, icon: `emoji:${e}` }))}
              style={{ fontSize: 20 }}
              aria-label={`Emoji ${e}`}
            >
              {e}
            </button>
          ))}
          <button onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = () => {
              const f = input.files?.[0]
              if (f) onFile(f)
            }
            input.click()
          }} aria-label="Upload an image">
            <IconUpload />
          </button>
        </div>
        {iconUrl ? (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TokenIcon token={{ symbol: draft.symbol || 'A', icon: draft.icon, color: colorFor(draft.symbol), chain: draft.chain }} size={36} />
            <span className="t-dim" style={{ fontSize: 12.5 }}>Preview</span>
          </div>
        ) : null}
      </div>

      <button className="btn btn-accent btn-block" onClick={onCreate}>
        Create token
      </button>
      <p className="sheet-note">
        Custom tokens use your pinned price and can be swapped, sent and charted
        like any other asset. They exist only in this browser.
      </p>
    </>
  )
}

function colorFor(symbol: string): string {
  let h = 0
  for (let i = 0; i < symbol.length; i++) h = (h * 31 + symbol.charCodeAt(i)) >>> 0
  const hues = [265, 205, 330, 150, 25, 355, 55, 185]
  return `hsl(${hues[h % hues.length]} 70% 55%)`
}

/* helpers kept close to usage */
export function useTokenPricePreview(t?: TokenMeta): string {
  if (!t) return '$0'
  return fmtPrice(effectivePrice(t))
}

export function tokenDelta(t: TokenMeta): number {
  return effectiveChange24h(t)
}

export function tokenValueCheck(t: TokenMeta, qty: number): string {
  return money(effectivePrice(t) * qty)
}
