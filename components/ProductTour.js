'use client'

import { useState } from 'react'
import { createCategory } from '@/lib/categories'

const SUGGESTED = [
  { label: 'Vie de couple',      emoji: '❤️' },
  { label: 'Vie sociale',        emoji: '👥' },
  { label: 'Temps en famille',   emoji: '👨‍👩‍👧' },
  { label: 'Carrière & Travail', emoji: '💼' },
  { label: 'Activités sportives',emoji: '🏃' },
  { label: 'Aventure & Voyage',  emoji: '✈️' },
]

const STEPS = [
  {
    icon: '✦',
    title: 'Bienvenue sur Highlights',
    description: "Chaque semaine, note tes moments forts. En quelques semaines, tu commences à voir ce qui compte vraiment dans ta vie.",
  },
  {
    icon: '📝',
    title: 'Crée un highlight',
    description: "Un moment fort par semaine. Une victoire, une expérience, un souvenir. Simple et rapide à noter.",
  },
  {
    icon: '🏷️',
    title: 'Organise par catégories',
    description: "Classe tes highlights : Famille, Travail, Sport... Tu crées les tiennes et tu les personnalises avec un emoji.",
  },
  {
    icon: '📊',
    title: 'Suis tes tendances',
    description: "Après quelques semaines, des patterns émergent. Ta catégorie dominante, ton streak, tes périodes actives.",
  },
]

export default function ProductTour({ onComplete }) {
  const [step, setStep]       = useState(0)
  const [selected, setSelected] = useState(new Set([0, 1, 2, 3, 4, 5]))
  const [creating, setCreating] = useState(false)

  const isCatStep    = step === STEPS.length
  const currentStep  = STEPS[step]

  function toggleCat(i) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  async function handleCreateCategories() {
    setCreating(true)
    for (const i of selected) {
      try { await createCategory(SUGGESTED[i]) } catch (_) {}
    }
    onComplete(true)
  }

  const card = {
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '40px 36px',
    maxWidth: '440px',
    width: '100%',
    position: 'relative',
  }

  const btn = {
    width: '100%',
    background: 'linear-gradient(135deg, #E64B32, #6E1226)',
    color: '#FAE8D0',
    border: 'none',
    borderRadius: '14px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.88)',
      zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={card}>

        {/* Skip */}
        <button onClick={() => onComplete(false)} style={{
          position: 'absolute', top: '16px', right: '20px',
          background: 'none', border: 'none', color: '#8C7570',
          fontSize: '13px', cursor: 'pointer', padding: '4px 8px',
        }}>
          Passer
        </button>

        {!isCatStep ? (
          <>
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i === step ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i <= step ? '#E64B32' : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.3s ease',
                }} />
              ))}
            </div>

            <div style={{ fontSize: '48px', marginBottom: '20px', lineHeight: 1 }}>{currentStep.icon}</div>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#F5EDE8', margin: '0 0 12px' }}>
              {currentStep.title}
            </h2>

            <p style={{ fontSize: '15px', color: '#8C7570', lineHeight: 1.6, margin: '0 0 36px' }}>
              {currentStep.description}
            </p>

            <button onClick={() => setStep(step + 1)} style={btn}>
              {step === STEPS.length - 1 ? 'Choisir mes catégories →' : 'Suivant →'}
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#F5EDE8', margin: '0 0 8px' }}>
              Choisis tes catégories
            </h2>
            <p style={{ fontSize: '14px', color: '#8C7570', margin: '0 0 24px', lineHeight: 1.5 }}>
              Sélectionne celles qui te correspondent. Tu pourras en ajouter ou modifier plus tard.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
              {SUGGESTED.map((cat, i) => {
                const on = selected.has(i)
                return (
                  <button key={i} onClick={() => toggleCat(i)} style={{
                    background: on ? 'rgba(230,75,50,0.15)' : '#0A0A0A',
                    border: `1px solid ${on ? 'rgba(230,75,50,0.5)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '12px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'all 0.2s ease',
                  }}>
                    <span style={{ fontSize: '20px' }}>{cat.emoji}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: on ? '#E64B32' : '#8C7570', transition: 'color 0.2s' }}>
                      {cat.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <button
              onClick={handleCreateCategories}
              disabled={creating || selected.size === 0}
              style={{
                ...btn,
                background: selected.size === 0 ? '#1C1C1C' : btn.background,
                color: selected.size === 0 ? '#8C7570' : '#FAE8D0',
                cursor: selected.size === 0 || creating ? 'not-allowed' : 'pointer',
              }}
            >
              {creating ? 'Création en cours…' : `Créer ${selected.size} catégorie${selected.size > 1 ? 's' : ''} →`}
            </button>

            {selected.size === 0 && (
              <button onClick={() => onComplete(false)} style={{
                width: '100%', background: 'none', border: 'none',
                color: '#8C7570', fontSize: '13px', cursor: 'pointer',
                marginTop: '12px', padding: '8px',
              }}>
                Commencer sans catégories
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
