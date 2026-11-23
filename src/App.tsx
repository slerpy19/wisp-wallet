/* Wisp Wallet — application shell: tabs, header, sheets, toasts, theming,
 * market polling and the simulator disclaimer. */

import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'
import { NavContext, type FlowState, type Nav, type Tab } from './nav'
import { activeAccountOf, useWisp } from './lib/store'
import { useMarket } from './lib/market'
import { ToastHost, type ToastMsg } from './components/Sheet'
import {
  IconActivity, IconChevronDown, IconChevronLeft, IconExplore,
  IconHome, IconSettings, IconSwap,
} from './components/icons'
import { Avatar } from './components/Avatar'
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

const TAB_ITEMS: Array<{ id: Tab; label: string; Icon: (p: { width?: number; height?: number }) => ReactElement }> = [
  { id: 'home', label: 'Home', Icon: IconHome },
  { id: 'trade', label: 'Trade', Icon: IconSwap },
  { id: 'explore', label: 'Explore', Icon: IconExplore },
  { id: 'activity', label: 'Activity', Icon: IconActivity },
  { id: 'settings', label: 'Settings', Icon: IconSettings },
]

function TabBar({ tab, onSelect }: { tab: Tab; onSelect: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Primary">
      {TAB_ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`tab ${tab === id ? 'selected' : ''}`}
          onClick={() => onSelect(id)}
          aria-current={tab === id ? 'page' : undefined}
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}

function Header({
  nav,
  title,
  onBack,
  showEdit,
}: {
  nav: Nav
  title: string | null
  onBack: () => void
  showEdit: boolean
}) {
  const account = useWisp(s => activeAccountOf(s.data))

  if (title) {
    return (
      <header className="wisp-header">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <IconChevronLeft />
        </button>
        <div style={{ fontWeight: 800, fontSize: 16.5, flex: 1, textAlign: 'center', letterSpacing: '-0.01em' }}>
          {title}
        </div>
        {showEdit ? (
          <button
            className="icon-btn"
            onClick={() => nav.openFlow('edit-token', nav.tokenView ?? undefined)}
            aria-label="Edit this token"
          >
            <IconSettings />
          </button>
        ) : (
          <span style={{ width: 38 }} />
        )}
      </header>
    )
  }

  if (nav.tab !== 'home') {
    return (
      <header className="wisp-header">
        <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', padding: '4px 2px' }}>
          {{ trade: 'Swap', explore: 'Explore', activity: 'Activity', settings: 'Settings' }[nav.tab]}
        </div>
        <div className="header-spacer" />
        <button className="icon-btn" onClick={() => nav.openFlow('accounts')} aria-label="Switch account">
          <Avatar account={account} size={32} />
        </button>
      </header>
    )
  }

  return (
    <header className="wisp-header">
      <button className="header-account" onClick={() => nav.openFlow('accounts')} aria-label="Switch account">
        <Avatar account={account} size={36} />
        <span className="name">{account.name}</span>
        <span className="chev"><IconChevronDown width={15} height={15} /></span>
      </button>
      <div className="header-spacer" />
      <button className="icon-btn" onClick={() => nav.setTab('settings')} aria-label="Settings">
        <IconSettings />
      </button>
    </header>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [tokenView, setTokenView] = useState<string | null>(null)
  const [flow, setFlow] = useState<FlowState>(null)
  const [swapPreset, setSwapPreset] = useState<{ from?: string; to?: string } | null>(null)
  const [manage, setManage] = useState(false)
  const [toasts, setToasts] = useState<ToastMsg[]>([])

  const data = useWisp(s => s.data)
  const settings = data.settings
  const account = activeAccountOf(data)

  /* theme */
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', settings.theme === 'light' ? '#f3f1fa' : '#0a0910')
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
          <Header
            nav={nav}
            title={viewedToken?.symbol ?? null}
            onBack={() => setTokenView(null)}
            showEdit={Boolean(viewedToken)}
          />
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
          {viewedToken ? null : (
            <TabBar tab={tab} onSelect={t => { setTab(t); setTokenView(null) }} />
          )}

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
