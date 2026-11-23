/* Wisp Wallet — navigation context (stack + flows over the tab model). */

import { createContext, useContext } from 'react'

export type Tab = 'home' | 'trade' | 'explore' | 'activity' | 'settings'

export type FlowKind =
  | 'accounts'
  | 'send'
  | 'receive'
  | 'buy'
  | 'edit-token'
  | 'wallet-name'

export type FlowState = { kind: FlowKind; tokenId?: string } | null

export type SwapPreset = { from?: string; to?: string } | null

export type Nav = {
  tab: Tab
  setTab: (t: Tab) => void
  tokenView: string | null
  openToken: (id: string) => void
  closeToken: () => void
  flow: FlowState
  openFlow: (kind: Exclude<FlowKind, 'send' | 'receive' | 'buy'>, tokenId?: string) => void
  openTokenFlow: (kind: 'send' | 'receive' | 'buy', tokenId?: string) => void
  closeFlow: () => void
  swapPreset: SwapPreset
  gotoSwap: (from?: string, to?: string) => void
  manage: boolean
  setManage: (v: boolean) => void
}

export const NavContext = createContext<Nav | null>(null)

export function useNav(): Nav {
  const nav = useContext(NavContext)
  if (!nav) throw new Error('useNav must be used inside NavContext')
  return nav
}
