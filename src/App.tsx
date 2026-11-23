/* Wisp Wallet — application shell: Phantom-style pill tabs, avatar header,
 * search dock, sheets, toasts, theming, market polling and the disclaimer. */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavContext, useNav, type FlowState, type Nav, type Tab } from './nav'
import { activeAccountOf, useWisp } from './lib/store'
import { useMarket } from './lib/market'
import { ToastHost, Sheet, type ToastMsg } from './components/Sheet'
import {
  IconChevronDown, IconChevronLeft, IconEdit, IconSearch, IconPlus,
} from './components/icons'
import { Avatar } from './components/Avatar'
import { SearchBox, TokenPicker } from './components/common'
import { HomeScreen } from './screens/HomeScreen'
import { TokenScreen } from './screens/TokenScreen'
import { TradeScreen } from './screens/TradeScreen'
import { ExploreScreen } from './screens/ExploreScreen'
import { ActivityScreen } from './screens/ActivityScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { AccountSheet } from './components/AccountSheet'
import { TokenEditorSheet } from './components/TokenEditorSheet'
import { FlowSheets } from './components/FlowSheets'
import { DisclaimerDialog } from './components/common'
import { useTokens } from './lib/engine'

const PILLS: Array<{ id: Tab; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'trade', label: 'Trade' },
  { id: 'explore', label: 'Explore' },
]

function Header({ nav }: { nav: Nav }) {
  const account = useWisp(s => activeAccountOf(s.data))

  /* token detail — back header */
  if (nav.tokenView) {
    return (
      <header className="wisp-header">
        <button className="icon-btn" onClick={nav.closeToken} aria-label="Back">
          <IconChevronLeft />
        </button>
        <div style={{ fontWeight: 800, fontSize: 16.5, flex: 1, textAlign: 'center', letterSpacing: '-0.01em' }}>
          Token
        </div>
        <button
          className="icon-btn"
          onClick={() => nav.openFlow('edit-token', nav.tokenView ?? undefined)}
          aria-label="Edit this token"
        >
          <IconEdit />
        </button>
      </header>
    )
  }

  /* Phantom-style top bar: avatar + pill tabs + utility icons */
  return (
    <header className="wisp-header">
      <button
        className="header-account"
        style={{ padding: 0 }}
        onClick={() => nav.openFlow('accounts')}
        aria-label="Switch account"
      >
        <Avatar account={account} size={36} />
      </button>

      <nav className="pill-tabs" aria-label="Primary">
        {PILLS.map(({ id, label }) => (
          <button
            key={id}
            className={`pill-tab ${nav.tab === id ? 'selected' : ''}`}
            onClick={() => nav.setTab(id)}
            aria-current={nav.tab === id ? 'page' : undefined}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="header-spacer" />

      <button
        className={`icon-btn ${nav.tab === 'activity' ? 'accent' : ''}`}
        onClick={() => nav.setTab('activity')}
        aria-label="Activity"
      >
        <ClockIcon />
      </button>
      <button
        className={`icon-btn ${nav.tab === 'settings' ? 'accent' : ''}`}
        onClick={() => nav.setTab('settings')}
        aria-label="Settings"
      >
        <GearIcon />
      </button>
    </header>
  )
}

function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.35a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09c0 .68.4 1.3 1.03 1.56a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9c.26.63.88 1.03 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51.97Z" />
    </svg>
  )
}

/* bottom dock: search pill + purple plus (like the real app) */
function Dock({ nav, onOpenSearch }: { nav: Nav; onOpenSearch: () => void }) {
  if (nav.tokenView) return null
  return (
    <div className="dock">
      <button className="dock-search" onClick={onOpenSearch} aria-label="Search tokens">
        <IconSearch />
        <span className="ph">Search Phantom</span>
      </button>
      <button
        className="dock-plus"
        onClick={() => nav.openFlow('edit-token')}
        aria-label="Add a custom token"
      >
        <IconPlus />
      </button>
    </div>
  )
}

function SearchSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNav()
  const tokens = useTokens()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = q
      ? tokens.filter(t => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q))
      : tokens
    return list.slice(0, 40)
  }, [tokens, search])

  return (
    <Sheet open={open} onClose={onClose} title="Search">
      <SearchBox value={search} onChange={setSearch} placeholder="Search tokens" />
      <TokenPicker
        tokens={filtered}
        selectedId={undefined}
        onSelect={t => {
          onClose()
          setSearch('')
          nav.openToken(t.id)
        }}
      />
    </Sheet>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [tokenView, setTokenView] = useState<string | null>(null)
  const [flow, setFlow] = useState<FlowState>(null)
  const [swapPreset, setSwapPreset] = useState<{ from?: string; to?: string } | null>(null)
  const [manage, setManage] = useState(false)
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const [searchOpen, setSearchOpen] = useState(false)

  const data = useWisp(s => s.data)
  const settings = data.settings
  const account = activeAccountOf(data)

  /* theme */
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', settings.theme === 'light' ? '#ffffff' : '#0b0b0f')
  }, [settings.theme])

  /* live market polling — hydrates from cache, refreshes every 60s while visible */
  useEffect(() => {
    const getIds = () => {
      const tokens = useWisp.getState().data.tokens
      return tokens
        .filter(t => t.followMarket && t.coingeckoId)
        .map(t => t.coingeckoId as string)
    }
    useMarket.getState().startPolling(getIds, () => useWisp.getState().data.settings.livePrices)
    return () => useMarket.getState().stopPolling()
  }, [])

  /* toast events */
  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastMsg & { id: number }>).detail
      setToasts(ts => [...ts.slice(-2), detail])
      window.setTimeout(() => setToasts(ts => ts.filter(t => t.id !== detail.id)), 2600)
    }
    window.addEventListener('wisp-toast', onToast)
    return () => window.removeEventListener('wisp-toast', onToast)
  }, [])

  const openFlow = useCallback((kind: 'accounts' | 'edit-token' | 'wallet-name', tokenId?: string) => {
    setFlow({ kind, tokenId })
  }, [])

  const openTokenFlow = useCallback((kind: 'send' | 'receive' | 'buy', tokenId?: string) => {
    setFlow({ kind, tokenId })
  }, [])

  const closeFlow = useCallback(() => setFlow(null), [])

  const gotoSwap = useCallback((from?: string, to?: string) => {
    setSwapPreset({ from, to })
    setTokenView(null)
    setTab('trade')
  }, [])

  const nav: Nav = useMemo(
    () => ({
      tab, setTab, tokenView,
      openToken: (id: string) => setTokenView(id),
      closeToken: () => setTokenView(null),
      flow, openFlow, openTokenFlow, closeFlow,
      swapPreset, gotoSwap,
      manage, setManage,
    }),
    [tab, tokenView, flow, openFlow, openTokenFlow, closeFlow, swapPreset, gotoSwap, manage],
  )

  const viewedToken = tokenView ? data.tokens.find(t => t.id === tokenView) : undefined

  return (
    <div className="wisp-stage">
      <div className="wisp-frame">
        <NavContext.Provider value={nav}>
          <Header nav={nav} />
          {tokenView && viewedToken ? (
            <TokenScreen key={viewedToken.id} token={viewedToken} />
          ) : tab === 'home' ? (
            <HomeScreen />
          ) : tab === 'trade' ? (
            <TradeScreen />
          ) : tab === 'explore' ? (
            <ExploreScreen />
          ) : tab === 'activity' ? (
            <ActivityScreen />
          ) : (
            <SettingsScreen />
          )}
          <Dock nav={nav} onOpenSearch={() => setSearchOpen(true)} />

          <SearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} />
          <AccountSheet open={flow?.kind === 'accounts'} onClose={closeFlow} activeId={account.id} />
          <TokenEditorSheet open={flow?.kind === 'edit-token'} tokenId={flow?.tokenId} onClose={closeFlow} />
          <FlowSheets flow={flow} onClose={closeFlow} />
        </NavContext.Provider>
        <ToastHost toasts={toasts} />

        {!settings.disclaimerSeen ? (
          <DisclaimerDialog onAccept={() => useWisp.getState().setSettings({ disclaimerSeen: true })} />
        ) : null}
      </div>
    </div>
  )
}
