/* Wisp Wallet — TokenIcon: renders a token's mark, uploaded image or a
 * colored letter badge, with an optional chain mark in the corner. */

import { CHAIN_GLYPHS, type P } from './icons'
import { resolveIcon } from '../lib/icons'
import type { TokenMeta } from '../lib/types'

export function TokenIcon({
  token,
  size = 44,
  showChain = false,
}: {
  token: Pick<TokenMeta, 'symbol' | 'icon' | 'color' | 'chain'>
  size?: number
  showChain?: boolean
}) {
  const url = resolveIcon(token.icon)
  const emoji = token.icon?.startsWith('emoji:') ? token.icon.slice(6) : undefined
  const letter = token.symbol.charAt(0).toUpperCase()
  const color = token.color || '#7b74e0'
  const ChainMark = showChain ? CHAIN_GLYPHS[token.chain] : undefined

  return (
    <span className="asset-icon" style={{ width: size, height: size }}>
      {url ? (
        <img src={url} alt="" style={{ width: size, height: size }} loading="lazy" />
      ) : emoji ? (
        <span style={{ width: size, height: size, display: 'grid', placeItems: 'center', fontSize: size * 0.52 }}>
          {emoji}
        </span>
      ) : (
        <span
          className="badge-letter"
          style={{
            width: size,
            height: size,
            fontSize: size * 0.4,
            background: `linear-gradient(135deg, ${color}, ${shade(color, -26)})`,
          }}
        >
          {letter}
        </span>
      )}
      {ChainMark ? (
        <span className="chain-mark" aria-hidden>
          <ChainMark />
        </span>
      ) : null}
    </span>
  )
}

/** Darken/lighten a hex color by a percentage (badge gradient helper). */
function shade(hex: string, percent: number): string {
  try {
    const m = hex.replace('#', '')
    const full = m.length === 3 ? m.split('').map(c => c + c).join('') : m
    const num = parseInt(full.slice(0, 6), 16)
    const amt = Math.round(2.55 * percent)
    const r = clampByte((num >> 16) + amt)
    const g = clampByte(((num >> 8) & 0xff) + amt)
    const b = clampByte((num & 0xff) + amt)
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  } catch {
    return hex
  }
}

const clampByte = (n: number) => Math.max(0, Math.min(255, Math.round(n)))

/** Small pill used inside the swap legs. */
export function TokenPill({
  token,
  onClick,
  label,
}: {
  token: TokenMeta
  onClick?: () => void
  label?: string
}) {
  const url = resolveIcon(token.icon)
  const emoji = token.icon?.startsWith('emoji:') ? token.icon.slice(6) : undefined
  return (
    <button className="token-pill" onClick={onClick} type="button" aria-label={label ?? `Select ${token.symbol}`}>
      {token.id === '' ? null : url ? (
        <img src={url} alt="" />
      ) : emoji ? (
        <span style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', fontSize: 15 }}>{emoji}</span>
      ) : (
        <span
          className="pill-badge"
          style={{ background: token.color || '#7b74e0' }}
        >
          {token.symbol.charAt(0)}
        </span>
      )}
      {token.symbol.length > 8 ? token.symbol.slice(0, 8) : token.symbol}
      {onClick ? (
        <span className="chev">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m6 9.5 6 6 6-6" />
          </svg>
        </span>
      ) : null}
    </button>
  )
}

export type { P }
