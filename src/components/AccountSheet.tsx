/* Wisp Wallet — account switcher & manager: switch, create, rename,
 * re-avatar, delete. Each account keeps its own holdings. */

import { useRef, useState } from 'react'
import { useWisp, AVATAR_CHOICES } from '../lib/store'
import { effectivePrice } from '../lib/engine'
import { compactMoney } from '../lib/format'
import { Sheet, useToasts } from './Sheet'
import { Avatar } from './Avatar'
import { IconCheck, IconEdit, IconPlus, IconTrash, IconUpload } from './icons'
import type { Account, Avatar as AvatarT, TokenMeta } from '../lib/types'

/** Per-account portfolio totals for the list. */
function computeAccountTotals(accounts: Account[], tokens: TokenMeta[]): Map<string, number> {
  const byId = new Map(tokens.map(t => [t.id, t]))
  const map = new Map<string, number>()
  for (const a of accounts) {
    let total = 0
    for (const h of a.holdings) {
      const t = byId.get(h.tokenId)
      if (t) total += effectivePrice(t) * h.qty
    }
    map.set(a.id, total)
  }
  return map
}

export function AccountSheet({
  open, onClose, activeId,
}: {
  open: boolean
  onClose: () => void
  activeId: string
}) {
  const accounts = useWisp(s => s.data.accounts)
  const tokens = useWisp(s => s.data.tokens)
  const totals = computeAccountTotals(accounts, tokens)

  const [editing, setEditing] = useState<Account | null>(null)
  const [creating, setCreating] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftAvatar, setDraftAvatar] = useState<AvatarT>({ kind: 'emoji', value: '🫧' })
  const fileRef = useRef<HTMLInputElement>(null)
  const uploadTarget = useRef<Account | null>(null)
  const toasts = useToasts()

  const reset = () => {
    setEditing(null)
    setCreating(false)
    setDraftName('')
    setDraftAvatar({ kind: 'emoji', value: '🫧' })
    uploadTarget.current = null
  }

  const close = () => {
    reset()
    onClose()
  }

  const commitCreate = () => {
    useWisp.getState().addAccount(draftName, draftAvatar)
    toasts.success(`Account “${draftName.trim() || 'New Account'}” created`)
    close()
  }

  const commitEdit = () => {
    if (!editing) return
    useWisp.getState().updateAccount(editing.id, { name: editing.name, avatar: editing.avatar })
    toasts.success('Account updated')
    close()
  }

  const pickAvatarFile = (target: Account | null) => {
    uploadTarget.current = target
    fileRef.current?.click()
  }

  const onAvatarFile = (file: File) => {
    if (file.size > 300_000) {
      toasts.error('Please pick an image under 300 KB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const value = String(reader.result)
      if (uploadTarget.current) {
        setEditing({ ...(uploadTarget.current as Account), avatar: { kind: 'image', value } })
      } else {
        setDraftAvatar({ kind: 'image', value })
      }
    }
    reader.onerror = () => toasts.error('Could not read that image')
    reader.readAsDataURL(file)
  }

  /* ——— edit / create form ——— */
  if (editing || creating) {
    const name = editing ? editing.name : draftName
    const avatar = editing ? editing.avatar : draftAvatar
    return (
      <Sheet open={open} onClose={close} title={editing ? 'Edit account' : 'New account'}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) onAvatarFile(f)
            e.target.value = ''
          }}
        />
        <div className="field">
          <label>Account name</label>
          <div className="input-shell">
            <input
              value={name}
              onChange={e => (editing
                ? setEditing({ ...editing, name: e.target.value })
                : setDraftName(e.target.value))}
              placeholder="e.g. Flex Account"
              maxLength={24}
            />
          </div>
        </div>

        <div className="field">
          <label>Avatar</label>
          <div className="emoji-grid" role="listbox" aria-label="Choose an emoji avatar">
            {AVATAR_CHOICES.map(e => {
              const selected = avatar.kind === 'emoji' && avatar.value === e
              return (
                <button
                  key={e}
                  className={selected ? 'selected' : ''}
                  onClick={() => (editing
                    ? setEditing({ ...editing, avatar: { kind: 'emoji', value: e } })
                    : setDraftAvatar({ kind: 'emoji', value: e }))}
                  aria-label={`Avatar ${e}`}
                  aria-pressed={selected}
                >
                  {e}
                </button>
              )
            })}
          </div>
          <div className="avatar-upload">
            <button
              className="btn btn-surface"
              style={{ minHeight: 38, fontSize: 13.5 }}
              onClick={() => pickAvatarFile(editing)}
            >
              <IconUpload />
              Upload image
            </button>
            {avatar.kind === 'image' ? (
              <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Custom image selected</span>
            ) : null}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          {editing && accounts.length > 1 ? (
            <button
              className="btn btn-danger"
              style={{ flex: 1 }}
              onClick={() => {
                useWisp.getState().deleteAccount(editing.id)
                toasts.info(`Deleted “${editing.name}”`)
                close()
              }}
            >
              <IconTrash />
              Delete
            </button>
          ) : null}
          <button className="btn btn-surface" style={{ flex: 1 }} onClick={close}>
            Cancel
          </button>
          <button
            className="btn btn-accent"
            style={{ flex: 1.4 }}
            disabled={!name.trim()}
            onClick={editing ? commitEdit : commitCreate}
          >
            {editing ? 'Save' : 'Create'}
          </button>
        </div>
      </Sheet>
    )
  }

  /* ——— list ——— */
  return (
    <Sheet open={open} onClose={close} title="Accounts" subtitle="Each account has its own tokens and balances">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {accounts.map(a => {
          const selected = a.id === activeId
          return (
            <div
              key={a.id}
              className={`account-row ${selected ? 'selected' : ''}`}
              onClick={() => {
                if (!selected) {
                  useWisp.getState().switchAccount(a.id)
                  toasts.info(`Switched to “${a.name}”`)
                }
                close()
              }}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (!selected) {
                    useWisp.getState().switchAccount(a.id)
                    toasts.info(`Switched to “${a.name}”`)
                  }
                  close()
                }
              }}
            >
              <Avatar account={a} size={44} />
              <div className="a-body">
                <div className="a-name">{a.name}</div>
                <div className="a-sub">{compactMoney(totals.get(a.id) ?? 0)}</div>
              </div>
              {selected ? <span className="pick-check"><IconCheck /></span> : null}
              <button
                className="a-edit"
                onClick={e => {
                  e.stopPropagation()
                  setEditing(a)
                }}
                aria-label={`Edit ${a.name}`}
              >
                <IconEdit />
              </button>
            </div>
          )
        })}
      </div>

      <button className="add-token-row" onClick={() => setCreating(true)}>
        <span className="plus-disc"><IconPlus /></span>
        New account
      </button>
      <p className="sheet-note">
        Switching accounts changes every balance on the Home screen. All
        accounts are stored locally in this browser only.
      </p>
    </Sheet>
  )
}
