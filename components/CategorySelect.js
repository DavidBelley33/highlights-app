'use client'

import { useState, useEffect, useRef } from 'react'
import { getCategories, createCategory } from '@/lib/categories'
import EmojiPickerButton from './EmojiPickerButton'

export default function CategorySelect({ value, onChange, required, optional }) {
  const [categories, setCategories] = useState([])
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newEmoji, setNewEmoji] = useState('⭐')
  const [saving, setSaving] = useState(false)
  const ref = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error)
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setAdding(false)
        setNewLabel('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus()
  }, [adding])

  const selected = categories.find((c) => c.value === value)

  async function handleAdd(e) {
    e?.preventDefault()
    if (!newLabel.trim()) return
    setSaving(true)
    try {
      const cat = await createCategory({ label: newLabel.trim(), emoji: newEmoji })
      setCategories((prev) => [...prev, cat])
      onChange(cat.value)
      setOpen(false)
      setAdding(false)
      setNewLabel('')
      setNewEmoji('⭐')
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-left focus:border-[var(--accent)] focus:outline-none transition-colors flex items-center justify-between"
      >
        <span className={selected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]/50'}>
          {selected ? `${selected.emoji} ${selected.label}` : optional ? '— Aucune —' : 'Choisir une catégorie…'}
        </span>
        <span className="text-[var(--text-secondary)] text-xs">▾</span>
      </button>

      <input type="hidden" value={value ?? ''} required={required} />

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden">
          {/* Category list */}
          <div className="max-h-56 overflow-y-auto py-1">
            {optional && (
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false) }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-[var(--surface-2)] transition-colors ${!value ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
              >
                <span>—</span>
                <span>Aucune</span>
                {!value && <span className="ml-auto text-xs">✓</span>}
              </button>
            )}
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => { onChange(cat.value); setOpen(false) }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-[var(--surface-2)] transition-colors ${value === cat.value ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                {value === cat.value && <span className="ml-auto text-xs">✓</span>}
              </button>
            ))}
          </div>

          {/* Add new category */}
          <div className="border-t border-[var(--border)]">
            {!adding ? (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--accent)] hover:bg-[var(--surface-2)] transition-colors"
              >
                <span>+</span>
                <span>Nouvelle catégorie</span>
              </button>
            ) : (
              <div className="p-3 flex gap-2">
                <EmojiPickerButton value={newEmoji} onChange={setNewEmoji} size={36} />
                <input
                  type="text"
                  ref={inputRef}
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd(e))}
                  placeholder="Nom de la catégorie"
                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent)]"
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={saving || !newLabel.trim()}
                  className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
                >
                  {saving ? '…' : 'OK'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
