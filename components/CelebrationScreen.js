'use client'

import { useEffect, useRef } from 'react'

const COLORS = ['#E64B32', '#FAE8D0', '#6E1226', '#F5EDE8', '#E64B32', '#FAE8D0']

function makeConfetti() {
  return Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: 2 + Math.random() * 96,
    delay: Math.random() * 1.8,
    duration: 1.8 + Math.random() * 1.4,
    color: COLORS[i % COLORS.length],
    w: 6 + Math.random() * 9,
    h: 4 + Math.random() * 6,
    rot: Math.random() * 360,
    drift: -30 + Math.random() * 60,
  }))
}

export default function CelebrationScreen({ title, categoryIcon, onComplete }) {
  const confetti = useRef(makeConfetti()).current

  useEffect(() => {
    const t = setTimeout(onComplete, 2500)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0A0A0A',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>

      {/* Confetti */}
      {confetti.map((c) => (
        <div key={c.id} style={{
          position: 'absolute',
          top: '-24px',
          left: `${c.left}%`,
          width: `${c.w}px`,
          height: `${c.h}px`,
          background: c.color,
          borderRadius: '2px',
          opacity: 0,
          animation: `cel-fall ${c.duration}s ${c.delay}s ease-in forwards`,
          '--drift': `${c.drift}px`,
          transform: `rotate(${c.rot}deg)`,
        }} />
      ))}

      {/* Centre */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        textAlign: 'center',
        padding: '0 24px',
        animation: 'cel-scalein 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}>
        <span style={{ fontSize: '72px', lineHeight: 1 }}>{categoryIcon || '✦'}</span>
        <p style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px', color: '#F5EDE8', margin: 0 }}>
          Highlight ajouté !
        </p>
        <p style={{ fontSize: '16px', color: '#8C7570', margin: 0, maxWidth: '300px' }}>
          {title}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'rgba(255,255,255,0.06)',
      }}>
        <div style={{
          height: '100%',
          width: '0%',
          background: 'linear-gradient(90deg, #E64B32, #6E1226)',
          animation: 'cel-progress 2.5s linear forwards',
        }} />
      </div>

      <style>{`
        @keyframes cel-fall {
          0%   { opacity: 1; transform: translateY(0) translateX(0) rotate(0deg); }
          100% { opacity: 0.2; transform: translateY(105vh) translateX(var(--drift, 0px)) rotate(540deg); }
        }
        @keyframes cel-scalein {
          0%   { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes cel-progress {
          0%   { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )
}
