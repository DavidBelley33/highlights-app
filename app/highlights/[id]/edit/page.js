'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getHighlight, updateHighlight, uploadPhoto } from '@/lib/highlights'
import DatePicker from '@/components/DatePicker'
import CategorySelect from '@/components/CategorySelect'

export default function EditHighlightPage() {
  const { id } = useParams()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newPhotos, setNewPhotos] = useState([])

  const [form, setForm] = useState({
    title: '',
    category: '',
    secondary_category: '',
    description: '',
    week_date: '',
  })

  useEffect(() => {
    getHighlight(id)
      .then((h) => {
        setForm({
          title: h.title,
          category: h.category,
          secondary_category: h.secondary_category ?? '',
          description: h.description ?? '',
          week_date: h.week_date,
        })
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [id, router])

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
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
      await updateHighlight(id, form)
      await Promise.all(newPhotos.map((file) => uploadPhoto(id, file)))
      router.push(`/highlights/${id}`)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[var(--text-secondary)]">
        Chargement…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <a
        href={`/highlights/${id}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        ← Retour
      </a>

      <h1 className="mb-6 text-2xl font-bold">Modifier le highlight</h1>

      {error && (
        <div className="mb-4 rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Titre *">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </Field>

        <Field label="Catégorie *">
          <CategorySelect
            value={form.category}
            onChange={(val) => setForm((f) => ({ ...f, category: val }))}
            required
          />
        </Field>

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

        <Field label="Date *">
          <DatePicker
            value={form.week_date}
            onChange={(val) => setForm((f) => ({ ...f, week_date: val }))}
            required
          />
        </Field>

        <Field label="Description">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className={inputClass}
          />
        </Field>

        <Field label="Ajouter des photos">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setNewPhotos(Array.from(e.target.files))}
            className="block w-full text-sm text-[var(--text-secondary)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--surface-2)] file:px-4 file:py-2 file:text-sm file:text-[var(--text-primary)] hover:file:bg-[var(--border)]"
          />
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-full bg-[var(--accent)] py-2.5 font-semibold text-black hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <a
            href={`/highlights/${id}`}
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
