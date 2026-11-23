/* Wisp Wallet — Activity: locally simulated transaction history. */

import { useMemo } from 'react'
import { useWisp, txKindIcon } from '../lib/store'
import { relativeTime, money, qty as fmtQty } from '../lib/format'
import { TokenIcon } from '../components/TokenIcon'
import { EmptyState, SectionHead } from '../components/common'
import {
  IconActivity, IconArrowDown, IconArrowUp, IconBuy, IconSwap,
} from '../components/icons'

export function ActivityScreen() {
  const transactions = useWisp(s => s.data.transactions)
  const accounts = useWisp(s => s.data.accounts)
  const settings = useWisp(s => s.data.settings)

  const accountName = useMemo(() => {
    const m = new Map(accounts.map(a => [a.id, a.name]))
    return (id: string) => m.get(id) ?? 'Account'
  }, [accounts])

  const rows = useMemo(
    () => transactions.filter(t => t.accountId === useWisp.getState().data.activeAccountId),
    [transactions],
  )

  return (
    <div className="screen">
      {rows.length === 0 ? (
        <EmptyState
          title="No simulated activity yet"
          body="Sends, receives, swaps and demo purchases will appear here. Everything is fictional and stored only on this device."
          icon={<IconActivity />}
        />
      ) : (
        <>
          <SectionHead title="Recent" action={<span className="t-dim" style={{ fontSize: 12 }}>{rows.length} simulated</span>} />
          <div className="asset-list" style={{ gap: 2 }}>
            {rows.slice(0, 80).map(tx => {
              const Icon =
                tx.kind === 'sent' ? IconArrowUp
                : tx.kind === 'received' ? IconArrowDown
                : tx.kind === 'swapped' ? IconSwap
                : IconBuy
              const token = useWisp.getState().data.tokens.find(t => t.id === tx.tokenId)
              return (
                <div key={tx.id} className="tx-row">
                  {token ? (
                    <TokenIcon token={token} size={40} showChain={false} />
                  ) : (
                    <span className={`tx-icon ${tx.kind}`}><Icon /></span>
                  )}
                  <div className="tx-body">
                    <div className="t1">
                      {kindLabel(tx.kind)}
                      <span className="t-dim" style={{ fontSize: 12.5 }}>{tx.symbol}</span>
                      {tx.kind === 'swapped' && tx.outSymbol ? (
                        <span className="t-dim" style={{ fontSize: 12.5 }}>→ {tx.outSymbol}</span>
                      ) : null}
                    </div>
                    <div className="t2">
                      {tx.counterparty} · {relativeTime(tx.ts)}
                    </div>
                  </div>
                  <div className="tx-side">
                    <div className="v1 num">
                      {tx.kind === 'sent' ? '-' : tx.kind === 'received' || tx.kind === 'bought' ? '+' : ''}
                      {fmtQty(tx.amount)} {tx.symbol}
                    </div>
                    <div className="v2 num">
                      {tx.kind === 'swapped' && tx.outAmount
                        ? `→ ${fmtQty(tx.outAmount)} ${tx.outSymbol}`
                        : money(tx.usdValue, settings.currency)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="sheet-note" style={{ padding: '14px 22px 0', textAlign: 'center' }}>
            Transactions exist only in this browser. {accountName(rows[0]?.accountId ?? '')} never touched a blockchain.
          </p>
        </>
      )}
      <div style={{ height: 6 }} />
    </div>
  )
}

function kindLabel(kind: 'sent' | 'received' | 'swapped' | 'bought'): string {
  switch (kind) {
    case 'sent': return 'Sent'
    case 'received': return 'Received'
    case 'swapped': return 'Swapped'
    case 'bought': return 'Bought'
  }
}

export { txKindIcon }
