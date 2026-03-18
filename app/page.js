'use client'

import { useEffect, useState } from 'react'
import { getHighlights, getPhotoUrl } from '@/lib/highlights'
import { getCategories } from '@/lib/categories'
import { formatDate } from '@/lib/constants'

// ─── Stats helpers ────────────────────────────────────────────────────────────

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function computeStreak(highlights) {
  if (!highlights.length) return 0
  const weeks = new Set(highlights.map((h) => {
    const [y, m, d] = h.week_date.split('-').map(Number)
    return getMonday(new Date(y, m - 1, d))
  }))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let monday = getMonday(today)
  if (!weeks.has(monday)) monday -= 7 * 24 * 60 * 60 * 1000
  let streak = 0
  while (weeks.has(monday) && streak < 104) {
    streak++
    monday -= 7 * 24 * 60 * 60 * 1000
  }
  return streak
}

function daysSinceText(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24))
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Il y a 1 jour'
  return `Il y a ${diff} jours`
}

// ─── Insight logic ────────────────────────────────────────────────────────────

const MONTH_NAMES = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getMondayDate(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function computeInsight(highlights, categories) {
  if (!highlights.length) {
    return "Capture ton premier highlight de la semaine pour commencer à voir les patterns de ta vie."
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const now = new Date()

  // ── Rule 1 : catégorie absente 30+ jours ──
  const catLastDate = {}
  highlights.forEach((h) => {
    const d = parseDate(h.week_date)
    if (!catLastDate[h.category] || d > catLastDate[h.category]) catLastDate[h.category] = d
  })

  let absentCat = null
  let absentDays = 0
  Object.entries(catLastDate).forEach(([val, lastDate]) => {
    const days = Math.floor((today - lastDate) / 864e5)
    if (days >= 30 && days > absentDays) { absentDays = days; absentCat = val }
  })
  if (absentCat) {
    const cat = categories.find((c) => c.value === absentCat)
    const weeks = Math.floor(absentDays / 7)
    const label = cat ? `${cat.emoji} ${cat.label}` : absentCat
    return `Ça fait ${weeks} semaine${weeks > 1 ? 's' : ''} sans highlight ${label}. 🌿`
  }

  // ── Rule 2 : catégorie dominante ce mois ──
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const monthH = highlights.filter((h) => {
    const d = parseDate(h.week_date)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })
  if (monthH.length >= 3) {
    const counts = {}
    monthH.forEach((h) => { counts[h.category] = (counts[h.category] || 0) + 1 })
    const [topVal, topCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    const pct = Math.round((topCount / monthH.length) * 100)
    if (pct >= 60) {
      const cat = categories.find((c) => c.value === topVal)
      const label = cat ? `${cat.emoji} ${cat.label}` : topVal
      return `Ce mois-ci, ${pct}% de tes moments forts impliquent ${label}.`
    }
  }

  // ── Rule 3 : meilleure semaine ──
  const currentMonday = getMondayDate(today)
  const weekCounts = {}
  highlights.forEach((h) => {
    const ts = getMondayDate(parseDate(h.week_date)).getTime()
    weekCounts[ts] = (weekCounts[ts] || 0) + 1
  })
  const currentWeekCount = weekCounts[currentMonday.getTime()] || 0
  const pastMax = Math.max(0, ...Object.entries(weekCounts)
    .filter(([ts]) => parseInt(ts) < currentMonday.getTime())
    .map(([, c]) => c))
  if (currentWeekCount > 0 && pastMax > 0 && currentWeekCount >= pastMax) {
    return "Tu es en route pour ta meilleure semaine de l'année 🔥"
  }

  // ── Rule 4 : streak 4+ semaines ──
  const streak = computeStreak(highlights)
  if (streak >= 4) {
    return `${streak} semaines consécutives de highlights. Continue comme ça 💪`
  }

  // ── Rule 5 : plus actif ce mois que le précédent ──
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear
  const lastMonthH = highlights.filter((h) => {
    const d = parseDate(h.week_date)
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
  })
  if (monthH.length > lastMonthH.length && lastMonthH.length > 0) {
    return `Tu es plus actif ce mois-ci qu'en ${MONTH_NAMES[lastMonth]}. Belle énergie.`
  }

  // ── Rule 6 : défaut ──
  return "Capture ton premier highlight de la semaine pour commencer à voir les patterns de ta vie."
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [highlights, setHighlights] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('cards')
  const [celebratedCat, setCelebratedCat] = useState(null)

  useEffect(() => {
    Promise.all([getHighlights(), getCategories()])
      .then(([h, cats]) => { setHighlights(h); setCategories(cats) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const celebrated = params.get('celebrated')
    if (celebrated) {
      setCelebratedCat(celebrated)
      window.history.replaceState({}, '', '/')
      setTimeout(() => setCelebratedCat(null), 1500)
    }
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '96px 0', color: '#8C7570' }}>
        Chargement…
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', padding: '16px', color: '#f87171' }}>
        Erreur : {error}
      </div>
    )
  }

  if (highlights.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '96px 0', textAlign: 'center' }}>
        <span style={{ fontSize: '48px' }}>✦</span>
        <p style={{ color: '#8C7570' }}>Pas encore de highlights. Commence par en ajouter un !</p>
        <a href="/highlights/new" style={{
          background: 'linear-gradient(135deg, #E64B32, #6E1226)',
          borderRadius: '20px',
          padding: '10px 24px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#FAE8D0',
          textDecoration: 'none',
        }}>
          + Nouveau highlight
        </a>
      </div>
    )
  }

  // Derived data
  const categoryCounts = categories
    .map((cat) => ({ ...cat, count: highlights.filter((h) => h.category === cat.value).length }))
    .sort((a, b) => b.count - a.count)
  const maxCount = categoryCounts[0]?.count ?? 1
  const topCategory = categoryCounts[0]
  const streak = computeStreak(highlights)
  const lastHighlightText = highlights[0] ? daysSinceText(highlights[0].week_date) : '—'
  const recent = highlights.slice(0, 5)

  const byYear = highlights.reduce((acc, h) => {
    const year = parseInt(h.week_date.split('-')[0])
    if (!acc[year]) acc[year] = []
    acc[year].push(h)
    return acc
  }, {})
  const years = Object.keys(byYear).sort((a, b) => b - a)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

      {/* ── Stats Bar ── */}
      <div className="hl-stats-grid">
        <StatCard icon="🔥" value={highlights.length} label="highlights" />
        <StatCard icon="⚡" value={streak} label={streak > 1 ? 'semaines streak' : 'semaine streak'} />
        <StatCard icon="👑" value={topCategory ? `${topCategory.emoji} ${topCategory.label}` : '—'} label="catégorie top" isText />
        <StatCard icon="📅" value={lastHighlightText} label="dernier highlight" isText />
      </div>

      {/* ── Insight ── */}
      <InsightCard text={computeInsight(highlights, categories)} />

      {/* ── Category Gallery ── */}
      {categoryCounts.length > 0 && (
        <section>
          <SectionTitle>Catégories</SectionTitle>
          <div className="hl-cat-grid">
            {categoryCounts.map((cat) => (
              <div key={cat.id} onClick={() => { window.location.href = `/categories/${cat.value}` }} style={{ cursor: 'pointer' }}>
                <CategoryCard cat={cat} maxCount={maxCount} isTop={cat.id === topCategory?.id} isCelebrated={celebratedCat === cat.value} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Récents ── */}
      <section>
        <SectionTitle>Récents</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recent.map((h) => {
            const cat = categories.find((c) => c.value === h.category) ?? { emoji: '⭐', label: h.category }
            const secCat = h.secondary_category ? categories.find((c) => c.value === h.secondary_category) : null
            return <RecentCard key={h.id} highlight={h} cat={cat} secCat={secCat} />
          })}
        </div>
      </section>

      {/* ── All Highlights ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <SectionTitle noMargin>Tous les highlights</SectionTitle>
          <ViewToggle view={view} setView={setView} />
        </div>

        {view === 'cards' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {years.map((year) => (
              <section key={year}>
                <p style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#8C7570', marginBottom: '12px' }}>
                  {year}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {byYear[year].map((h) => {
                    const cat = categories.find((c) => c.value === h.category) ?? { emoji: '⭐', label: h.category }
                    const secCat = h.secondary_category ? categories.find((c) => c.value === h.secondary_category) : null
                    return <RecentCard key={h.id} highlight={h} cat={cat} secCat={secCat} />
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <HighlightTable years={years} byYear={byYear} categories={categories} />
        )}
      </section>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InsightCard({ text }) {
  return (
    <div className="hl-insight-card" style={{
      background: '#141414',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    }}>
      <span style={{ fontSize: '16px', color: '#E64B32', flexShrink: 0, marginTop: '1px' }}>✦</span>
      <div>
        <p style={{ fontSize: '14px', color: '#F5EDE8', lineHeight: 1.5, margin: 0 }}>{text}</p>
        <p style={{ fontSize: '12px', color: '#8C7570', margin: '4px 0 0' }}>Basé sur tes highlights des 30 derniers jours</p>
      </div>
    </div>
  )
}

function SectionTitle({ children, noMargin }) {
  return (
    <p style={{
      fontSize: '13px',
      fontWeight: 600,
      letterSpacing: '2px',
      textTransform: 'uppercase',
      color: '#8C7570',
      marginBottom: noMargin ? 0 : '16px',
    }}>
      {children}
    </p>
  )
}

function StatCard({ icon, value, label, isText }) {
  return (
    <div style={{
      background: '#141414',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px',
      padding: '16px 20px',
    }}>
      <div style={{ fontSize: '18px', marginBottom: '6px' }}>{icon}</div>
      <div style={{
        fontSize: isText ? '15px' : '22px',
        fontWeight: 700,
        color: '#E64B32',
        marginBottom: '2px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#8C7570' }}>
        {label}
      </div>
    </div>
  )
}

function CategoryCard({ cat, maxCount, isTop, isCelebrated }) {
  const pct = maxCount > 0 ? (cat.count / maxCount) * 100 : 0
  return (
    <div style={{
      position: 'relative',
      background: '#141414',
      border: `1px solid ${isTop || isCelebrated ? 'rgba(230,75,50,0.4)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: '16px',
      height: '140px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden',
      boxShadow: isTop || isCelebrated ? '0 0 20px rgba(230,75,50,0.15)' : 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      animation: isCelebrated ? 'cat-celebrate 1.5s ease forwards' : 'none',
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.borderColor = 'rgba(230,75,50,0.3)'
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.borderColor = isTop ? 'rgba(230,75,50,0.4)' : 'rgba(255,255,255,0.06)'
    }}>
      <span style={{ fontSize: '32px', lineHeight: 1 }}>{cat.emoji}</span>
      <div style={{ position: 'relative' }}>
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#F5EDE8', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {cat.label}
        </p>
        <p style={{ fontSize: '13px', color: '#8C7570', position: 'relative' }}>
          {cat.count} highlight{cat.count > 1 ? 's' : ''}
          {isCelebrated && (
            <span style={{
              position: 'absolute',
              left: 0,
              top: 0,
              fontSize: '12px',
              fontWeight: 700,
              color: '#E64B32',
              animation: 'plusone 0.8s ease forwards',
              pointerEvents: 'none',
            }}>+1</span>
          )}
        </p>
      </div>
      {cat.count > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '4px',
          width: `${pct}%`,
          background: 'linear-gradient(135deg, #E64B32, #6E1226)',
          borderRadius: '0 4px 0 0',
        }} />
      )}
      <style>{`
        @keyframes cat-celebrate {
          0%   { transform: scale(1);    box-shadow: 0 0 0px rgba(230,75,50,0); }
          20%  { transform: scale(1.04); box-shadow: 0 0 30px rgba(230,75,50,0.4); }
          70%  { transform: scale(1.04); box-shadow: 0 0 30px rgba(230,75,50,0.4); }
          100% { transform: scale(1);    box-shadow: 0 0 20px rgba(230,75,50,0.15); }
        }
        @keyframes plusone {
          0%   { opacity: 1; transform: translateY(0); }
          60%  { opacity: 1; transform: translateY(-12px); }
          100% { opacity: 0; transform: translateY(-18px); }
        }
      `}</style>
    </div>
  )
}

function RecentCard({ highlight: h, cat, secCat }) {
  return (
    <a href={`/highlights/${h.id}`} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      background: '#141414',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px',
      padding: '16px 20px',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.background = '#1C1C1C'
      e.currentTarget.querySelector('.arrow').style.color = '#E64B32'
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.background = '#141414'
      e.currentTarget.querySelector('.arrow').style.color = '#8C7570'
    }}>
      <div style={{ position: 'relative', flexShrink: 0, width: '32px', height: '32px' }}>
        <span style={{ fontSize: '28px', lineHeight: 1 }}>{cat.emoji}</span>
        {secCat && (
          <span style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-8px',
            fontSize: '14px',
            lineHeight: 1,
            background: '#141414',
            borderRadius: '50%',
            padding: '1px',
          }}>{secCat.emoji}</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: '#F5EDE8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {h.title}
        </p>
        <p style={{ fontSize: '13px', color: '#8C7570', marginTop: '2px' }}>
          {cat.label} · {formatDate(h.week_date)}
        </p>
      </div>
      <span className="arrow" style={{ color: '#8C7570', flexShrink: 0, fontSize: '18px', transition: 'color 0.2s ease' }}>→</span>
    </a>
  )
}

function ViewToggle({ view, setView }) {
  return (
    <div style={{
      display: 'flex',
      background: '#141414',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '20px',
      padding: '3px',
      gap: '2px',
    }}>
      {[
        { id: 'cards', label: '▦ Cartes' },
        { id: 'table', label: '≡ Table' },
      ].map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setView(id)}
          style={{
            padding: '5px 14px',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            background: view === id ? '#E64B32' : 'transparent',
            color: view === id ? '#FAE8D0' : '#8C7570',
            transition: 'all 0.2s ease',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function HighlightTable({ years, byYear, categories }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {years.map((year) => (
        <section key={year}>
          <p style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#8C7570', marginBottom: '12px' }}>
            {year}
          </p>
          <div className="hl-table-wrap">
          <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'separate', borderSpacing: '0 4px', tableLayout: 'fixed', minWidth: '560px' }}>
            <colgroup>
              <col style={{ width: '150px' }} />
              <col />
              <col style={{ width: '190px' }} />
              <col style={{ width: '180px' }} />
              <col style={{ width: '40px' }} />
            </colgroup>
            <thead>
              <tr>
                {[
                  { label: 'Date', mobile: true },
                  { label: 'Titre', mobile: true },
                  { label: 'Catégorie', mobile: true },
                  { label: 'Description', mobile: false },
                  { label: '', mobile: true },
                ].map((h, i) => (
                  <th key={i} className={!h.mobile ? 'hl-col-hide-mobile' : ''} style={{
                    padding: '6px 16px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: '#8C7570',
                  }}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byYear[year].map((h) => {
                const cat = categories.find((c) => c.value === h.category)
                return (
                  <TableRow key={h.id} h={h} cat={cat} />
                )
              })}
            </tbody>
          </table>
          </div>
        </section>
      ))}
    </div>
  )
}

function TableRow({ h, cat }) {
  const [hovered, setHovered] = useState(false)
  return (
    <tr
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      style={{ background: hovered ? '#1C1C1C' : '#141414', transition: 'background 0.15s ease' }}
    >
      <td style={{ padding: '12px 16px', color: '#8C7570', whiteSpace: 'nowrap', borderRadius: '8px 0 0 8px' }}>
        {formatDate(h.week_date)}
      </td>
      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#F5EDE8', maxWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <a href={`/highlights/${h.id}`} style={{
          color: hovered ? '#E64B32' : '#F5EDE8',
          textDecoration: 'none',
          transition: 'color 0.15s ease',
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {h.title}
        </a>
      </td>
      <td style={{ padding: '12px 16px' }}>
        {cat && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(230,75,50,0.15)',
            color: '#E64B32',
            borderRadius: '20px',
            padding: '3px 10px',
            fontSize: '13px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>
            {cat.emoji} {cat.label}
          </span>
        )}
      </td>
      <td className="hl-col-hide-mobile" style={{ padding: '12px 16px', color: '#8C7570', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 0 }}>
        {h.description ?? '—'}
      </td>
      <td style={{ padding: '12px 8px', textAlign: 'center', borderRadius: '0 8px 8px 0' }}>
        <a href={`/highlights/${h.id}/edit`} style={{
          color: hovered ? '#E64B32' : 'transparent',
          transition: 'color 0.15s ease',
          fontSize: '15px',
          textDecoration: 'none',
        }}>
          ✎
        </a>
      </td>
    </tr>
  )
}
