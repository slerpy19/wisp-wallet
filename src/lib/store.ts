/* Wisp Wallet — central state store.
 * All balances, tokens and accounts live here and persist to localStorage.
 * Every mutation is a pure, reversible demo operation: no network calls with
 * credentials, no chain access, nothing leaves the browser. */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CATALOG, fakeAddress } from './catalog'
import { useMarket } from './market'
import type {
  Account, Avatar, Chain, Holding, Settings, TokenMeta, Transaction, TxKind, WispData,
} from './types'

export const AVATAR_CHOICES = [
  '🫧', '👻', '🪐', '🚀', '🛸', '👾', '🤖', '🦊', '🐙', '🦄',
  '🐼', '🐸', '🦈', '🦉', '🐺', '🌙', '⭐', '✨', '🔥', '💎',
]

const DEFAULT_SETTINGS: Settings = {
  walletName: 'Wisp Wallet',
  currency: 'USD',
  theme: 'dark',
  hideBalances: false,
  qtyDecimals: 'auto',
  livePrices: true,
  watermark: true,
  disclaimerSeen: false,
}

function defaultAccount(): Account {
  return {
    id: 'acct-main',
    name: 'Main Account',
    avatar: { kind: 'emoji', value: '🫧' },
    address: fakeAddress(),
    holdings: [
      { tokenId: 'solana', qty: 120 },
      { tokenId: 'ethereum', qty: 1.8 },
      { tokenId: 'bitcoin', qty: 0.15 },
      { tokenId: 'usd-coin', qty: 24_000 },
      { tokenId: 'dogwifcoin', qty: 12_500 },
    ],
    order: ['solana', 'ethereum', 'bitcoin', 'dogwifcoin', 'usd-coin'],
    hidden: [],
  }
}

export function defaultData(): WispData {
  const account = defaultAccount()
  return {
    version: 1,
    tokens: CATALOG.map(t => ({ ...t })),
    accounts: [account],
    activeAccountId: account.id,
    transactions: [],
    settings: { ...DEFAULT_SETTINGS },
  }
}

export type NewTokenDraft = {
  symbol: string
  name: string
  chain: Chain
  qty: number
  price: number
  icon?: string
  color?: string
}

type WispActions = {
  /* accounts */
  switchAccount: (id: string) => void
  addAccount: (name: string, avatar: Avatar) => string
  updateAccount: (id: string, patch: Partial<Pick<Account, 'name' | 'avatar'>>) => void
  deleteAccount: (id: string) => void

  /* holdings + token editor */
  setQty: (accountId: string, tokenId: string, qty: number) => void
  removeHolding: (accountId: string, tokenId: string) => void
  addTokenToAccount: (accountId: string, tokenId: string, qty?: number) => void
  reorderHolding: (accountId: string, tokenId: string, dir: -1 | 1) => void
  toggleHidden: (accountId: string, tokenId: string) => void

  /* token meta (price/name/icon editing) */
  setTokenPrice: (tokenId: string, price: number) => void
  setTokenFollowMarket: (tokenId: string, follow: boolean) => void
  updateTokenMeta: (tokenId: string, patch: Partial<Pick<TokenMeta, 'name' | 'symbol' | 'chain' | 'icon' | 'color'>>) => void
  createToken: (draft: NewTokenDraft) => string
  deleteToken: (tokenId: string) => void

  /* flows */
  send: (tokenId: string, amount: number, to: string) => void
  receive: (tokenId: string, amount: number, from?: string) => void
  swap: (fromId: string, toId: string, amount: number) => number
  buy: (tokenId: string, qty: number) => void

  /* settings + lifecycle */
  setSettings: (patch: Partial<Settings>) => void
  resetAll: () => void
  importData: (json: string) => boolean
}

export type WispStore = { data: WispData } & WispActions

export const txKindIcon: Record<TxKind, string> = {
  sent: '↑', received: '↓', swapped: '⇄', bought: '+',
}

const uid = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

function normalizeQty(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, n)
}

export const useWisp = create<WispStore>()(
  persist(
    (set, get) => ({
      data: defaultData(),

      /* — accounts — */
      switchAccount: id =>
        set(({ data }) => ({
          data: { ...data, activeAccountId: id },
        })),

      addAccount: (name, avatar) => {
        const id = uid('acct')
        set(({ data }) => ({
          data: {
            ...data,
            accounts: [...data.accounts, {
              id,
              name: name.trim() || 'New Account',
              avatar,
              address: fakeAddress(),
              holdings: [],
              order: [],
              hidden: [],
            }],
            activeAccountId: id,
          },
        }))
        return id
      },

      updateAccount: (id, patch) =>
        set(({ data }) => ({
          data: {
            ...data,
            accounts: data.accounts.map(a => (a.id === id ? { ...a, ...patch } : a)),
          },
        })),

      deleteAccount: id =>
        set(({ data }) => {
          if (data.accounts.length <= 1) return { data }
          const accounts = data.accounts.filter(a => a.id !== id)
          return {
            data: {
              ...data,
              accounts,
              activeAccountId:
                data.activeAccountId === id ? accounts[0].id : data.activeAccountId,
            },
          }
        }),

      /* — holdings — */
      setQty: (accountId, tokenId, qty) =>
        set(({ data }) => ({
          data: {
            ...data,
            accounts: data.accounts.map(a => {
              if (a.id !== accountId) return a
              const holdings = a.holdings.some(h => h.tokenId === tokenId)
                ? a.holdings.map(h => (h.tokenId === tokenId ? { ...h, qty: normalizeQty(qty) } : h))
                : [...a.holdings, { tokenId, qty: normalizeQty(qty) } as Holding]
              const order = a.order.includes(tokenId) ? a.order : [...a.order, tokenId]
              return { ...a, holdings, order }
            }),
          },
        })),

      removeHolding: (accountId, tokenId) =>
        set(({ data }) => ({
          data: {
            ...data,
            accounts: data.accounts.map(a =>
              a.id === accountId
                ? {
                    ...a,
                    holdings: a.holdings.filter(h => h.tokenId !== tokenId),
                    order: a.order.filter(id => id !== tokenId),
                    hidden: a.hidden.filter(id => id !== tokenId),
                  }
                : a,
            ),
          },
        })),

      addTokenToAccount: (accountId, tokenId, qty = 0) =>
        get().setQty(accountId, tokenId, qty),

      reorderHolding: (accountId, tokenId, dir) =>
        set(({ data }) => ({
          data: {
            ...data,
            accounts: data.accounts.map(a => {
              if (a.id !== accountId) return a
              const order = [...a.order]
              const i = order.indexOf(tokenId)
              const j = i + dir
              if (i < 0 || j < 0 || j >= order.length) return a
              ;[order[i], order[j]] = [order[j], order[i]]
              return { ...a, order }
            }),
          },
        })),

      toggleHidden: (accountId, tokenId) =>
        set(({ data }) => ({
          data: {
            ...data,
            accounts: data.accounts.map(a =>
              a.id === accountId
                ? {
                    ...a,
                    hidden: a.hidden.includes(tokenId)
                      ? a.hidden.filter(id => id !== tokenId)
                      : [...a.hidden, tokenId],
                  }
                : a,
            ),
          },
        })),

      /* — token meta — */
      setTokenPrice: (tokenId, price) =>
        set(({ data }) => ({
          data: {
            ...data,
            tokens: data.tokens.map(t =>
              t.id === tokenId
                ? { ...t, followMarket: false, customPrice: Math.max(0, price) }
                : t,
            ),
          },
        })),

      setTokenFollowMarket: (tokenId, follow) =>
        set(({ data }) => ({
          data: {
            ...data,
            tokens: data.tokens.map(t =>
              t.id === tokenId && t.coingeckoId ? { ...t, followMarket: follow } : t,
            ),
          },
        })),

      updateTokenMeta: (tokenId, patch) =>
        set(({ data }) => ({
          data: {
            ...data,
            tokens: data.tokens.map(t => (t.id === tokenId ? { ...t, ...patch } : t)),
          },
        })),

      createToken: draft => {
        const id = uid('tok')
        const meta: TokenMeta = {
          id,
          symbol: (draft.symbol.trim() || 'NEW').toUpperCase().slice(0, 12),
          name: draft.name.trim() || 'New Token',
          chain: draft.chain,
          icon: draft.icon,
          color: draft.color ?? pickColor(draft.symbol),
          basePrice: Math.max(0, draft.price),
          baseChange24h: 0,
          volatility: 0.06,
          followMarket: false,
          customPrice: Math.max(0, draft.price),
          custom: true,
        }
        set(({ data }) => ({
          data: {
            ...data,
            tokens: [...data.tokens, meta],
            accounts: data.accounts.map(a =>
              a.id === data.activeAccountId
                ? {
                    ...a,
                    holdings: [...a.holdings, { tokenId: id, qty: normalizeQty(draft.qty) } as Holding],
                    order: [...a.order, id],
                  }
                : a,
            ),
          },
        }))
        return id
      },

      deleteToken: tokenId =>
        set(({ data }) => ({
          data: {
            ...data,
            tokens: data.tokens.filter(t => t.id !== tokenId),
            accounts: data.accounts.map(a => ({
              ...a,
              holdings: a.holdings.filter(h => h.tokenId !== tokenId),
              order: a.order.filter(id => id !== tokenId),
              hidden: a.hidden.filter(id => id !== tokenId),
            })),
          },
        })),

      /* — flows — */
      send: (tokenId, amount, to) => {
        const { data } = get()
        const account = data.accounts.find(a => a.id === data.activeAccountId)
        const token = data.tokens.find(t => t.id === tokenId)
        if (!account || !token || !(amount > 0)) return
        const held = account.holdings.find(h => h.tokenId === tokenId)?.qty ?? 0
        if (amount > held) return
        const tx: Transaction = {
          id: uid('tx'),
          accountId: account.id,
          kind: 'sent',
          tokenId,
          symbol: token.symbol,
          amount,
          usdValue: amount * effectivePriceStatic(token),
          counterparty: to.trim() || 'Unnamed recipient',
          ts: Date.now(),
          status: 'simulated',
        }
        set(({ data }) => ({
          data: {
            ...data,
            accounts: data.accounts.map(a =>
              a.id === account.id
                ? {
                    ...a,
                    holdings: a.holdings.map(h =>
                      h.tokenId === tokenId ? { ...h, qty: h.qty - amount } : h,
                    ),
                  }
                : a,
            ),
            transactions: [tx, ...data.transactions].slice(0, 300),
          },
        }))
      },

      receive: (tokenId, amount, from) => {
        const { data } = get()
        const account = data.accounts.find(a => a.id === data.activeAccountId)
        const token = data.tokens.find(t => t.id === tokenId)
        if (!account || !token || !(amount > 0)) return
        const tx: Transaction = {
          id: uid('tx'),
          accountId: account.id,
          kind: 'received',
          tokenId,
          symbol: token.symbol,
          amount,
          usdValue: amount * effectivePriceStatic(token),
          counterparty: from?.trim() || 'Simulated deposit',
          ts: Date.now(),
          status: 'simulated',
        }
        set(({ data }) => ({
          data: {
            ...data,
            accounts: data.accounts.map(a =>
              a.id === account.id
                ? {
                    ...a,
                    holdings: a.holdings.some(h => h.tokenId === tokenId)
                      ? a.holdings.map(h =>
                          h.tokenId === tokenId ? { ...h, qty: h.qty + amount } : h,
                        )
                      : [...a.holdings, { tokenId, qty: amount } as Holding],
                    order: a.order.includes(tokenId) ? a.order : [...a.order, tokenId],
                  }
                : a,
            ),
            transactions: [tx, ...data.transactions].slice(0, 300),
          },
        }))
      },

      swap: (fromId, toId, amount) => {
        const { data } = get()
        const account = data.accounts.find(a => a.id === data.activeAccountId)
        const from = data.tokens.find(t => t.id === fromId)
        const to = data.tokens.find(t => t.id === toId)
        if (!account || !from || !to || fromId === toId || !(amount > 0)) return 0
        const held = account.holdings.find(h => h.tokenId === fromId)?.qty ?? 0
        if (amount > held) return 0
        const spread = 0.004
        const out = (amount * effectivePriceStatic(from) * (1 - spread)) /
          Math.max(effectivePriceStatic(to), 1e-12)
        const tx: Transaction = {
          id: uid('tx'),
          accountId: account.id,
          kind: 'swapped',
          tokenId: fromId,
          symbol: from.symbol,
          amount,
          usdValue: amount * effectivePriceStatic(from),
          counterparty: 'Simulated swap · local rate',
          ts: Date.now(),
          status: 'simulated',
          outTokenId: toId,
          outSymbol: to.symbol,
          outAmount: out,
        }
        set(({ data }) => ({
          data: {
            ...data,
            accounts: data.accounts.map(a =>
              a.id === account.id
                ? {
                    ...a,
                    holdings: a.holdings
                      .map(h =>
                        h.tokenId === fromId
                          ? { ...h, qty: h.qty - amount }
                          : h.tokenId === toId
                            ? { ...h, qty: h.qty + out }
                            : h,
                      )
                      .concat(
                        a.holdings.some(h => h.tokenId === toId)
                          ? []
                          : [{ tokenId: toId, qty: out } as Holding],
                      ),
                    order: a.order.includes(toId) ? a.order : [...a.order, toId],
                  }
                : a,
            ),
            transactions: [tx, ...data.transactions].slice(0, 300),
          },
        }))
        return out
      },

      buy: (tokenId, qty) => {
        const { data } = get()
        const account = data.accounts.find(a => a.id === data.activeAccountId)
        const token = data.tokens.find(t => t.id === tokenId)
        if (!account || !token || !(qty > 0)) return
        const tx: Transaction = {
          id: uid('tx'),
          accountId: account.id,
          kind: 'bought',
          tokenId,
          symbol: token.symbol,
          amount: qty,
          usdValue: qty * effectivePriceStatic(token),
          counterparty: 'Simulated purchase · no payment processed',
          ts: Date.now(),
          status: 'simulated',
        }
        set(({ data }) => ({
          data: {
            ...data,
            accounts: data.accounts.map(a =>
              a.id === account.id
                ? {
                    ...a,
                    holdings: a.holdings.some(h => h.tokenId === tokenId)
                      ? a.holdings.map(h =>
                          h.tokenId === tokenId ? { ...h, qty: h.qty + qty } : h,
                        )
                      : [...a.holdings, { tokenId, qty } as Holding],
                    order: a.order.includes(tokenId) ? a.order : [...a.order, tokenId],
                  }
                : a,
            ),
            transactions: [tx, ...data.transactions].slice(0, 300),
          },
        }))
      },

      /* — settings + lifecycle — */
      setSettings: patch =>
        set(({ data }) => ({ data: { ...data, settings: { ...data.settings, ...patch } } })),

      resetAll: () => set({ data: defaultData() }),

      importData: json => {
        try {
          const parsed: unknown = JSON.parse(json)
          if (!parsed || typeof parsed !== 'object') return false
          const incomingRaw = (parsed as { data?: unknown }).data ?? parsed
          if (!incomingRaw || typeof incomingRaw !== 'object') return false
          const incoming = incomingRaw as Partial<WispData>
          if (!Array.isArray(incoming.tokens) || !Array.isArray(incoming.accounts)) return false
          if (!incoming.settings || typeof incoming.settings !== 'object') return false
          if (!incoming.accounts.some(a => a && a.id && Array.isArray(a.holdings))) return false
          if (!incoming.activeAccountId) {
            incoming.activeAccountId = incoming.accounts[0].id
          }
          const base = defaultData()
          set({
            data: {
              ...base,
              ...(incoming as WispData),
              version: 1,
              settings: { ...base.settings, ...incoming.settings },
            },
          })
          return true
        } catch {
          return false
        }
      },
    }),
    { name: 'wisp.store.v1', version: 1 },
  ),
)

function pickColor(symbol: string): string {
  let h = 0
  for (let i = 0; i < symbol.length; i++) h = (h * 31 + symbol.charCodeAt(i)) >>> 0
  const hues = [265, 205, 330, 150, 25, 0, 55, 185]
  return `hsl(${hues[h % hues.length]} 72% 56%)`
}

/** Static helper used inside store actions (avoids circular hook imports). */
function effectivePriceStatic(token: TokenMeta): number {
  if (!token.followMarket || !token.coingeckoId) return token.customPrice
  const q = useMarket.getState().quotes[token.coingeckoId]
  return q ? q.usd : token.basePrice
}

export function activeAccountOf(data: WispData): Account {
  return data.accounts.find(a => a.id === data.activeAccountId) ?? data.accounts[0]
}
