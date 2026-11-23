/* Wisp Wallet — bottom sheet with drag-to-dismiss, scrim, focus handling. */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { IconClose } from './icons'

export function Sheet({
  open,
  onClose,
  title,
  children,
  subtitle,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
}) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const [dragY, setDragY] = useState(0)
  const [grabbing, setGrabbing] = useState(false)
  const startY = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    setDragY(0)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY
    setGrabbing(true)
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (startY.current == null) return
    const dy = e.clientY - startY.current
    setDragY(Math.max(0, dy))
  }

  const onPointerUp = () => {
    if (startY.current == null) return
    if (dragY > 110) onClose()
    else setDragY(0)
    startY.current = null
    setGrabbing(false)
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div
        ref={sheetRef}
        className={`sheet ${grabbing ? 'grabbing' : ''}`}
        style={dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div
          className="sheet-handle-row"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="sheet-handle" />
        </div>
        <div className="sheet-title-row">
          <div>
            <h3>{title}</h3>
            {subtitle ? <div className="t-dim" style={{ fontSize: 12.5, marginTop: 2 }}>{subtitle}</div> : null}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </>
  )
}

/* ——— toasts ——— */

export type ToastKind = 'success' | 'error' | 'info'
export type ToastMsg = { id: number; kind: ToastKind; text: string }

let toastSeq = 1

export function useToasts() {
  const push = (kind: ToastKind, text: string) => {
    const id = toastSeq++
    window.dispatchEvent(new CustomEvent('wisp-toast', { detail: { id, kind, text } }))
  }
  return {
    success: (t: string) => push('success', t),
    error: (t: string) => push('error', t),
    info: (t: string) => push('info', t),
  }
}

export function ToastHost({ toasts }: { toasts: ToastMsg[] }) {
  return (
    <div className="toast-host" role="status" aria-live="polite">
      {toasts.filter(Boolean).map(t => (
        <div key={t.id} className={`toast ${t.kind}`}>
          {t.kind === 'success' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
          ) : t.kind === 'error' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="8.5" /><path d="M12 8v5M12 16h.01" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 8h.01" /></svg>
          )}
          {t.text}
        </div>
      ))}
    </div>
  )
}
