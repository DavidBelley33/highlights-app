'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ExportButton from '@/components/ExportButton'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Infos
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [savingInfo, setSavingInfo] = useState(false)
  const [infoSuccess, setInfoSuccess] = useState(false)

  // Password
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [pwError, setPwError] = useState(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
        setFullName(user.user_metadata?.full_name || '')
        setPhone(user.user_metadata?.phone || '')
      }
      setLoading(false)
    })
  }, [])

  async function handleSaveInfo(e) {
    e.preventDefault()
    setSavingInfo(true)
    setInfoSuccess(false)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim(), phone: phone.trim() }
    })
    setSavingInfo(false)
    if (!error) setInfoSuccess(true)
  }

  async function handleChangePw(e) {
    e.preventDefault()
    setPwError(null)
    setPwSuccess(false)
    if (newPw !== confirmPw) { setPwError('Les mots de passe ne correspondent pas.'); return }
    if (newPw.length < 6) { setPwError('Minimum 6 caractères.'); return }
    setSavingPw(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setSavingPw(false)
    if (error) { setPwError(error.message); return }
    setPwSuccess(true)
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
  }

  const inputStyle = {
    width: '100%',
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#F5EDE8',
    fontSize: '14px',
    padding: '11px 14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: '#8C7570',
    marginBottom: '6px',
  }

  const sectionStyle = {
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px',
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '96px 0', color: '#8C7570' }}>
      Chargement…
    </div>
  )

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto' }}>
      {/* Back */}
      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#8C7570', textDecoration: 'none', marginBottom: '28px' }}
        onMouseOver={(e) => e.currentTarget.style.color = '#E64B32'}
        onMouseOut={(e) => e.currentTarget.style.color = '#8C7570'}
      >
        ← Retour
      </a>

      <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px', color: '#F5EDE8', marginBottom: '28px' }}>
        Mon profil
      </h1>

      {/* ── Infos personnelles ── */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#F5EDE8', marginBottom: '20px' }}>Informations personnelles</h2>
        <form onSubmit={handleSaveInfo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ton nom"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#E64B32'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
            />
          </div>
          <div>
            <label style={labelStyle}>Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 514 000 0000"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#E64B32'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {infoSuccess && (
            <p style={{ fontSize: '13px', color: '#1EB464' }}>✓ Informations mises à jour.</p>
          )}

          <button
            type="submit"
            disabled={savingInfo}
            style={{
              alignSelf: 'flex-end',
              background: 'linear-gradient(135deg, #E64B32, #6E1226)',
              border: 'none',
              borderRadius: '20px',
              padding: '10px 22px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FAE8D0',
              cursor: savingInfo ? 'not-allowed' : 'pointer',
              opacity: savingInfo ? 0.7 : 1,
            }}
          >
            {savingInfo ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </form>
      </div>

      {/* ── Mot de passe ── */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#F5EDE8', marginBottom: '20px' }}>Changer le mot de passe</h2>
        <form onSubmit={handleChangePw} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Nouveau mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: '44px' }}
                onFocus={(e) => e.target.style.borderColor = '#E64B32'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8C7570', fontSize: '15px' }}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Confirmer le mot de passe</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#E64B32'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {pwError && <p style={{ fontSize: '13px', color: '#f87171' }}>{pwError}</p>}
          {pwSuccess && <p style={{ fontSize: '13px', color: '#1EB464' }}>✓ Mot de passe mis à jour.</p>}

          <button
            type="submit"
            disabled={savingPw || !newPw || !confirmPw}
            style={{
              alignSelf: 'flex-end',
              background: 'linear-gradient(135deg, #E64B32, #6E1226)',
              border: 'none',
              borderRadius: '20px',
              padding: '10px 22px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FAE8D0',
              cursor: (savingPw || !newPw || !confirmPw) ? 'not-allowed' : 'pointer',
              opacity: (savingPw || !newPw || !confirmPw) ? 0.5 : 1,
            }}
          >
            {savingPw ? 'Mise à jour…' : 'Changer le mot de passe'}
          </button>
        </form>
      </div>

      {/* ── Compte ── */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#F5EDE8', marginBottom: '16px' }}>Mon compte</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Row label="Email" value={user?.email} />
          <Row label="Membre depuis" value={user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} />
          <Row label="Plan" value="Fondateur 🌟" />
        </div>
      </div>

      {/* ── Export ── */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#F5EDE8', marginBottom: '8px' }}>Exporter mes données</h2>
        <p style={{ fontSize: '13px', color: '#8C7570', marginBottom: '16px' }}>Télécharge tous tes highlights en format CSV.</p>
        <ExportButton />
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontSize: '13px', color: '#8C7570' }}>{label}</span>
      <span style={{ fontSize: '13px', color: '#F5EDE8', fontWeight: 500 }}>{value}</span>
    </div>
  )
}
