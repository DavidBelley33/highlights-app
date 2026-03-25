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
      👤
    </a>
  )
}
