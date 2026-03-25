'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WelcomePill() {
  const [name, setName] = useState(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const firstName = user.user_metadata?.full_name?.split(' ')[0]
        || user.email.split('@')[0]
      setName(firstName)
    })
  }, [])

  if (!name) return null

  return (
    <a href="/profile" className="hl-week-pill" style={{ textDecoration: 'none', cursor: 'pointer' }}>Bienvenue, {name}</a>
  )
}
