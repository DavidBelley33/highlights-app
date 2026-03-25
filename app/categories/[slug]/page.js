'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getHighlightsByCategory, getPhotoUrl } from '@/lib/highlights'
import { getCategories } from '@/lib/categories'
import { formatDate } from '@/lib/constants'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeStats(highlights) {
  if (!highlights.length) return null
  const oldest = highlights[highlights.length - 1]
  const monthCounts = {}
  highlights.forEach((h) => {
    const m = h.week_date.slice(0, 7)
    monthCounts[m] = (monthCounts[m] || 0) + 1
  })
  const topMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0][0]
  const thisYear = new Date().getFullYear().toString()
  const thisYearCount = highlights.filter((h) => h.week_date.startsWith(thisYear)).length
  return { oldest, topMonth, thisYearCount }
}

function formatMonth(ym) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long' })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoryDetailPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [category, setCategory] = useState(null)
  const [highlights, setHighlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    Promise.all([getCategories(), getHighlightsByCategory(slug)])
      .then(([cats, hlts]) => {
        const cat = cats.find((c) => c.value === slug)
        if (!cat) { router.push('/'); return }
        setCategory(cat)
        setHighlights(hlts)
      })
      .catch(() => router.push('/'))
      .finally(() => {
        setLoading(false)
        requestAnimationFrame(() => setVisible(true))
      })
  }, [slug, router])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '96px 0', color: '#8C7570' }}>
        Chargement…
      </div>
    )
  }

  if (!category) return null

  const stats = computeStats(highlights)

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    }}>
      {/* ── Back ── */}
      <a
        href="/"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px', fontSize: '14px', color: '#8C7570', textDecoration: 'none', transition: 'color 0.2s ease' }}
        onMouseOver={(e) => e.currentTarget.style.color = '#E64B32'}
        onMouseOut={(e) => e.currentTarget.style.color = '#8C7570'}
      >
        ← Dashboard
      </a>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '48px', lineHeight: 1, flexShrink: 0 }}>{category.emoji}</span>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#F5EDE8', margin: 0, lineHeight: 1.2 }}>
              {category.label}
            </h1>
            {category.description && (
              <p style={{ fontSize: '14px', color: '#8C7570', marginTop: '4px', marginBottom: '2px' }}>
                {category.description}
              </p>
            )}
            <p style={{ fontSize: '14px', color: '#8C7570', marginTop: '4px' }}>
              {highlights.length} highlight{highlights.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <a
          href={`/highlights/new?category=${slug}`}
          style={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #E64B32, #6E1226)',
            color: '#FAE8D0',
            borderRadius: '20px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'opacity 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          + Nouveau highlight
        </a>
      </div>

      {/* ── Quick Stats ── */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
          <MiniStat label="Premier highlight" value={formatDate(stats.oldest.week_date)} />
          <MiniStat label="Plus actif" value={formatMonth(stats.topMonth)} />
          <MiniStat label="Cette année" value={`${stats.thisYearCount} highlight${stats.thisYearCount !== 1 ? 's' : ''}`} />
        </div>
      )}

      {/* ── List or Empty ── */}
      {highlights.length === 0 ? (
        <EmptyState category={category} slug={slug} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {highlights.map((h, i) => (
            <HighlightCard key={h.id} highlight={h} category={category} index={i} visible={visible} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MiniStat({ label, value }) {
  return (
    <div style={{
      background: '#141414',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px',
      padding: '16px 20px',
    }}>
      <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#8C7570', marginBottom: '6px' }}>
        {label}
      </p>
      <p style={{ fontSize: '15px', fontWeight: 600, color: '#F5EDE8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </p>
    </div>
  )
}

function HighlightCard({ highlight: h, category, index, visible }) {
  const [hovered, setHovered] = useState(false)
  const firstPhoto = h.highlight_photos?.[0]
  const photoUrl = firstPhoto ? getPhotoUrl(firstPhoto.storage_path) : null

  return (
    <a
      href={`/highlights/${h.id}`}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: hovered ? '#1C1C1C' : '#141414',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '20px',
        textDecoration: 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: `background 0.2s ease, opacity 0.3s ease ${index * 50}ms, transform 0.3s ease ${index * 50}ms`,
      }}
    >
      {/* Photo or emoji placeholder */}
      <div style={{ flexShrink: 0 }}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
          }}>
            {category.emoji}
          </div>
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#F5EDE8', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {h.title}
        </p>
        <p style={{ fontSize: '13px', color: '#8C7570', marginBottom: h.description ? '6px' : 0 }}>
          {formatDate(h.week_date)}
        </p>
        {h.description && (
          <p style={{
            fontSize: '13px',
            color: '#8C7570',
            margin: 0,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {h.description}
          </p>
        )}
      </div>

      {/* Arrow */}
      <span style={{ color: hovered ? '#E64B32' : '#8C7570', flexShrink: 0, fontSize: '18px', transition: 'color 0.2s ease' }}>→</span>
    </a>
  )
}

function EmptyState({ category, slug }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      padding: '80px 0',
      textAlign: 'center',
    }}>
      <span style={{ fontSize: '64px' }}>{category.emoji}</span>
      <p style={{ fontSize: '16px', fontWeight: 600, color: '#F5EDE8' }}>
        Aucun highlight dans cette catégorie
      </p>
      <p style={{ fontSize: '14px', color: '#8C7570' }}>
        C'est le bon moment pour en créer un !
      </p>
      <a
        href={`/highlights/new?category=${slug}`}
        style={{
          marginTop: '8px',
          background: 'linear-gradient(135deg, #E64B32, #6E1226)',
          color: '#FAE8D0',
          borderRadius: '20px',
          padding: '10px 24px',
          fontSize: '14px',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        + Créer mon premier highlight
      </a>
    </div>
  )
}
