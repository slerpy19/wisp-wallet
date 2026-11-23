/* Wisp Wallet — consistent line icon set (24px grid, 2px strokes). */

import type { ReactElement, SVGProps } from 'react'

export type P = SVGProps<SVGSVGElement>

const base = (props: P) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
})

export const IconHome = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19Z" />
    <path d="M9.5 20.5v-6h5v6" />
  </svg>
)

export const IconSwap = (p: P) => (
  /* double vertical arrows — like the real Phantom swap flip button */
  <svg {...base(p)}>
    <path d="M8.5 19V5.5" />
    <path d="m5 9 3.5-3.5L12 9" />
    <path d="M15.5 5v13.5" />
    <path d="m12 15 3.5 3.5L19 15" />
  </svg>
)

export const IconExplore = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M15.5 8.5 13.7 13.7 8.5 15.5l1.8-5.2Z" />
  </svg>
)

export const IconActivity = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 12a8.5 8.5 0 1 1 2.6 6.1" />
    <path d="M3.5 13.5 6 11l3 3 4.5-5.5 3 2.5h4" />
  </svg>
)

export const IconSettings = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.09a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" />
  </svg>
)

export const IconSend = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 19V5" />
    <path d="M5.5 11.5 12 5l6.5 6.5" />
  </svg>
)

export const IconReceive = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14" />
    <path d="M18.5 12.5 12 19l-6.5-6.5" />
  </svg>
)

export const IconBuy = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8.5v7M8.5 12h7" />
  </svg>
)

export const IconEye = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const IconEyeOff = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 4l16 16" />
    <path d="M10.6 6.1A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-2.5 3.3M14.1 14.1a3 3 0 1 1-4.2-4.2" />
    <path d="M6.6 6.9C4 8.8 2.5 12 2.5 12S6 18.5 12 18.5c1.2 0 2.3-.2 3.3-.6" />
  </svg>
)

export const IconChevronDown = (p: P) => (
  <svg {...base(p)}><path d="m6 9.5 6 6 6-6" /></svg>
)

export const IconChevronRight = (p: P) => (
  <svg {...base(p)}><path d="m9.5 6 6 6-6 6" /></svg>
)

export const IconChevronLeft = (p: P) => (
  <svg {...base(p)}><path d="M15 6l-6 6 6 6" /></svg>
)

export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
)

export const IconPlus = (p: P) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
)

export const IconClose = (p: P) => (
  <svg {...base(p)}><path d="m6 6 12 12M18 6 6 18" /></svg>
)

export const IconCheck = (p: P) => (
  <svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
)

export const IconEdit = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20h4.5L20 8.5a2.1 2.1 0 0 0-3-3L5.5 17 4 20Z" />
    <path d="m14.5 7 3 3" />
  </svg>
)

export const IconTrash = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M9.5 7V5A1.5 1.5 0 0 1 11 3.5h2A1.5 1.5 0 0 1 14.5 5v2" />
    <path d="M6.5 7 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-12" />
    <path d="M10 11v6M14 11v6" />
  </svg>
)

export const IconArrowUp = (p: P) => (
  <svg {...base(p)}><path d="M12 19V6" /><path d="m6 12 6-6 6 6" /></svg>
)

export const IconArrowDown = (p: P) => (
  <svg {...base(p)}><path d="M12 5v13" /><path d="m6 12 6 6 6-6" /></svg>
)

export const IconCopy = (p: P) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
  </svg>
)

export const IconInfo = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5" />
    <path d="M12 8h.01" />
  </svg>
)

export const IconAlert = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4 21 19.5H3Z" />
    <path d="M12 10.5v4" />
    <path d="M12 17.3h.01" />
  </svg>
)

export const IconUpload = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 16.5v2A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-2" />
    <path d="M12 15V4.5" />
    <path d="M7.5 9 12 4.5 16.5 9" />
  </svg>
)

export const IconImage = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <circle cx="9" cy="10" r="1.8" />
    <path d="m4.5 17.5 4.7-4.7 4.3 4.2 2.5-2.5 4.5 4" />
  </svg>
)

export const IconRefresh = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 12a8 8 0 1 1-2.3-5.6" />
    <path d="M20 4v4h-4" />
  </svg>
)

export const IconStar = (p: P) => (
  <svg {...base({ ...p, fill: 'none' })}>
    <path d="m12 4.5 2.3 4.7 5.2.8-3.7 3.6.9 5.1-4.7-2.4-4.7 2.4.9-5.1L4.5 10l5.2-.8Z" />
  </svg>
)

export const IconStarFilled = (p: P) => (
  <svg {...base({ ...p, fill: 'currentColor', strokeWidth: 0 })}>
    <path d="m12 4.5 2.3 4.7 5.2.8-3.7 3.6.9 5.1-4.7-2.4-4.7 2.4.9-5.1L4.5 10l5.2-.8Z" />
  </svg>
)

export const IconSparkle = (p: P) => (
  <svg {...base({ ...p, fill: 'currentColor', strokeWidth: 0 })}>
    <path d="M12 3c.7 3.9 1.9 6.3 3.4 7.6C16.9 12 19 12.8 21 13c-2 .2-4.1 1-5.6 2.4-1.5 1.3-2.7 3.7-3.4 7.6-.7-3.9-1.9-6.3-3.4-7.6C7.1 14 5 13.2 3 13c2-.2 4.1-1 5.6-2.4C10.1 9.3 11.3 6.9 12 3Z" />
  </svg>
)

export const IconWallet = (p: P) => (
  /* banknote — the real Phantom Cash row glyph (via orbitt-vault reference) */
  <svg {...base(p)}>
    <path d="M3 6h18v12H3zM3 10a4 4 0 0 0 4-4m10 0a4 4 0 0 0 4 4M3 14a4 4 0 0 1 4 4m10 0a4 4 0 0 1 4-4M12 9v6m-2-4c0-2 4-2 4 0s-4 0-4 2 4 2 4 0" />
  </svg>
)

export const IconShare = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5v11" />
    <path d="m8 7 4-3.5L16 7" />
    <path d="M5 12.5v6A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-6" />
  </svg>
)

export const IconShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5 19 6v6c0 4.4-3 7.6-7 8.5-4-.9-7-4.1-7-8.5V6Z" />
    <path d="m9.3 12 2 2 3.4-3.8" />
  </svg>
)

export const IconGlobe = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17" />
    <path d="M12 3.5c2.4 2.3 3.6 5.1 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.1-3.6-8.5s1.2-6.2 3.6-8.5Z" />
  </svg>
)

export const IconDots = (p: P) => (
  <svg {...base({ ...p, fill: 'currentColor', strokeWidth: 0 })}>
    <circle cx="6" cy="12" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="18" cy="12" r="1.7" />
  </svg>
)

export const IconSort = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 6v12" />
    <path d="m4.5 14.5 3.5 3.5 3.5-3.5" />
    <path d="M16 18V6" />
    <path d="m12.5 9.5 3.5-3.5 3.5 3.5" />
  </svg>
)

export const IconSpinner = (p: P) => (
  <svg {...base({ ...p, strokeWidth: 2.4 })} style={{ animation: 'spin 0.9s linear infinite', ...(p.style ?? {}) }}>
    <path d="M12 3.5a8.5 8.5 0 1 1-8.5 8.5" />
  </svg>
)

/* chain marks — small monochrome glyphs used in the corner of token icons */

export const ChainGlyphSolana = (p: P) => (
  <svg {...base({ ...p, strokeWidth: 0, fill: 'currentColor' })} viewBox="0 0 24 24">
    <path d="M6.2 6.3 7.5 5h10.3l1.9 1.3-1.3 1.2H7.5Zm-1.6 5.7L5.9 10.7h10.3l1.9 1.3-1.3 1.2H6.5Zm1.6 5.7L7.5 16.4h10.3l1.9 1.3-1.3 1.3H7.5Z" />
  </svg>
)

export const ChainGlyphEth = (p: P) => (
  <svg {...base({ ...p, strokeWidth: 0, fill: 'currentColor' })} viewBox="0 0 24 24">
    <path d="M12 3.5 17.8 12 12 15.6 6.2 12Zm0 13.5 5.8-3.4L12 20.5l-5.8-6.9Z" />
  </svg>
)

export const ChainGlyphBtc = (p: P) => (
  <svg {...base({ ...p, strokeWidth: 2 })} viewBox="0 0 24 24">
    <path d="M10 7h3a2.2 2.2 0 0 1 0 4.4H10Zm0 4.4h3.6a2.3 2.3 0 0 1 0 4.6H10ZM10 7v9.9M11.6 5.4v1.8M11.6 16.7v1.9" />
  </svg>
)

export const ChainGlyphGeneric = (p: P) => (
  <svg {...base({ ...p, strokeWidth: 0, fill: 'currentColor' })} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3.2" />
    <circle cx="5" cy="6.5" r="2" />
    <circle cx="19" cy="6.5" r="2" />
    <circle cx="5" cy="17.5" r="2" />
    <circle cx="19" cy="17.5" r="2" />
    <path d="m6.5 7.8 3.4 2.8m4.2 0 3.4-2.8M6.5 16.2l3.4-2.8m4.2 0 3.4 2.8" stroke="currentColor" strokeWidth="1.6" fill="none" />
  </svg>
)

export const CHAIN_GLYPHS: Record<string, (p: P) => ReactElement> = {
  Solana: ChainGlyphSolana,
  Ethereum: ChainGlyphEth,
  Bitcoin: ChainGlyphBtc,
}

/* ——— added for the Phantom-style Explore screen ——— */

export const IconArrowUpRight = (p: P) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M7 17 17 7" />
    <path d="M9 7h8v8" />
  </svg>
)
