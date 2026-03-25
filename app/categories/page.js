'use client'

import { useEffect, useState } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/categories'
import EmojiPickerButton from '@/components/EmojiPickerButton'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newLabel, setNewLabel] = useState('')
  const [newEmoji, setNewEmoji] = useState('⭐')
  const [newDesc, setNewDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editLabel, setEditLabel] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null) // cat object à supprimer

  useEffect(() => {
    getCategories().then(setCategories).finally(() => setLoading(false))
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!newLabel.trim()) return
    setSaving(true)
    try {
      const cat = await createCategory({ label: newLabel.trim(), emoji: newEmoji, description: newDesc.trim() || null })
      setCategories((prev) => [...prev, cat])
      setNewLabel('')
      setNewEmoji('⭐')
      setNewDesc('')
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  function startEdit(cat) {
    setEditingId(cat.id)
    setEditLabel(cat.label)
    setEditEmoji(cat.emoji)
    setEditDesc(cat.description || '')
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    if (!editLabel.trim()) return
    try {
      const updated = await updateCategory(editingId, { label: editLabel.trim(), emoji: editEmoji, description: editDesc.trim() || null })
      setCategories((prev) => prev.map((c) => c.id === updated.id ? updated : c))
      setEditingId(null)
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    await deleteCategory(confirmDelete.id)
    setCategories((prev) => prev.filter((c) => c.id !== confirmDelete.id))
    setConfirmDelete(null)
  }

  const inputStyle = {
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#F5EDE8',
    fontSize: '14px',
    padding: '10px 14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#8C7570', textDecoration: 'none', marginBottom: '28px' }}>
        ← Retour
      </a>

      <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px', color: '#F5EDE8', marginBottom: '28px' }}>
        Catégories
      </h1>

      {/* Add form */}
      <form onSubmit={handleAdd} style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <EmojiPickerButton value={newEmoji} onChange={setNewEmoji} size={44} />
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Nom de la nouvelle catégorie"
            style={{ ...inputStyle, flex: 1 }}
            onFocus={(e) => e.target.style.borderColor = '#E64B32'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
          <button
            type="submit"
            disabled={saving || !newLabel.trim()}
            style={{
              background: 'linear-gradient(135deg, #E64B32, #6E1226)',
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FAE8D0',
              border: 'none',
              cursor: saving || !newLabel.trim() ? 'not-allowed' : 'pointer',
              opacity: saving || !newLabel.trim() ? 0.5 : 1,
            }}
          >
            {saving ? '…' : 'Ajouter'}
          </button>
        </div>
        <input
          type="text"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="Description (optionnel)"
          style={{ ...inputStyle, fontSize: '13px', color: '#8C7570' }}
          onFocus={(e) => { e.target.style.borderColor = '#E64B32'; e.target.style.color = '#F5EDE8' }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.color = newDesc ? '#F5EDE8' : '#8C7570' }}
        />
      </form>

      {/* List */}
      {loading ? (
        <p style={{ color: '#8C7570' }}>Chargement…</p>
      ) : (
        <div style={{
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          {categories.length === 0 && (
            <p style={{ padding: '24px', textAlign: 'center', color: '#8C7570', fontSize: '14px' }}>
              Aucune catégorie. Crée-en une !
            </p>
          )}
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              style={{
                borderBottom: i < categories.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
            >
              {editingId === cat.id ? (
                <form onSubmit={handleSaveEdit} style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EmojiPickerButton value={editEmoji} onChange={setEditEmoji} size={40} />
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      style={{ ...inputStyle, flex: 1, padding: '7px 12px', borderRadius: '8px' }}
                      onFocus={(e) => e.target.style.borderColor = '#E64B32'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                    <button
                      type="submit"
                      disabled={!editLabel.trim()}
                      style={{
                        background: 'linear-gradient(135deg, #E64B32, #6E1226)',
                        borderRadius: '8px',
                        padding: '7px 14px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#FAE8D0',
                        border: 'none',
                        cursor: !editLabel.trim() ? 'not-allowed' : 'pointer',
                        opacity: !editLabel.trim() ? 0.5 : 1,
                      }}
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      style={{ background: 'none', border: 'none', fontSize: '13px', color: '#8C7570', cursor: 'pointer', padding: '7px 10px' }}
                    >
                      Annuler
                    </button>
                  </div>
                  <input
                    type="text"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Description (optionnel)"
                    style={{ ...inputStyle, fontSize: '13px', borderRadius: '8px', padding: '7px 12px' }}
                    onFocus={(e) => e.target.style.borderColor = '#E64B32'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </form>
              ) : (
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', transition: 'background 0.15s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#1C1C1C'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '22px' }}>{cat.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '15px', fontWeight: 500, color: '#F5EDE8', display: 'block' }}>{cat.label}</span>
                    {cat.description && <span style={{ fontSize: '12px', color: '#8C7570', marginTop: '2px', display: 'block' }}>{cat.description}</span>}
                  </div>
                  <button
                    onClick={() => startEdit(cat)}
                    style={{ background: 'none', border: 'none', fontSize: '13px', color: '#8C7570', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', transition: 'color 0.15s ease' }}
                    onMouseOver={(e) => e.target.style.color = '#E64B32'}
                    onMouseOut={(e) => e.target.style.color = '#8C7570'}
                  >
                    ✎ Modifier
                  </button>
                  <button
                    onClick={() => setConfirmDelete(cat)}
                    style={{ background: 'none', border: 'none', fontSize: '13px', color: '#8C7570', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', transition: 'color 0.15s ease' }}
                    onMouseOver={(e) => e.target.style.color = '#f87171'}
                    onMouseOut={(e) => e.target.style.color = '#8C7570'}
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Modale confirmation suppression ── */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px', maxWidth: '380px', width: '100%' }}>
            <p style={{ fontSize: '17px', fontWeight: 700, color: '#F5EDE8', marginBottom: '8px' }}>
              Supprimer cette catégorie ?
            </p>
            <p style={{ fontSize: '14px', color: '#8C7570', marginBottom: '24px' }}>
              "{confirmDelete.label}" sera supprimée définitivement. Les highlights associés ne seront pas supprimés.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, color: '#F5EDE8', cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                style={{ background: 'linear-gradient(135deg, #c0392b, #7b1e1e)', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, color: '#FAE8D0', cursor: 'pointer' }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
