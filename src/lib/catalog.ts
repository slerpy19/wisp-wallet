/* Wisp Wallet — built-in token catalog.
 * `basePrice` values are a clearly-labelled reference snapshot used only when
 * live quotes are unavailable; the app replaces them with real quotes from the
 * CoinGecko public API whenever the network allows. */

import type { TokenMeta } from './types'

export const SNAPSHOT_LABEL = 'Reference snapshot · late 2025'

type Seed = Omit<TokenMeta, 'custom' | 'followMarket' | 'customPrice' | 'icon'> & {
  icon?: string
}

const seeds: Seed[] = [
  // — majors —
  { id: 'solana', symbol: 'SOL', name: 'Solana', chain: 'Solana', coingeckoId: 'solana', basePrice: 145.2, baseChange24h: 2.8, marketCap: 79_000_000_000, volume24h: 3_900_000_000, volatility: 0.05, icon: 'solana', verified: true },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', chain: 'Ethereum', coingeckoId: 'ethereum', basePrice: 3050, baseChange24h: 1.6, marketCap: 368_000_000_000, volume24h: 14_500_000_000, volatility: 0.034, icon: 'ethereum', verified: true },
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', chain: 'Bitcoin', coingeckoId: 'bitcoin', basePrice: 86_500, baseChange24h: 1.1, marketCap: 1_710_000_000_000, volume24h: 32_000_000_000, volatility: 0.022, icon: 'bitcoin', verified: true },
  { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', chain: 'Solana', coingeckoId: 'usd-coin', basePrice: 1.0, baseChange24h: 0.01, marketCap: 61_000_000_000, volume24h: 7_800_000_000, volatility: 0.0006, icon: 'usd-coin', verified: true },
  { id: 'tether', symbol: 'USDT', name: 'Tether', chain: 'Ethereum', coingeckoId: 'tether', basePrice: 1.0, baseChange24h: -0.01, marketCap: 139_000_000_000, volume24h: 48_000_000_000, volatility: 0.0006, icon: 'tether', verified: true },
  { id: 'bnb', symbol: 'BNB', name: 'BNB', chain: 'BNB Chain', coingeckoId: 'binancecoin', basePrice: 880, baseChange24h: 0.9, marketCap: 128_000_000_000, volume24h: 2_100_000_000, volatility: 0.028, icon: 'bnb', verified: true },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', chain: 'Other', coingeckoId: 'ripple', basePrice: 2.18, baseChange24h: -0.7, marketCap: 129_000_000_000, volume24h: 4_600_000_000, volatility: 0.042, icon: 'ripple', verified: true },

  // — large caps —
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', chain: 'Other', coingeckoId: 'dogecoin', basePrice: 0.152, baseChange24h: 2.4, marketCap: 22_800_000_000, volume24h: 1_100_000_000, volatility: 0.062, icon: 'dogecoin', verified: true },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', chain: 'Other', coingeckoId: 'cardano', basePrice: 0.54, baseChange24h: -1.2, marketCap: 19_000_000_000, volume24h: 620_000_000, volatility: 0.05, icon: 'cardano', verified: true },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', chain: 'Avalanche', coingeckoId: 'avalanche-2', basePrice: 21.4, baseChange24h: 1.9, marketCap: 8_900_000_000, volume24h: 380_000_000, volatility: 0.055, icon: 'avalanche-2', verified: true },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', chain: 'Other', coingeckoId: 'polkadot', basePrice: 4.32, baseChange24h: 0.6, marketCap: 6_600_000_000, volume24h: 210_000_000, volatility: 0.052, icon: 'polkadot', verified: true },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', chain: 'Ethereum', coingeckoId: 'chainlink', basePrice: 15.8, baseChange24h: 2.2, marketCap: 10_400_000_000, volume24h: 520_000_000, volatility: 0.05, icon: 'chainlink', verified: true },
  { id: 'toncoin', symbol: 'TON', name: 'Toncoin', chain: 'TON', coingeckoId: 'the-open-network', basePrice: 2.55, baseChange24h: -0.4, marketCap: 6_400_000_000, volume24h: 190_000_000, volatility: 0.048, icon: 'toncoin', verified: true },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', chain: 'Other', coingeckoId: 'litecoin', basePrice: 94.6, baseChange24h: 1.3, marketCap: 7_200_000_000, volume24h: 410_000_000, volatility: 0.04, icon: 'litecoin', verified: true },
  { id: 'sui', symbol: 'SUI', name: 'Sui', chain: 'Sui', coingeckoId: 'sui', basePrice: 3.18, baseChange24h: 3.4, marketCap: 10_700_000_000, volume24h: 900_000_000, volatility: 0.06, icon: 'sui', verified: true },
  { id: 'aave', symbol: 'AAVE', name: 'Aave', chain: 'Ethereum', coingeckoId: 'aave', basePrice: 238, baseChange24h: 2.5, marketCap: 3_500_000_000, volume24h: 240_000_000, volatility: 0.055, icon: 'aave', verified: true },
  { id: 'hyperliquid', symbol: 'HYPE', name: 'Hyperliquid', chain: 'Other', coingeckoId: 'hyperliquid', basePrice: 34.2, baseChange24h: 5.6, marketCap: 12_800_000_000, volume24h: 480_000_000, volatility: 0.07, icon: 'hyperliquid', verified: true },
  { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum', chain: 'Arbitrum', coingeckoId: 'arbitrum', basePrice: 0.52, baseChange24h: -1.8, marketCap: 2_200_000_000, volume24h: 260_000_000, volatility: 0.06, icon: 'arbitrum', verified: true },
  { id: 'optimism', symbol: 'OP', name: 'Optimism', chain: 'Optimism', coingeckoId: 'optimism', basePrice: 0.98, baseChange24h: -0.9, marketCap: 1_700_000_000, volume24h: 180_000_000, volatility: 0.062, icon: 'optimism', verified: true },

  // — solana ecosystem & memes —
  { id: 'jupiter-exchange', symbol: 'JUP', name: 'Jupiter', chain: 'Solana', coingeckoId: 'jupiter-exchange-solana', basePrice: 0.64, baseChange24h: 1.7, marketCap: 1_800_000_000, volume24h: 120_000_000, volatility: 0.07, color: '#C8F24F', verified: true },
  { id: 'jito-governance-token', symbol: 'JTO', name: 'Jito', chain: 'Solana', coingeckoId: 'jito-governance-token', basePrice: 1.85, baseChange24h: -2.1, marketCap: 620_000_000, volume24h: 48_000_000, volatility: 0.072, color: '#F9C747' },
  { id: 'dogwifcoin', symbol: 'WIF', name: 'dogwifhat', chain: 'Solana', coingeckoId: 'dogwifcoin', basePrice: 0.74, baseChange24h: 6.8, marketCap: 740_000_000, volume24h: 160_000_000, volatility: 0.11, color: '#E9B36B' },
  { id: 'bonk', symbol: 'BONK', name: 'Bonk', chain: 'Solana', coingeckoId: 'bonk', basePrice: 0.0000185, baseChange24h: 4.9, marketCap: 1_400_000_000, volume24h: 210_000_000, volatility: 0.12, color: '#F5AF0B' },
  { id: 'pudgy-penguins', symbol: 'PENGU', name: 'Pudgy Penguins', chain: 'Solana', coingeckoId: 'pudgy-penguins', basePrice: 0.028, baseChange24h: 8.2, marketCap: 1_700_000_000, volume24h: 320_000_000, volatility: 0.13, color: '#12B8D9' },
  { id: 'pepe', symbol: 'PEPE', name: 'Pepe', chain: 'Ethereum', coingeckoId: 'pepe', basePrice: 0.0000062, baseChange24h: 3.6, marketCap: 5_200_000_000, volume24h: 1_050_000_000, volatility: 0.115, color: '#3D9E2E' },
  { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu', chain: 'Ethereum', coingeckoId: 'shiba-inu', basePrice: 0.0000122, baseChange24h: -1.4, marketCap: 7_100_000_000, volume24h: 240_000_000, volatility: 0.08, color: '#FFA409' },

  // — other notable —
  { id: 'celestia', symbol: 'TIA', name: 'Celestia', chain: 'Other', coingeckoId: 'celestia', basePrice: 2.95, baseChange24h: 2.9, marketCap: 820_000_000, volume24h: 65_000_000, volatility: 0.075, color: '#7B2BF9' },
  { id: 'near', symbol: 'NEAR', name: 'NEAR Protocol', chain: 'Other', coingeckoId: 'near', basePrice: 2.48, baseChange24h: -0.6, marketCap: 3_000_000_000, volume24h: 230_000_000, volatility: 0.058, color: '#111111' },
  { id: 'aptos', symbol: 'APT', name: 'Aptos', chain: 'Other', coingeckoId: 'aptos', basePrice: 4.05, baseChange24h: 1.2, marketCap: 2_800_000_000, volume24h: 140_000_000, volatility: 0.065, color: '#1B1B1F' },
  { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos Hub', chain: 'Other', coingeckoId: 'cosmos', basePrice: 3.35, baseChange24h: 0.4, marketCap: 1_600_000_000, volume24h: 82_000_000, volatility: 0.052, color: '#4E4A8F' },
  { id: 'injective-protocol', symbol: 'INJ', name: 'Injective', chain: 'Other', coingeckoId: 'injective-protocol', basePrice: 11.4, baseChange24h: 4.1, marketCap: 1_100_000_000, volume24h: 95_000_000, volatility: 0.08, color: '#00C2FF' },
  { id: 'render-token', symbol: 'RENDER', name: 'Render', chain: 'Other', coingeckoId: 'render-token', basePrice: 3.15, baseChange24h: 2.2, marketCap: 1_600_000_000, volume24h: 110_000_000, volatility: 0.075, color: '#202020' },
  { id: 'filecoin', symbol: 'FIL', name: 'Filecoin', chain: 'Other', coingeckoId: 'filecoin', basePrice: 2.28, baseChange24h: -2.4, marketCap: 1_500_000_000, volume24h: 130_000_000, volatility: 0.06, color: '#0090FF' },
  { id: 'worldcoin-wld', symbol: 'WLD', name: 'Worldcoin', chain: 'Other', coingeckoId: 'worldcoin-wld', basePrice: 1.32, baseChange24h: 3.8, marketCap: 690_000_000, volume24h: 88_000_000, volatility: 0.09, color: '#0A0A0A' },
]

export const CATALOG: TokenMeta[] = seeds.map((s, i) => ({
  ...s,
  icon: s.icon,
  volatility: s.volatility ?? 0.05,
  baseChange24h: s.baseChange24h ?? (i % 5 === 0 ? 1.8 : i % 3 === 0 ? -1.1 : 0.6),
  followMarket: Boolean(s.coingeckoId),
  customPrice: s.basePrice,
}))

export const CATALOG_BY_ID = new Map(CATALOG.map(t => [t.id, t]))

export const CHAINS: Array<TokenMeta['chain']> = [
  'Solana', 'Ethereum', 'Bitcoin', 'Base', 'BNB Chain', 'Polygon', 'Arbitrum',
  'Optimism', 'Avalanche', 'Sui', 'TON', 'Tron', 'Other',
]

/** Monospace-ish simulated address used for the active account. */
export function fakeAddress(prefix = 'wisp'): string {
  const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}.sim.${seg()}.${seg()}.${seg()}`
}
