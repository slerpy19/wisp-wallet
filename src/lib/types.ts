/* Wisp Wallet — domain types.
 * Everything in this app is simulated: balances, tokens and transactions are
 * demo data stored only in the browser. No keys, funds or chain access. */

export type Chain =
  | 'Solana'
  | 'Ethereum'
  | 'Bitcoin'
  | 'Base'
  | 'BNB Chain'
  | 'Polygon'
  | 'Arbitrum'
  | 'Optimism'
  | 'Avalanche'
  | 'Sui'
  | 'TON'
  | 'Tron'
  | 'Other'

export type Currency = 'USD' | 'EUR' | 'GBP'
export type Theme = 'dark' | 'light'
export type ChartRange = '1H' | '1D' | '1W' | '1M' | '1Y' | 'ALL'

/** Catalog entry: describes a token asset. Custom tokens added by the user are also TokenMeta. */
export type TokenMeta = {
  id: string
  symbol: string
  name: string
  chain: Chain
  /** Built-in icon key from the icon registry, or `data:`/`blob:` URL for uploads. */
  icon?: string
  /** Fallback badge color when no icon exists. */
  color?: string
  coingeckoId?: string
  /** Snapshot price used when live quotes are unavailable. */
  basePrice: number
  baseChange24h: number
  marketCap?: number
  volume24h?: number
  volatility: number
  /** true → follow the live quote; false → pin to customPrice (any value). */
  followMarket: boolean
  /** The user's pinned price, used whenever followMarket is false. */
  customPrice: number
  custom?: boolean
  verified?: boolean
}

/** A holding inside one account: how much you "own". */
export type Holding = {
  tokenId: string
  qty: number
}

export type Avatar = { kind: 'emoji'; value: string } | { kind: 'image'; value: string }

export type Account = {
  id: string
  name: string
  avatar: Avatar
  address: string
  holdings: Holding[]
  /** Display order for token ids. */
  order: string[]
  hidden: string[]
}

export type TxKind = 'sent' | 'received' | 'swapped' | 'bought'

export type Transaction = {
  id: string
  accountId: string
  kind: TxKind
  tokenId: string
  symbol: string
  amount: number
  usdValue: number
  /** Fictional counterparty label, never a real address. */
  counterparty: string
  ts: number
  status: 'simulated'
  outTokenId?: string
  outSymbol?: string
  outAmount?: number
}

export type Settings = {
  walletName: string
  currency: Currency
  theme: Theme
  hideBalances: boolean
  /** Number of decimals for token quantity display. */
  qtyDecimals: 'auto' | 0 | 2 | 4 | 6
  livePrices: boolean
  watermark: boolean
  disclaimerSeen: boolean
}

export type Quote = { usd: number; change24h: number; ts: number; live: boolean }

export type MarketState = {
  /** Quotes keyed by coingeckoId (or token id for custom tokens — custom are never live). */
  quotes: Record<string, Quote>
  status: 'idle' | 'loading' | 'live' | 'stale' | 'error'
  lastUpdated: number | null
}

export type WispData = {
  version: 1
  tokens: TokenMeta[]
  accounts: Account[]
  activeAccountId: string
  transactions: Transaction[]
  settings: Settings
}
