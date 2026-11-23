/* Wisp Wallet — built-in token icon registry.
 * All marks are original, simplified geometric recreations drawn for this
 * project (not copied asset files). Token logos remain the property of their
 * respective projects. Tokens without a drawn mark fall back to a colored
 * letter badge. */

const uri = (svg: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim().replace(/\s+/g, ' '))}`

const svg = (body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${body}</svg>`

const circle = (fill: string, body: string): string =>
  svg(`<circle cx="32" cy="32" r="32" fill="${fill}"/>${body}`)

/** White letter centered in a colored disc — the shared fallback badge. */
export function letterBadge(letter: string, color: string, textColor = '#fff'): string {
  return circle(
    color,
    `<text x="32" y="33" text-anchor="middle" dominant-baseline="central"
      font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
      font-size="30" font-weight="700" fill="${textColor}">${letter}</text>`,
  )
}

const text = (t: string, size = 32, weight = 700, fill = '#fff', dy = 0) =>
  `<text x="32" y="${33 + dy}" text-anchor="middle" dominant-baseline="central"
    font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    font-size="${size}" font-weight="${weight}" fill="${fill}">${t}</text>`

/* ——— drawn marks ——— */

const solana = svg(
  `<defs><linearGradient id="g" x1="0" y1="1" x2="1" y2="0">
     <stop offset="0" stop-color="#14F195"/><stop offset="1" stop-color="#9945FF"/>
   </linearGradient></defs>
   <rect width="64" height="64" rx="32" fill="#0E0E10"/>
   <path d="M18 20.5 21.5 17h25L50 20.5 46.5 24h-25z" fill="url(#g)"/>
   <path d="M18 33.5 21.5 30h25L50 33.5 46.5 37h-25z" fill="url(#g)"/>
   <path d="M14 46.5 17.5 43h25L46 46.5 42.5 50h-25z" fill="url(#g)"/>`
)

const ethereum = circle(
  '#627EEA',
  `<path d="M32 10v16.2l13 5.9z" fill="#fff" fill-opacity=".62"/>
   <path d="M32 10 19 32.1l13-5.9z" fill="#fff"/>
   <path d="M32 43.6V54l13-18.2z" fill="#fff" fill-opacity=".62"/>
   <path d="M32 54V43.6L19 35.8z" fill="#fff"/>
   <path d="M32 41.1l13-7.9-13-5.9z" fill="#fff" fill-opacity=".25"/>
   <path d="M19 33.2l13 7.9v-13.8z" fill="#fff" fill-opacity=".45"/>`
)

const bitcoin = circle(
  '#F7931A',
  `<text x="32" y="34" text-anchor="middle" dominant-baseline="central"
     font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
     font-size="36" font-weight="800" fill="#fff">B</text>
   <rect x="28.5" y="13" width="3.4" height="6" rx="1.4" fill="#fff"/>
   <rect x="32.1" y="13" width="3.4" height="6" rx="1.4" fill="#fff"/>
   <rect x="28.5" y="45" width="3.4" height="6" rx="1.4" fill="#fff"/>
   <rect x="32.1" y="45" width="3.4" height="6" rx="1.4" fill="#fff"/>`
)

const usdc = circle(
  '#2775CA',
  `<path d="M24 14a20 20 0 0 0 0 36" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
   <path d="M40 14a20 20 0 0 1 0 36" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
   ${text('$', 34, 700)}`
)

const usdt = circle(
  '#26A17B',
  `<path d="M14 17h36v8h-13v5.2c7.2.5 12.6 2.3 12.6 4.6 0 2.5-6.9 4.6-15.6 4.6s-15.6-2.1-15.6-4.6c0-2.3 5.4-4.1 12.6-4.6V25H14z" fill="#fff" fill-opacity=".9"/>
   <path d="M35.4 36.6c7.2.5 12.2 2.2 12.2 4.4 0 2.4-6.9 4.4-15.6 4.4s-15.6-2-15.6-4.4c0-2.2 5-3.9 12.2-4.4v3.6c-4.5.3-7.6 1-7.6 1.8 0 1.1 4.9 2 11 2s11-.9 11-2c0-.8-3.1-1.5-7.6-1.8z" fill="#fff" fill-opacity=".6"/>`
)

const bnb = circle(
  '#F3BA2F',
  `<path d="M32 12l6.2 6.2L32 24.4l-6.2-6.2z" fill="#fff"/>
   <path d="M21.2 22.8l6.2 6.2-6.2 6.2L15 29z" fill="#fff" fill-opacity=".85"/>
   <path d="M42.8 22.8l6.2 6.2-6.2 6.2-6.2-6.2z" fill="#fff" fill-opacity=".85"/>
   <path d="M32 28.6l6.2 6.2L32 41l-6.2-6.2z" fill="#fff"/>
   <path d="M32 39.6l6.2 6.2L32 52l-6.2-6.2z" fill="#fff" fill-opacity=".85"/>
   <path d="M21.2 39.6l6.2 6.2-6.2 6.2L15 45.8z" fill="#fff" fill-opacity=".6"/>
   <path d="M42.8 39.6l6.2 6.2-6.2 6.2-6.2-6.2z" fill="#fff" fill-opacity=".6"/>`
)

const xrp = circle(
  '#23292F',
  `<path d="M20 18h7.4l4.9 5.9c.9 1.1 1.5 1.1 2.4 0L39.6 18H47l-9.4 11.3c-.9 1.1-.9 1.7 0 2.8L47 46h-7.4l-4.9-6c-.9-1.1-1.5-1.1-2.4 0l-4.9 6H20l9.4-11.4c.9-1.1.9-1.7 0-2.8z" fill="#fff"/>`
)

const doge = circle(
  '#C2A633',
  text('D', 36, 800)
)

const ada = circle(
  '#0033AD',
  `<circle cx="32" cy="32" r="6.5" fill="#fff"/>
   <circle cx="32" cy="17" r="3" fill="#fff" fill-opacity=".85"/>
   <circle cx="32" cy="47" r="3" fill="#fff" fill-opacity=".85"/>
   <circle cx="18.8" cy="24.5" r="3" fill="#fff" fill-opacity=".85"/>
   <circle cx="45.2" cy="24.5" r="3" fill="#fff" fill-opacity=".85"/>
   <circle cx="18.8" cy="39.5" r="3" fill="#fff" fill-opacity=".85"/>
   <circle cx="45.2" cy="39.5" r="3" fill="#fff" fill-opacity=".85"/>
   <circle cx="32" cy="9" r="1.8" fill="#fff" fill-opacity=".6"/>
   <circle cx="32" cy="55" r="1.8" fill="#fff" fill-opacity=".6"/>
   <circle cx="12" cy="32" r="1.8" fill="#fff" fill-opacity=".6"/>
   <circle cx="52" cy="32" r="1.8" fill="#fff" fill-opacity=".6"/>`
)

const avax = circle(
  '#E84142',
  `<path d="M32 14 54 48h-9.5L32 27.5 19.5 48H10z" fill="#fff"/>
   <path d="M35.5 48 41 40l5.5 8z" fill="#fff"/>`
)

const polkadot = circle(
  '#221D2E',
  `<ellipse cx="32" cy="31.5" rx="8.5" ry="8" fill="#E6007A"/>
   <ellipse cx="32" cy="14.5" rx="5.4" ry="7.4" fill="#E6007A"/>
   <ellipse cx="32" cy="49.5" rx="5.4" ry="7.4" fill="#E6007A"/>
   <ellipse cx="15.4" cy="23" rx="5" ry="7.2" transform="rotate(-30 15.4 23)" fill="#E6007A" fill-opacity=".8"/>
   <ellipse cx="48.6" cy="41" rx="5" ry="7.2" transform="rotate(-30 48.6 41)" fill="#E6007A" fill-opacity=".8"/>
   <ellipse cx="15.4" cy="41" rx="5" ry="7.2" transform="rotate(30 15.4 41)" fill="#E6007A" fill-opacity=".8"/>
   <ellipse cx="48.6" cy="23" rx="5" ry="7.2" transform="rotate(30 48.6 23)" fill="#E6007A" fill-opacity=".8"/>`
)

const chainlink = circle(
  '#2A5ADA',
  `<path d="M32 12l15 8.7v22.6L32 52l-15-8.7V20.7z" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
   <path d="M32 24l8 4.6v9.2l-8 4.6-8-4.6v-9.2z" fill="#fff"/>`
)

const ton = circle(
  '#0098EA',
  `<path fill-rule="evenodd" d="M20 18h24c2.6 0 4.2 2.9 2.7 5.1L33.9 43.3c-1.4 2.1-4.4 2.1-5.8 0L17.3 23.1C15.8 20.9 17.4 18 20 18zm-1.6 6.8c-.9-1.4.1-3.2 1.7-3.2h6.2l-3.6 10.2zm27.2 0-4.3 7-3.6-10.2h6.2c1.6 0 2.6 1.8 1.7 3.2zM32 40.4l-4.4-12.4h8.8z" fill="#fff"/>`
)

const litecoin = circle(
  '#345D9D',
  `<text x="32" y="34" text-anchor="middle" dominant-baseline="central"
     font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
     font-size="34" font-weight="700" fill="#fff">&#321;</text>`
)

const sui = circle(
  '#4DA2FF',
  `<path d="M32 12c6 7.5 11 13.6 11 20.4C43 40 38.2 46 32 46s-11-6-11-13.6C21 25.6 26 19.5 32 12z" fill="#fff"/>`
)

const aave = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
   <defs><linearGradient id="ag" x1="0" y1="0" x2="1" y2="1">
     <stop offset="0" stop-color="#B6509E"/><stop offset="1" stop-color="#2EBAC6"/>
   </linearGradient></defs>
   <circle cx="32" cy="32" r="32" fill="url(#ag)"/>
   <path fill-rule="evenodd" fill="#fff" d="M32 14c-7.5 0-12.5 5.5-12.5 13v18.5c0 1.6 1.8 2.5 3 1.5l3.4-3 3.4 3c.6.5 1.5.5 2.1 0l3.3-3 3.3 3c.6.5 1.5.5 2.1 0l3.4-3 3.4 3c1.2 1 3 .1 3-1.5V27c0-7.5-5-13-12.4-13zm-5.6 12a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4zm11.2 0a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4z"/>
 </svg>`

const hyperliquid = circle(
  '#0F3A33',
  `<path d="M18 40c6-14 10-4 14-11 3.6-6.3 8-4 14-5" fill="none" stroke="#97ECE4" stroke-width="6.5" stroke-linecap="round"/>
   <circle cx="43" cy="24" r="3.4" fill="#97ECE4"/>`
)

const optimism = circle('#FF0420', text('OP', 22, 800))

const arbitrum = circle(
  '#12AAFF',
  `<path d="M32 12 50 45H14z" fill="#fff" fill-opacity=".92"/>
   <path d="M32 12 22 45h9l6.5-22z" fill="#0B1E33" fill-opacity=".85"/>
   <path d="M38 36l7 9h-9l-3-5.6z" fill="#fff"/>`
)

/* ——— registry ——— */

export const TOKEN_ICONS: Record<string, string> = {
  solana: uri(solana),
  ethereum: uri(ethereum),
  bitcoin: uri(bitcoin),
  'usd-coin': uri(usdc),
  tether: uri(usdt),
  'bnb': uri(bnb),
  'ripple': uri(xrp),
  'dogecoin': uri(doge),
  cardano: uri(ada),
  'avalanche-2': uri(avax),
  polkadot: uri(polkadot),
  chainlink: uri(chainlink),
  toncoin: uri(ton),
  litecoin: uri(litecoin),
  sui: uri(sui),
  aave: uri(aave),
  hyperliquid: uri(hyperliquid),
  optimism: uri(optimism),
  arbitrum: uri(arbitrum),
}

/** Icon URL for a token: registry key, data URI, or undefined → letter badge. */
export function resolveIcon(icon?: string): string | undefined {
  if (!icon) return undefined
  if (icon.startsWith('data:') || icon.startsWith('blob:') || icon.startsWith('http')) return icon
  return TOKEN_ICONS[icon]
}
