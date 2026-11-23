/* Wisp Wallet — account avatar (emoji or uploaded image). */

import type { Account } from '../lib/types'

export function Avatar({ account, size = 36 }: { account: Account; size?: number }) {
  const cls = `avatar ${size === 32 ? 's36' : size === 42 ? 's42' : size === 52 ? 's52' : size === 64 ? 's64' : 's36'}`
  if (account.avatar.kind === 'image') {
    return (
      <span className={cls} style={{ width: size, height: size }}>
        <img src={account.avatar.value} alt="" />
      </span>
    )
  }
  return (
    <span className={cls} style={{ width: size, height: size, fontSize: size * 0.48 }}>
      {account.avatar.value}
    </span>
  )
}
