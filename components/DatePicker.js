'use client'

import { useState, useRef, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { fr } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import { formatDate } from '@/lib/constants'

// Convert YYYY-MM-DD string → Date (local, no timezone shift)
function strToDate(str) {
  if (!str) return undefined
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Convert Date → YYYY-MM-DD string
function dateToStr(date) {
  if (!date) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function DatePicker({ value, onChange, required }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = strToDate(value)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(date) {
    if (!date) return
    onChange(dateToStr(date))
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-left text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors flex items-center justify-between"
      >
        <span className={value ? '' : 'text-[var(--text-secondary)]/50'}>
          {value ? formatDate(value) : 'Choisir une date…'}
        </span>
        <span className="text-[var(--text-secondary)] ml-2">📅</span>
      </button>

      <input type="hidden" value={value} required={required} />

      {/* Calendar popover */}
      {open && (
        <div className="absolute z-50 mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl p-3" style={{ colorScheme: 'dark' }}>
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            locale={fr}
            defaultMonth={selected ?? new Date()}
            startMonth={new Date(2020, 0)}
          />
        </div>
      )}
    </div>
  )
}
