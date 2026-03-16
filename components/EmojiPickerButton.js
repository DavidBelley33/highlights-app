'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import data from '@emoji-mart/data'

const Picker = dynamic(() => import('@emoji-mart/react'), { ssr: false })

const PICKER_HEIGHT = 435

export default function EmojiPickerButton({ value, onChange, size = 36 }) {
  const [open, setOpen] = useState(false)
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 })
  const ref = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const openUpward = spaceBelow < PICKER_HEIGHT + 10
      setPickerPos({
        top: openUpward ? rect.top - PICKER_HEIGHT - 6 : rect.bottom + 6,
        left: rect.left,
      })
    }
    setOpen((o) => !o)
  }

  return (
    <div ref={ref} style={{ display: 'inline-block' }}>
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        title="Choisir un emoji"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#141414',
          border: open ? '1px solid #E64B32' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease',
          flexShrink: 0,
        }}
      >
        {value || '😀'}
      </button>

      {open && (
        <div style={{
          position: 'fixed',
          top: pickerPos.top,
          left: pickerPos.left,
          zIndex: 9999,
        }}>
          <Picker
            data={data}
            onEmojiSelect={(e) => { onChange(e.native); setOpen(false) }}
            theme="dark"
            previewPosition="none"
            skinTonePosition="none"
          />
        </div>
      )}
    </div>
  )
}
