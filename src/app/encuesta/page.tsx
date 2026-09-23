'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SurveyForm } from '@/components/public/SurveyForm'

export default function EncuestaPage() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = 'Ibagué decide - Sondeo de Opinión Pública | Tolima Informa'
    }
  }, [])

  return (
    <main className="min-h-screen bg-slate-50/70 dark:bg-zinc-950">
      <SurveyForm onBackToHome={() => router.push('/')} />
    </main>
  )
}
