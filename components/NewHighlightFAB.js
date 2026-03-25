'use client'

export default function NewHighlightFAB() {
  return (
    <a
      href="/highlights/new"
      title="Nouveau highlight"
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #E64B32, #6E1226)',
        color: '#FAE8D0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '26px',
        fontWeight: 300,
        textDecoration: 'none',
        boxShadow: '0 4px 20px rgba(230,75,50,0.4)',
        zIndex: 100,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(230,75,50,0.55)' }}
      onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(230,75,50,0.4)' }}
    >
      +
    </a>
  )
}
