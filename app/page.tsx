'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [message, setMessage] = useState('Connecting to Supabase...')

  useEffect(() => {
    async function testSupabase() {
      const { data, error } = await supabase
        .from('test_connection')
        .select('*')
        .limit(1)

      if (error) {
        console.error(error)
        setMessage(`Supabase error: ${error.message}`)
        return
      }

      setMessage(data?.[0]?.message ?? 'Connected, but no data found.')
    }

    testSupabase()
  }, [])

  return (
    <main style={{ padding: '40px' }}>
      <h1>SudoWorld</h1>

      <p>{message}</p>
    </main>
  )
}