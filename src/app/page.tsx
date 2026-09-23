'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePublicStore } from '@/store/public-store'
import { useAdminStore } from '@/store/admin-store'
import { PublicHeader } from '@/components/public/PublicHeader'
import { HeroCarousel } from '@/components/public/HeroCarousel'
import { NewsGrid } from '@/components/public/NewsGrid'
import { ArticleDetail } from '@/components/public/ArticleDetail'
import { PublicFooter } from '@/components/public/PublicFooter'
import { SurveyForm } from '@/components/public/SurveyForm'
import AdminPanel from '@/components/admin/AdminPanel'
import SetupScreen from '@/components/admin/SetupScreen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Globe, Shield, X, Loader2, Vote, Share2 } from 'lucide-react'
import { toast } from 'sonner'

// ============================================================
// Public Portal View
// ============================================================
function PublicPortal({ onLoginClick }: { onLoginClick: () => void }) {
  const currentView = usePublicStore((s) => s.currentView)
  const articles = usePublicStore((s) => s.articles)
  const fetchCategories = usePublicStore((s) => s.fetchCategories)
  const fetchSettings = usePublicStore((s) => s.fetchSettings)
  const fetchArticles = usePublicStore((s) => s.fetchArticles)
  const fetchArticle = usePublicStore((s) => s.fetchArticle)
  const setView = usePublicStore((s) => s.setView)

  const publicSettings = usePublicStore((s) => s.settings)
  const selectedArticle = usePublicStore((s) => s.selectedArticle)

  useEffect(() => {
    fetchCategories()
    fetchSettings()
  }, [fetchCategories, fetchSettings])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (
        params.get('view') === 'survey' ||
        params.has('encuesta') ||
        params.has('sondeo') ||
        window.location.hash === '#encuesta' ||
        window.location.hash === '#survey'
      ) {
        setView('survey')
      }
    }
  }, [setView])

  const handleShareDirectSurvey = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/encuesta` : '/encuesta'
    const title = 'Ibagué decide - Sondeo de Opinión Pública'
    const text = 'Participa en el sondeo ciudadano "Ibagué decide" y da a conocer tu opinión sobre el rumbo y futuro de nuestra ciudad:'

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url })
        toast.success('¡Enlace compartido exitosamente!')
        return
      } catch (err: any) {
        if (err?.name === 'AbortError') return
      }
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = url
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      toast.success('¡Enlace directo copiado al portapapeles!', {
        description: url,
      })
    } catch {
      toast.info(`Enlace directo: ${url}`)
    }
  }

  useEffect(() => {
    if (currentView === 'home') {
      fetchArticles({ limit: 12 })
    }
  }, [currentView, fetchArticles])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rawSiteName = publicSettings.site_name || 'Tolima Informa'
      const siteName = rawSiteName.replace(/Colombia\s+en\s+Debate/gi, 'Tolima Informa')
      const rawSeoTitle = publicSettings.seo_title || `${siteName} | Portal de Noticias Digital`
      const seoTitle = rawSeoTitle.replace(/Colombia\s+en\s+Debate/gi, 'Tolima Informa')
      if (currentView === 'survey') {
        document.title = `Ibagué decide | ${siteName}`
      } else if (currentView === 'article' && selectedArticle) {
        document.title = `${selectedArticle.title} | ${siteName}`
      } else {
        document.title = seoTitle
      }
    }
  }, [currentView, selectedArticle, publicSettings])

  // Get articles for carousel: featured ones first, or fallback to top 4 latest
  const featured = articles.filter((a) => a.isFeatured)
  const carouselArticles = featured.length > 0 ? featured.slice(0, 4) : articles.slice(0, 4)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader onLoginClick={onLoginClick} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Carousel Banner */}
              {carouselArticles.length > 0 && (
                <HeroCarousel
                  articles={carouselArticles}
                  onArticleClick={(id) => {
                    fetchArticle(id)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />
              )}

              {/* Sondeo Web Banner */}
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-700 to-amber-700 text-white p-6 sm:p-7 shadow-lg">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur">
                        <Vote className="h-3.5 w-3.5" /> Sondeo de Opinión Pública #1
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                        ¿Cómo ve el rumbo y el futuro de Ibagué?
                      </h2>
                      <p className="text-white/90 text-xs sm:text-sm">
                        Participe en nuestro sondeo de opinión ciudadana. 
                        Su percepción sobre las problemáticas y el futuro de la ciudad es fundamental. Solo toma 2 minutos.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <Button
                        onClick={() => {
                          setView('survey')
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className="bg-white text-rose-700 hover:bg-white/95 font-bold px-5 py-2.5 h-auto text-sm shadow-md rounded-xl hover:scale-105 transition-transform"
                      >
                        Responder Sondeo Ahora
                      </Button>
                      <Button
                        type="button"
                        onClick={handleShareDirectSurvey}
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2.5 h-auto text-sm backdrop-blur border border-white/30 rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-sm"
                      >
                        <Share2 className="h-4 w-4" />
                        Compartir enlace
                      </Button>
                    </div>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                </div>
              </div>

              {/* News Grid & Sidebar Layout */}
              <NewsGrid />
            </motion.div>
          ) : currentView === 'survey' ? (
            <motion.div
              key="survey"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SurveyForm onBackToHome={() => setView('home')} />
            </motion.div>
          ) : (
            <motion.div
              key="article"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArticleDetail />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <PublicFooter />
    </div>
  )
}

// ============================================================
// Login Modal
// ============================================================
function LoginModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Credenciales inválidas. Verifica tu email y contraseña.')
      } else {
        toast.success('Sesión iniciada correctamente')
        onOpenChange(false)
        setEmail('')
        setPassword('')
        setError('')
        onSuccess()
      }
    } catch {
      setError('Error al iniciar sesión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
              <Shield className="h-4 w-4 text-destructive" />
            </div>
            Iniciar Sesión
          </DialogTitle>
          <DialogDescription>
            Ingresa tus credenciales para acceder al panel de administración.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@newsportal.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// Main App with Auth
// ============================================================
export function AppContent() {
  const { data: session, status } = useSession()
  const [loginOpen, setLoginOpen] = useState(false)
  const [view, setView] = useState<'public' | 'admin'>('public')
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null)

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await fetch('/api/auth/setup')
        if (res.ok) {
          const data = await res.json()
          setNeedsSetup(data.needsSetup)
        }
      } catch (err) {
        console.error('Failed to check setup status:', err)
      }
    }
    checkSetup()
  }, [])

  const handleLoginClick = useCallback(() => {
    if (session) {
      setView('admin')
    } else {
      setLoginOpen(true)
    }
  }, [session])

  const handleLoginSuccess = useCallback(() => {
    setView('admin')
  }, [])

  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: '/' })
    setView('public')
    useAdminStore.getState().setActiveSection('dashboard')
    toast.info('Sesión cerrada')
  }, [])

  // When session changes, if user logs out, go back to public
  useEffect(() => {
    if (!session && view === 'admin') {
      // Defer the state update to avoid synchronous setState in effect
      requestAnimationFrame(() => setView('public'))
    }
  }, [session, view])

  if (status === 'loading' || needsSetup === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-destructive border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (needsSetup) {
    return <SetupScreen onSetupComplete={() => setNeedsSetup(false)} />
  }

  return (
    <>
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSuccess={handleLoginSuccess}
      />

      {view === 'admin' && session ? (
        <motion.div
          key="admin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Admin top bar with back to public */}
          <div className="fixed top-0 right-0 z-50 p-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView('public')}
              className="gap-1.5 bg-background/95 backdrop-blur shadow-sm"
            >
              <Globe className="h-3.5 w-3.5" />
              Ver Sitio
            </Button>
          </div>
          <AdminPanel session={session} onLogout={handleLogout} />
        </motion.div>
      ) : (
        <motion.div
          key="public"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Admin button if logged in */}
          {session && view === 'public' && (
            <div className="fixed bottom-20 right-4 z-50 sm:bottom-6">
              <Button
                onClick={() => setView('admin')}
                className="gap-2 shadow-lg"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Panel Admin</span>
              </Button>
            </div>
          )}
          <PublicPortal onLoginClick={handleLoginClick} />
        </motion.div>
      )}
    </>
  )
}

// ============================================================
// Page Root
// ============================================================
export default function Home() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  )
}
