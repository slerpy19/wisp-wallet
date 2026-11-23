/* Wisp Wallet — Settings: wallet identity, appearance, currency, formatting,
 * data export/import, reset. Everything persists locally. */

import { useRef, useState } from 'react'
import { useNav } from '../nav'
import { activeAccountOf, useWisp } from '../lib/store'
import { useMarket } from '../lib/market'
import { useToasts } from '../components/Sheet'
import { Avatar } from '../components/Avatar'
import { IconInfo, IconUpload, IconGlobe, IconEye, IconShield, IconTrash, IconWallet, IconEdit, IconCopy, IconRefresh, IconStar } from '../components/icons'
import type { Currency, Settings as SettingsType, Theme } from '../lib/types'

export function SettingsScreen() {
  const nav = useNav()
  const data = useWisp(s => s.data)
  const settings = data.settings
  const account = activeAccountOf(data)
  const toasts = useToasts()
  const market = useMarket(s => s.status)

  const [exportText, setExportText] = useState('')
  const [importText, setImportText] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const importFileRef = useRef<HTMLInputElement>(null)

  const set = (patch: Partial<SettingsType>) => useWisp.getState().setSettings(patch)

  const doExport = () => {
    const json = JSON.stringify({ app: 'wisp-wallet', exportedAt: new Date().toISOString(), data: useWisp.getState().data }, null, 2)
    setExportText(json)
    navigator.clipboard?.writeText(json).then(
      () => toasts.success('Configuration copied to clipboard'),
      () => toasts.info('Configuration shown below — copy it manually'),
    )
    // also offer a download
    try {
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'wisp-wallet-config.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* download blocked — textarea copy still works */ }
  }

  const doImportText = () => {
    const ok = useWisp.getState().importData(importText)
    if (ok) {
      toasts.success('Configuration imported')
      setImportText('')
    } else {
      toasts.error('That JSON doesn’t look like a Wisp configuration')
    }
  }

  const doImportFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const ok = useWisp.getState().importData(String(reader.result))
      if (ok) toasts.success('Configuration imported from file')
      else toasts.error('Could not read that file as a Wisp configuration')
    }
    reader.onerror = () => toasts.error('Could not read that file')
    reader.readAsText(file)
  }

  return (
    <div className="screen">
      {/* profile */}
      <div className="settings-profile">
        <Avatar account={account} size={52} />
        <div className="who">
          <div className="w-name">{settings.walletName}</div>
          <div className="w-sub">{account.name} · {account.address.slice(0, 18)}…</div>
        </div>
        <button className="icon-btn" onClick={() => nav.openFlow('wallet-name')} aria-label="Edit wallet name">
          <IconEdit />
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <span className="chip"><IconShield width={12} height={12} /> Simulator — no keys, no funds, no chain</span>
      </div>

      {/* preferences */}
      <div className="setting-group">
        <SettingRowSelect
          icon={<IconGlobe />}
          title="Currency"
          sub="Display currency for all values"
          value={settings.currency}
          options={[
            { value: 'USD', label: 'USD ($)' },
            { value: 'EUR', label: 'EUR (€)' },
            { value: 'GBP', label: 'GBP (£)' },
          ]}
          onChange={v => set({ currency: v as Currency })}
        />
        <SettingRowToggle
          icon={<IconEye />}
          title="Hide balances"
          sub="Mask amounts everywhere in the app"
          on={settings.hideBalances}
          onChange={v => set({ hideBalances: v })}
        />
        <SettingRowToggle
          icon={<IconRefresh />}
          title="Live prices"
          sub={`Fetch real quotes from CoinGecko · ${market}`}
          on={settings.livePrices}
          onChange={v => set({ livePrices: v })}
        />
        <SettingRowToggle
          icon={<IconStar />}
          title="Dark appearance"
          sub="Switch between dark and light themes"
          on={settings.theme === 'dark'}
          onChange={v => set({ theme: (v ? 'dark' : 'light') as Theme })}
        />
        <SettingRowToggle
          icon={<IconInfo />}
          title="Demo watermark"
          sub="Show the DEMO chip on the home screen"
          on={settings.watermark}
          onChange={v => set({ watermark: v })}
        />
        <SettingRowSelect
          icon={<IconWallet />}
          title="Quantity decimals"
          sub="Precision for token amounts"
          value={String(settings.qtyDecimals)}
          options={[
            { value: 'auto', label: 'Automatic' },
            { value: '0', label: '0' },
            { value: '2', label: '2' },
            { value: '4', label: '4' },
            { value: '6', label: '6' },
          ]}
          onChange={v => set({ qtyDecimals: v === 'auto' ? 'auto' : (Number(v) as 0 | 2 | 4 | 6) })}
        />
      </div>

      {/* manage */}
      <div className="setting-group">
        <button className="setting-row" onClick={() => nav.openFlow('accounts')}>
          <span className="s-icon"><Avatar account={account} size={22} /></span>
          <span className="s-body">
            <span className="s-title">Manage accounts</span>
            <span className="s-sub">{data.accounts.length} account{data.accounts.length > 1 ? 's' : ''} · switch, rename, delete</span>
          </span>
        </button>
        <button className="setting-row" onClick={() => { nav.setTab('home'); nav.setManage(true) }}>
          <span className="s-icon"><IconEdit /></span>
          <span className="s-body">
            <span className="s-title">Manage tokens</span>
            <span className="s-sub">Reorder, hide, edit or delete tokens on Home</span>
          </span>
        </button>
        <button className="setting-row" onClick={() => useWisp.getState().setSettings({ disclaimerSeen: false })}>
          <span className="s-icon"><IconInfo /></span>
          <span className="s-body">
            <span className="s-title">Show the simulator notice</span>
            <span className="s-sub">See the welcome card again</span>
          </span>
        </button>
      </div>

      {/* data */}
      <div className="setting-group">
        <div className="setting-row" style={{ display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="s-icon"><IconUpload /></span>
            <span className="s-body">
              <span className="s-title">Export configuration</span>
              <span className="s-sub">Download or copy this wallet as JSON</span>
            </span>
            <button className="btn btn-surface" style={{ minHeight: 36, fontSize: 13, padding: '0 14px' }} onClick={doExport}>
              Export
            </button>
          </div>
          {exportText ? (
            <textarea className="export-area" readOnly value={exportText} style={{ marginTop: 10 }} onClick={e => (e.target as HTMLTextAreaElement).select()} />
          ) : null}
        </div>
        <div className="setting-row" style={{ display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="s-icon"><IconCopy /></span>
            <span className="s-body">
              <span className="s-title">Import configuration</span>
              <span className="s-sub">Paste JSON or load a file</span>
            </span>
            <button className="btn btn-surface" style={{ minHeight: 36, fontSize: 13, padding: '0 14px' }} onClick={() => importFileRef.current?.click()}>
              Choose file
            </button>
          </div>
          <input
            ref={importFileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) doImportFile(f)
              e.target.value = ''
            }}
          />
          <div style={{ marginTop: 10 }}>
            <textarea
              className="export-area"
              placeholder="Paste a Wisp wallet configuration JSON here…"
              value={importText}
              onChange={e => setImportText(e.target.value)}
            />
            <button
              className="btn btn-accent btn-block"
              style={{ marginTop: 10, minHeight: 40 }}
              disabled={!importText.trim()}
              onClick={doImportText}
            >
              Import
            </button>
          </div>
        </div>
      </div>

      {/* danger */}
      <div className="setting-group danger-zone">
        <button className="setting-row" onClick={() => setConfirmReset(true)}>
          <span className="s-icon" style={{ color: 'var(--red)', background: 'var(--red-soft)' }}><IconTrash /></span>
          <span className="s-body">
            <span className="s-title" style={{ color: 'var(--red)' }}>Reset simulated wallet</span>
            <span className="s-sub">Restore the default demo accounts and tokens</span>
          </span>
        </button>
      </div>

      {confirmReset ? (
        <>
          <div className="sheet-backdrop" onClick={() => setConfirmReset(false)} />
          <div className="dialog-center">
            <div className="dialog-card">
              <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800 }}>Reset everything?</h3>
              <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
                This clears all accounts, custom tokens, balances and history from
                this browser and restores the original demo wallet.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-surface" style={{ flex: 1 }} onClick={() => setConfirmReset(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                  onClick={() => {
                    useWisp.getState().resetAll()
                    setConfirmReset(false)
                    toasts.success('Simulated wallet reset')
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <p className="sheet-note" style={{ padding: '6px 24px 4px', textAlign: 'center' }}>
        Wisp Wallet 1.0 · a Phantom-inspired interface simulator.<br />
        Not affiliated with any wallet provider. No seeds, keys or funds — ever.
      </p>
      <div style={{ height: 6 }} />
    </div>
  )
}

function SettingRowToggle({
  icon, title, sub, on, onChange,
}: {
  icon: React.ReactNode
  title: string
  sub: string
  on: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="setting-row" role="group" aria-label={title}>
      <span className="s-icon">{icon}</span>
      <span className="s-body">
        <span className="s-title">{title}</span>
        <span className="s-sub">{sub}</span>
      </span>
      <button
        className={`toggle ${on ? 'on' : ''}`}
        onClick={() => onChange(!on)}
        role="switch"
        aria-checked={on}
        aria-label={title}
      />
    </div>
  )
}

function SettingRowSelect({
  icon, title, sub, value, options, onChange,
}: {
  icon: React.ReactNode
  title: string
  sub: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (v: string) => void
}) {
  return (
    <div className="setting-row">
      <span className="s-icon">{icon}</span>
      <span className="s-body">
        <span className="s-title">{title}</span>
        <span className="s-sub">{sub}</span>
      </span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={title}
        style={{
          background: 'var(--surface-3)', borderRadius: 999, padding: '7px 14px',
          fontSize: 13, fontWeight: 700, color: 'var(--text)', appearance: 'none',
          WebkitAppearance: 'none', border: 0, cursor: 'pointer',
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
