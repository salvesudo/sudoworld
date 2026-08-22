'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [result, setResult] = useState('Testing...')
  const [details, setDetails] = useState('')

  useEffect(() => {
    async function testSupabase() {
      const { data, error } = await supabase
        .from('test_connection')
        .select('*')

      console.log('SUPABASE DATA:', data)
      console.log('SUPABASE ERROR:', error)

      if (error) {
        setResult('SUPABASE ERROR')
        setDetails(JSON.stringify(error, null, 2))
        return
      }

      setResult('SUPABASE CONNECTION SUCCESS')
      setDetails(JSON.stringify(data, null, 2))
    }

    testSupabase()
  }, [])

  return (
    <main style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1>SudoWorld</h1>

      <h2>{result}</h2>

      <pre
        style={{
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
        }}
      >
        {details}
      </pre>
    </main>
  )
}