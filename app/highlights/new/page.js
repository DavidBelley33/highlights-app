'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createHighlight, uploadPhoto } from '@/lib/highlights'
import { getCategories } from '@/lib/categories'
import DatePicker from '@/components/DatePicker'
import CategorySelect from '@/components/CategorySelect'
import CelebrationScreen from '@/components/CelebrationScreen'

export default function NewHighlightPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [photos, setPhotos] = useState([])
  const [categories, setCategories] = useState([])
  const [celebration, setCelebration] = useState(null) // { title, categoryIcon, categoryValue }

  const [form, setForm] = useState({
    title: '',
    category: '',
    secondary_category: '',
    description: '',
    week_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error)
    const preset = new URLSearchParams(window.location.search).get('category')
    if (preset) setForm((f) => ({ ...f, category: preset }))
  }, [])

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handlePhotos(e) {
    setPhotos(Array.from(e.target.files))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.secondary_category && form.secondary_category === form.category) {
      setError('La catégorie secondaire doit être différente de la principale.')
      return
    }
    setError(null)
    setSaving(true)
    try {
      const highlight = await createHighlight(form)
      await Promise.all(photos.map((file) => uploadPhoto(highlight.id, file)))

      // Find the selected category emoji
      const cat = categories.find((c) => c.value === form.category)
      setCelebration({
        title: form.title,
        categoryIcon: cat?.emoji ?? '✦',
        categoryValue: form.category,
      })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (celebration) {
    return (
      <CelebrationScreen
        title={celebration.title}
        categoryIcon={celebration.categoryIcon}
        onComplete={() => {
          router.push(`/?celebrated=${encodeURIComponent(celebration.categoryValue)}`)
        }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">Nouveau highlight</h1>

      {error && (
        <div className="mb-4 rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <Field label="Titre *">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Ex. Weekend à la cabane"
            className={inputClass}
          />
        </Field>

        {/* Category */}
        <Field label="Catégorie *">
          <CategorySelect
            value={form.category}
            onChange={(val) => setForm((f) => ({ ...f, category: val }))}
            required
          />
        </Field>

        {/* Secondary category */}
        <Field label="Autre catégorie liée" subLabel="optionnel">
          <CategorySelect
            value={form.secondary_category}
            onChange={(val) => setForm((f) => ({ ...f, secondary_category: val }))}
            optional
          />
          {form.secondary_category && form.secondary_category === form.category && (
            <p style={{ marginTop: '6px', fontSize: '12px', color: '#E64B32' }}>
              Choisir une catégorie différente
            </p>
          )}
        </Field>

        {/* Date */}
        <Field label="Date *">
          <DatePicker
            value={form.week_date}
            onChange={(val) => setForm((f) => ({ ...f, week_date: val }))}
            required
          />
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Quelques mots pour te souvenir de ce moment…"
            className={inputClass}
          />
        </Field>

        {/* Photos */}
        <Field label="Photos">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotos}
            className="block w-full text-sm text-[var(--text-secondary)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--surface-2)] file:px-4 file:py-2 file:text-sm file:text-[var(--text-primary)] hover:file:bg-[var(--border)]"
          />
          {photos.length > 0 && (
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {photos.length} photo{photos.length > 1 ? 's' : ''} sélectionnée{photos.length > 1 ? 's' : ''}
            </p>
          )}
        </Field>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-full bg-[var(--accent)] py-2.5 font-semibold text-black hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <a
            href="/"
            className="rounded-full border border-[var(--border)] px-6 py-2.5 text-sm text-[var(--text-secondary)] hover:border-[var(--text-secondary)] transition-colors"
          >
            Annuler
          </a>
        </div>
      </form>
    </div>
  )
}

function Field({ label, subLabel, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-2">
        <label className="block text-sm font-medium text-[var(--text-secondary)]">{label}</label>
        {subLabel && <span style={{ fontSize: '12px', color: '#8C7570' }}>({subLabel})</span>}
      </div>
      {children}
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--accent)] focus:outline-none transition-colors'
