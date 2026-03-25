'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getHighlight, deleteHighlight, updateHighlight, getPhotoUrl, deletePhoto } from '@/lib/highlights'
import { getCategories } from '@/lib/categories'
import { formatDate } from '@/lib/constants'
import CategorySelect from '@/components/CategorySelect'

export default function HighlightDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [highlight, setHighlight] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [editingCategory, setEditingCategory] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState(null)

  useEffect(() => {
    Promise.all([getHighlight(id), getCategories()])
      .then(([h, cats]) => { setHighlight(h); setCategories(cats) })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [id, router])

  async function handleDelete() {
    setDeleting(true)
    await deleteHighlight(id)
    router.push('/')
  }

  async function handleDeletePhoto() {
    if (!photoToDelete) return
    await deletePhoto(photoToDelete.id, photoToDelete.storage_path)
    setHighlight((h) => ({
      ...h,
      highlight_photos: h.highlight_photos.filter((p) => p.id !== photoToDelete.id),
    }))
    setPhotoToDelete(null)
  }

  async function handleCategoryChange(val) {
    setEditingCategory(false)
    if (val === highlight.category) return
    const updated = await updateHighlight(highlight.id, { ...highlight, category: val })
    setHighlight((h) => ({ ...h, category: updated.category }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[var(--text-secondary)]">
        Chargement…
      </div>
    )
  }

  if (!highlight) return null

  const cat = categories.find((c) => c.value === highlight.category)
  const secCat = highlight.secondary_category
    ? categories.find((c) => c.value === highlight.secondary_category)
    : null

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back */}
      <a
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        ← Tous les highlights
      </a>

      {/* Header */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          {/* Primary category pill */}
          {editingCategory ? (
            <div className="w-56">
              <CategorySelect
                value={highlight.category}
                onChange={handleCategoryChange}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingCategory(true)}
              className="group flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors"
              style={{ background: 'rgba(230,75,50,0.12)', border: '1px solid rgba(230,75,50,0.25)', color: '#E64B32' }}
              title="Modifier la catégorie"
            >
              <span>{cat?.emoji ?? '⭐'}</span>
              <span>{cat?.label ?? highlight.category}</span>
              <span className="opacity-0 group-hover:opacity-60 transition-opacity text-xs">✎</span>
            </button>
          )}
          {/* Secondary category pill */}
          {secCat && (
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-sm"
              style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', color: '#8C7570' }}
            >
              <span>{secCat.emoji}</span>
              <span>{secCat.label}</span>
            </span>
          )}
          <span className="text-sm text-[var(--text-secondary)]">· {formatDate(highlight.week_date)}</span>
        </div>
        <h1 className="text-3xl font-bold leading-tight">{highlight.title}</h1>
      </div>

      {/* Description */}
      {highlight.description && (
        <p className="mb-8 whitespace-pre-wrap leading-relaxed text-[var(--text-secondary)]">
          {highlight.description}
        </p>
      )}

      {/* Photos */}
      {highlight.highlight_photos?.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {highlight.highlight_photos.map((photo) => {
              const url = getPhotoUrl(photo.storage_path)
              return (
                <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-[var(--surface-2)]">
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full cursor-pointer object-cover transition-transform duration-200 group-hover:scale-105"
                    onClick={() => setLightbox(url)}
                  />
                  <button
                    onClick={() => setPhotoToDelete(photo)}
                    className="absolute right-2 top-2 hidden rounded-full bg-black/60 px-2 py-0.5 text-xs text-white group-hover:block hover:bg-red-900"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 border-t border-[var(--border)] pt-6">
        <a
          href={`/highlights/${id}/edit`}
          className="rounded-full border border-[var(--border)] px-5 py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
        >
          Modifier
        </a>
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={deleting}
          className="rounded-full border border-red-900 px-5 py-2 text-sm text-red-500 hover:bg-red-950/40 disabled:opacity-50 transition-colors"
        >
          {deleting ? 'Suppression…' : 'Supprimer'}
        </button>
      </div>

      {/* Modale suppression highlight */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px', maxWidth: '380px', width: '100%' }}>
            <p style={{ fontSize: '17px', fontWeight: 700, color: '#F5EDE8', marginBottom: '8px' }}>Supprimer ce highlight ?</p>
            <p style={{ fontSize: '14px', color: '#8C7570', marginBottom: '24px' }}>Cette action est irréversible.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, color: '#F5EDE8', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleDelete} style={{ background: 'linear-gradient(135deg, #c0392b, #7b1e1e)', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, color: '#FAE8D0', cursor: 'pointer' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale suppression photo */}
      {photoToDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px', maxWidth: '380px', width: '100%' }}>
            <p style={{ fontSize: '17px', fontWeight: 700, color: '#F5EDE8', marginBottom: '8px' }}>Supprimer cette photo ?</p>
            <p style={{ fontSize: '14px', color: '#8C7570', marginBottom: '24px' }}>Cette action est irréversible.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setPhotoToDelete(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, color: '#F5EDE8', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleDeletePhoto} style={{ background: 'linear-gradient(135deg, #c0392b, #7b1e1e)', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, color: '#FAE8D0', cursor: 'pointer' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt=""
            className="max-h-full max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </div>
  )
}
