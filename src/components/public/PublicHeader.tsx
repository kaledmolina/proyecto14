'use client'

import { useState, useCallback } from 'react'
import { useMounted } from '@/hooks/use-mounted'
import { Menu, Moon, Sun, Search, X, LogIn, Loader2, Vote } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { usePublicStore } from '@/store/public-store'

interface PublicHeaderProps {
  onLoginClick: () => void
}

export function PublicHeader({ onLoginClick }: PublicHeaderProps) {
  const mounted = useMounted()
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileSearchQuery, setMobileSearchQuery] = useState('')

  const currentView = usePublicStore((s) => s.currentView)
  const categories = usePublicStore((s) => s.categories)
  const selectedCategory = usePublicStore((s) => s.selectedCategory)
  const selectCategory = usePublicStore((s) => s.selectCategory)
  const search = usePublicStore((s) => s.search)
  const setView = usePublicStore((s) => s.setView)
  
  const settings = usePublicStore((s) => s.settings || {})
  const isSettingsLoading = Object.keys(settings).length === 0
  const rawSiteName = settings.site_name || 'Tolima Informa'
  const siteName = rawSiteName.replace(/Colombia\s+en\s+Debate/gi, 'Tolima Informa')
  const siteLogo = settings.site_logo

  const firstLetter = siteName.charAt(0)
  const restOfName = siteName.slice(1)

  const handleDesktopSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const query = formData.get('search') as string
      search(query)
      setSearchOpen(false)
    },
    [search]
  )

  const handleMobileSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      search(mobileSearchQuery)
      setMobileSearchOpen(false)
      setMobileSearchQuery('')
    },
    [search, mobileSearchQuery]
  )

  const handleCategoryClick = useCallback(
    (slug: string | null) => {
      selectCategory(slug)
    },
    [selectCategory]
  )

  return (
    <header className="sticky top-0 z-40 w-full glass-panel transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => {
            setView('home')
            handleCategoryClick(null)
          }}
          className="flex items-center gap-2 text-xl font-extrabold tracking-tight font-heading"
        >
          {isSettingsLoading ? (
            <div className="flex h-8 items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground font-normal">Cargando...</span>
            </div>
          ) : siteLogo ? (
            <img src={siteLogo} alt={siteName} className="h-10 max-w-[200px] object-contain w-auto transition-transform duration-300 hover:scale-105" />
          ) : (
            <div className="flex items-center gap-1.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-serif font-black shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-110">
                {firstLetter}
              </div>
              <span className="hidden sm:inline text-gradient-primary">{restOfName}</span>
            </div>
          )}
        </button>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-2 lg:flex font-heading" aria-label="Main navigation">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full hover:bg-primary/5 ${
              selectedCategory === null
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Todas
            {selectedCategory === null && (
              <motion.div
                layoutId="activeCategory"
                className="absolute bottom-1 left-4 right-4 h-0.5 bg-primary rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full hover:bg-primary/5 ${
                selectedCategory === cat.slug
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={selectedCategory === cat.slug ? { color: cat.color } : undefined}
            >
              {cat.name}
              {selectedCategory === cat.slug && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}

          {/* Survey Direct Button */}
          <button
            onClick={() => {
              setView('survey')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className={`ml-2 relative flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-300 border ${
              currentView === 'survey'
                ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25'
                : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:scale-105'
            }`}
          >
            <Vote className="h-3.5 w-3.5" />
            <span>Sondeo Ibagué</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </button>
        </nav>

        {/* Desktop Actions */}
        <div className="flex items-center gap-1">
          {/* Desktop Search Toggle */}
          <div className="relative hidden sm:block">
            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleDesktopSearch}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                >
                  <Input
                    name="search"
                    type="search"
                    placeholder="Buscar artículos..."
                    className="h-8 w-full rounded-full border-border bg-secondary pl-3 pr-8 text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
            {!searchOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="h-8 w-8"
                aria-label="Open search"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Login Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onLoginClick}
            className="hidden h-8 w-8 sm:flex"
            aria-label="Login"
          >
            <LogIn className="h-4 w-4" />
          </Button>

          {/* Mobile Hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-left font-bold">Menú</SheetTitle>
              </SheetHeader>

              {/* Mobile Search */}
              <div className="px-4 pb-2">
                <form onSubmit={handleMobileSearch} className="relative">
                  <Input
                    type="search"
                    placeholder="Buscar artículos..."
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                    className="h-9 rounded-full border-border bg-secondary pl-3 pr-8 text-sm"
                  />
                  <Search className="absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </form>
              </div>

              <Separator className="mx-4" />

              {/* Mobile Categories */}
              <nav className="flex flex-col gap-1.5 px-4 pt-2" aria-label="Mobile navigation">
                {/* Mobile Sondeo Callout */}
                <button
                  onClick={() => {
                    setView('survey')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="flex items-center justify-between p-3 mb-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-semibold text-sm shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <Vote className="h-4 w-4" />
                    <span>Ibagué decide</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full font-bold">
                    Participar
                  </span>
                </button>

                <button
                  onClick={() => {
                    handleCategoryClick(null)
                  }}
                  className={`rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  Todas las Noticias
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      handleCategoryClick(cat.slug)
                    }}
                    className={`rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      selectedCategory === cat.slug
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    style={
                      selectedCategory === cat.slug
                        ? { backgroundColor: `${cat.color}15`, color: cat.color }
                        : undefined
                    }
                  >
                    {cat.name}
                  </button>
                ))}
              </nav>

              <Separator className="mx-4 my-3" />

              {/* Login in mobile */}
              <div className="px-4">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={onLoginClick}
                >
                  <LogIn className="h-4 w-4" />
                  Iniciar Sesión
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
