'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { SurveyForm } from '@/components/public/SurveyForm'

export default function EncuestaPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-slate-50/70 dark:bg-zinc-950">
      <SurveyForm onBackToHome={() => router.push('/')} />
    </main>
  )
}
