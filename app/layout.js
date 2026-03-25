import './globals.css'
import { Inter } from 'next/font/google'
import ExportButton from '@/components/ExportButton'
import LogoutButton from '@/components/LogoutButton'
import WelcomePill from '@/components/WelcomePill'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata = {
  title: 'Highlights',
  description: 'Mes meilleurs moments',
}

function getCurrentWeekNumber() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const dayOfYear = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000)) + 1
  return Math.ceil(dayOfYear / 7)
}

export default function RootLayout({ children }) {
  const weekNum = getCurrentWeekNumber()

  return (
    <html lang="fr">
      <body className={`${inter.className} hl-body`}>
        <header className="hl-header">
          <div className="hl-header-inner">
            <div className="hl-header-left">
              <a href="/" className="hl-logo-link">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="30" height="30">
                  <defs>
                    <linearGradient id="logo-g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E64B32"/>
                      <stop offset="100%" stopColor="#6E1226"/>
                    </linearGradient>
                  </defs>
                  <rect width="100" height="100" rx="22" fill="#141414"/>
                  <path d="M 22 8 L 78 8 Q 83 8 83 13 L 83 88 Q 83 93 78 91 L 51 76 L 24 91 Q 19 93 19 88 L 19 13 Q 19 8 24 8 Z" fill="url(#logo-g)"/>
                  <path d="M 51 26 L 55.5 39 L 69 43 L 55.5 47 L 51 60 L 46.5 47 L 33 43 L 46.5 39 Z" fill="#FAE8D0" opacity="0.92"/>
                </svg>
                <span className="hl-logo">Highlights</span>
              </a>
              <WelcomePill />
            </div>
            <div className="hl-header-right">
              <a href="/categories" className="hl-nav-link hl-nav-hide-mobile">Catégories</a>
              <a href="/stats" className="hl-nav-link hl-nav-hide-mobile">Stats</a>
              <span className="hl-nav-hide-mobile"><ExportButton /></span>
              <a href="/profile" className="hl-nav-hide-mobile" title="Mon profil" style={{
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
              <span className="hl-nav-hide-mobile"><LogoutButton /></span>
              <a href="/highlights/new" className="hl-cta">+ Nouveau</a>
            </div>
          </div>
        </header>
        <main className="hl-main">
          {children}
        </main>
        <nav className="hl-mobile-nav">
          <a href="/">🏠 Accueil</a>
          <a href="/categories">🏷️ Catégories</a>
          <a href="/stats">📊 Stats</a>
          <a href="/highlights/new">✦ Nouveau</a>
        </nav>
      </body>
    </html>
  )
}
