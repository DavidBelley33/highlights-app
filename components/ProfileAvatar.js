'use client'

export default function ProfileAvatar() {
  return (
    <a
      href="/profile"
      title="Mon profil"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '34px', height: '34px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#8C7570', textDecoration: 'none', fontSize: '16px',
        transition: 'background 0.2s ease, color 0.2s ease',
      }}
      onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(230,75,50,0.15)'; e.currentTarget.style.color = '#E64B32' }}
      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#8C7570' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    </a>
  )
}
