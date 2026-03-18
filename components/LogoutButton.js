'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{ fontSize: '13px', color: '#8C7570', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}
      onMouseOver={(e) => e.currentTarget.style.color = '#F5EDE8'}
      onMouseOut={(e) => e.currentTarget.style.color = '#8C7570'}
    >
      Déconnexion
    </button>
  )
}
