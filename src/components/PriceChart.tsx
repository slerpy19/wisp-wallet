/* Wisp Wallet — interactive line chart.
 * Hand-rolled SVG chart: smooth bezier curve, gradient fill, crosshair with
 * tooltip on hover/touch, draw-in animation. Simulated history only. */

import { useCallback, useMemo, useRef, useState } from 'react'
import type { ChartRange } from '../lib/types'
import type { Point } from '../lib/history'
import { money } from '../lib/format'

const W = 100
const H = 100

function smoothPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length === 0) return ''
  if (pts.length < 3) {
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
  }
  // Catmull-Rom → cubic bezier for a silky curve
  let d = `M${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

function formatAxisTime(t: number, range: ChartRange): string {
  const d = new Date(t)
  switch (range) {
    case '1H': return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    case '1D': return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    case '1W': return d.toLocaleDateString('en-US', { weekday: 'short' })
    case '1M': return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    case '1Y': return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    default: return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
}

export function PriceChart({
  series,
  range,
  currency = 'USD',
  height,
  className,
}: {
  series: Point[]
  range: ChartRange
  currency?: string
  height?: number
  className?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [drawKey, setDrawKey] = useState(0)

  const { pts, line, area, minY, maxY } = useMemo(() => {
    if (series.length < 2) {
      return { pts: [], line: '', area: '', minY: 0, maxY: 0 }
    }
    const values = series.map(p => p.v)
    let lo = Math.min(...values)
    let hi = Math.max(...values)
    if (hi === lo) { hi *= 1.002; lo *= 0.998 }
    const pad = (hi - lo) * 0.12
    lo -= pad
    hi += pad
    const map = series.map((p, i) => ({
      x: (i / (series.length - 1)) * W,
      y: H - ((p.v - lo) / (hi - lo)) * H,
      v: p.v,
      t: p.t,
    }))
    const d = smoothPath(map)
    return {
      pts: map,
      line: d,
      area: `${d} L${W} ${H + 4} L0 ${H + 4} Z`,
      minY: lo,
      maxY: hi,
    }
  }, [series])

  const last = pts[pts.length - 1]
  const up = series.length >= 2 && series[series.length - 1].v >= series[0].v
  const stroke = up ? 'var(--green)' : 'var(--red)'

  const handleMove = useCallback((clientX: number) => {
    const el = wrapRef.current
    if (!el || pts.length === 0) return
    const rect = el.getBoundingClientRect()
    const rel = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const idx = Math.round(rel * (pts.length - 1))
    setHover(idx)
  }, [pts.length])

  const hoverPoint = hover != null ? pts[hover] : undefined

  if (pts.length === 0) {
    return (
      <div className={`chart-wrap ${className ?? ''}`} style={{ height }} aria-label="Chart unavailable">
        <div className="empty-state" style={{ padding: 20 }}>
          <p>Not enough data to draw a chart.</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={wrapRef}
      className={`chart-wrap ${className ?? ''}`}
      style={{ height }}
      onPointerMove={e => handleMove(e.clientX)}
      onPointerDown={e => handleMove(e.clientX)}
      onPointerLeave={() => setHover(null)}
      onPointerUp={() => window.setTimeout(() => setHover(null), 900)}
      role="img"
      aria-label={`Price chart, ${range} range`}
      key={drawKey}
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`fill-${up ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#fill-${up ? 'up' : 'down'})`} className="chart-area" />
        <path
          d={line}
          fill="none"
          stroke={stroke}
          strokeWidth="2.2"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="chart-line"
        />
        {hoverPoint ? (
          <line
            x1={hoverPoint.x} x2={hoverPoint.x} y1={0} y2={H}
            stroke="var(--text-3)" strokeWidth="1" vectorEffect="non-scaling-stroke"
            strokeDasharray="3 3" opacity="0.7"
          />
        ) : null}
      </svg>
      {hoverPoint ? (
        <>
          <span
            className="chart-dot"
            style={{
              left: `${(hoverPoint.x / W) * 100}%`,
              top: `${(hoverPoint.y / H) * 100}%`,
              background: stroke,
            }}
          />
          <div
            className="chart-tooltip"
            style={{ left: `${Math.min(88, Math.max(12, (hoverPoint.x / W) * 100))}%`, top: 0 }}
          >
            {money(hoverPoint.v, currency as 'USD')}
            <span className="tt-time">{formatAxisTime(hoverPoint.t, range)}</span>
          </div>
        </>
      ) : null}
      <span
        className="chart-dot chart-dot-end"
        style={{ left: `${(last.x / W) * 100}%`, top: `${(last.y / H) * 100}%`, background: stroke }}
      />
    </div>
  )
}

/** Redraw-in animation when the series changes shape. */
export function useChartRedraw(dep: unknown): number {
  const [key, setKey] = useState(0)
  const prev = useRef(dep)
  if (prev.current !== dep) {
    prev.current = dep
    setKey(k => k + 1)
  }
  return key
}
