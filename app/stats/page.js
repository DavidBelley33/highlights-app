'use client'

import { useEffect, useState } from 'react'
import { getHighlights } from '@/lib/highlights'
import { getCategories } from '@/lib/categories'

const COLORS = [
  '#E64B32', '#F5A623', '#9B59B6', '#3498DB', '#2ECC71',
  '#E67E22', '#1ABC9C', '#E74C3C', '#F39C12', '#8E44AD',
  '#27AE60', '#2980B9', '#D35400', '#CB4335', '#A569BD',
]

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({ data, total, hoveredId, onHover }) {
  const size = 260
  const cx = size / 2
  const cy = size / 2
  const r = 90
  const strokeWidth = 34
  const circumference = 2 * Math.PI * r
  const gap = 2

  let cumulative = 0

  const hovered = data.find((d) => d.value === hoveredId)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />

      {data.map((item) => {
        const pct = item.count / total
        const dash = Math.max(0, pct * circumference - gap)
        const offset = circumference * (1 - cumulative)
        cumulative += pct

        return (
          <circle
            key={item.value}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={item.color}
            strokeWidth={hoveredId === item.value ? strokeWidth + 6 : strokeWidth}
            strokeDasharray={`${dash} ${circumference}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: 'stroke-width 0.2s ease', cursor: 'pointer' }}
            onMouseEnter={() => onHover(item.value)}
            onMouseLeave={() => onHover(null)}
          />
        )
      })}

      {/* Center — count */}
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#F5EDE8" fontSize="34" fontWeight="700" fontFamily="Inter, sans-serif">
        {hovered ? hovered.count : total}
      </text>
      {/* Center — label */}
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#8C7570" fontSize="12" fontFamily="Inter, sans-serif">
        {hovered ? hovered.label : 'highlights'}
      </text>
      {hovered && (
        <text x={cx} y={cy + 32} textAnchor="middle" fill={hovered.color} fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif">
          {hovered.pct}%
        </text>
      )}
    </svg>
  )
}

// ─── Mini stat card ───────────────────────────────────────────────────────────

function MiniStat({ label, value }) {
  return (
    <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px 20px' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#8C7570', marginBottom: '6px' }}>
        {label}
      </p>
      <p style={{ fontSize: '14px', fontWeight: 600, color: '#F5EDE8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const [highlights, setHighlights] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState('tout')
  const [hoveredId, setHoveredId] = useState(null)

  useEffect(() => {
    Promise.all([getHighlights(), getCategories()])
      .then(([hlts, cats]) => { setHighlights(hlts); setCategories(cats) })
      .finally(() => setLoading(false))
  }, [])

  const years = [...new Set(highlights.map((h) => h.week_date.slice(0, 4)))].sort((a, b) => b - a)
  const filtered = year === 'tout' ? highlights : highlights.filter((h) => h.week_date.startsWith(year))

  // Group by category
  const catMap = {}
  filtered.forEach((h) => { catMap[h.category] = (catMap[h.category] || 0) + 1 })

  const chartData = Object.entries(catMap)
    .map(([value, count], i) => {
      const cat = categories.find((c) => c.value === value)
      return {
        value,
        label: cat?.label ?? value,
        emoji: cat?.emoji ?? '⭐',
        count,
        color: COLORS[i % COLORS.length],
        pct: Math.round((count / filtered.length) * 100),
      }
    })
    .sort((a, b) => b.count - a.count)
    .map((item, i) => ({ ...item, color: COLORS[i % COLORS.length] }))

  // Secondary stats
  const monthCounts = {}
  filtered.forEach((h) => {
    const m = h.week_date.slice(0, 7)
    monthCounts[m] = (monthCounts[m] || 0) + 1
  })
  const topMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]
  const topMonthLabel = topMonth
    ? new Date(topMonth[0] + '-02').toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' })
    : '—'

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Back */}
      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#8C7570', textDecoration: 'none', marginBottom: '28px' }}
        onMouseOver={(e) => e.currentTarget.style.color = '#E64B32'}
        onMouseOut={(e) => e.currentTarget.style.color = '#8C7570'}
      >
        ← Retour
      </a>

      <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px', color: '#F5EDE8', marginBottom: '24px' }}>
        Statistiques
      </h1>

      {/* Year filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {['tout', ...years].map((y) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            style={{
              padding: '6px 18px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: year === y ? 'linear-gradient(135deg, #E64B32, #6E1226)' : 'rgba(255,255,255,0.06)',
              color: year === y ? '#FAE8D0' : '#8C7570',
              transition: 'all 0.2s ease',
            }}
          >
            {y === 'tout' ? 'Tout' : y}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#8C7570' }}>Chargement…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#8C7570', textAlign: 'center', padding: '60px 0' }}>Aucun highlight pour cette période.</p>
      ) : (
        <>
          {/* Donut chart */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <DonutChart data={chartData} total={filtered.length} hoveredId={hoveredId} onHover={setHoveredId} />
          </div>

          {/* Category breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '40px' }}>
            {chartData.map((item) => (
              <div
                key={item.value}
                onMouseEnter={() => setHoveredId(item.value)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  background: hoveredId === item.value ? '#1C1C1C' : '#141414',
                  border: `1px solid ${hoveredId === item.value ? item.color + '50' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  cursor: 'default',
                }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: '18px' }}>{item.emoji}</span>
                <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#F5EDE8', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
                <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: '2px', transition: 'width 0.4s ease' }} />
                </div>
                <span style={{ fontSize: '13px', color: '#8C7570', minWidth: '72px', textAlign: 'right', flexShrink: 0 }}>
                  {item.count} · {item.pct}%
                </span>
              </div>
            ))}
          </div>

          {/* Secondary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <MiniStat label="Total" value={`${filtered.length} highlights`} />
            <MiniStat label="Mois le plus actif" value={topMonthLabel} />
            <MiniStat label="Catégories actives" value={`${chartData.length} catégorie${chartData.length > 1 ? 's' : ''}`} />
          </div>
        </>
      )}
    </div>
  )
}
