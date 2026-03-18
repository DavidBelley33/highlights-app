'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/login?created=1')
    }
  }

  const inputStyle = { width: '100%', background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#F5EDE8', outline: 'none', boxSizing: 'border-box' }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="56" height="56" style={{ margin: '0 auto 16px', display: 'block' }}>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E64B32"/>
                <stop offset="100%" stopColor="#6E1226"/>
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="22" fill="#141414"/>
            <path d="M 22 8 L 78 8 Q 83 8 83 13 L 83 88 Q 83 93 78 91 L 51 76 L 24 91 Q 19 93 19 88 L 19 13 Q 19 8 24 8 Z" fill="url(#g)"/>
            <path d="M 51 26 L 55.5 39 L 69 43 L 55.5 47 L 51 60 L 46.5 47 L 33 43 L 46.5 39 Z" fill="#FAE8D0" opacity="0.92"/>
          </svg>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#F5EDE8', margin: 0 }}>Highlights</h1>
          <p style={{ fontSize: '14px', color: '#8C7570', marginTop: '6px' }}>Créer ton compte</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#f87171' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#8C7570', marginBottom: '6px' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="ton@email.com" style={inputStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#8C7570', marginBottom: '6px' }}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" style={{ ...inputStyle, paddingRight: '48px' }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8C7570', fontSize: '16px', padding: 0 }}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#8C7570', marginBottom: '6px' }}>Confirmer le mot de passe</label>
            <input type={showPw ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="••••••••" style={inputStyle} />
          </div>

          <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #E64B32, #6E1226)', color: '#FAE8D0', border: 'none', borderRadius: '20px', padding: '13px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '4px' }}>
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#8C7570', marginTop: '24px' }}>
          Déjà un compte ?{' '}
          <a href="/login" style={{ color: '#E64B32', textDecoration: 'none', fontWeight: 500 }}>Se connecter</a>
        </p>
      </div>
    </div>
  )
}
