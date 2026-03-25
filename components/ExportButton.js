'use client'

import { useState } from 'react'
import { getHighlights } from '@/lib/highlights'

export default function ExportButton() {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const highlights = await getHighlights()

      // Build CSV
      const headers = ['Date', 'Titre', 'Catégorie', 'Description']
      const rows = highlights.map((h) => [
        h.week_date,
        `"${(h.title || '').replace(/"/g, '""')}"`,
        h.category || '',
        `"${(h.description || '').replace(/"/g, '""')}"`,
      ])

      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)

      const today = new Date().toISOString().split('T')[0]
      const a = document.createElement('a')
      a.href = url
      a.download = `highlights-${today}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
      alert('Erreur lors de l\'export')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: 600,
        color: '#F5EDE8',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        transition: 'background 0.2s ease',
      }}
      onMouseOver={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
      title="Exporter mes données en CSV"
    >
      {loading ? 'Export en cours…' : '↓ Télécharger CSV'}
    </button>
  )
}
