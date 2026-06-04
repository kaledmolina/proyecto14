'use client'

import { useState, useCallback } from 'react'
import { useMounted } from '@/hooks/use-mounted'
import { Menu, Moon, Sun, Search, X, LogIn } from 'lucide-react'
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

  const categories = usePublicStore((s) => s.categories)
  const selectedCategory = usePublicStore((s) => s.selectedCategory)
  const selectCategory = usePublicStore((s) => s.selectCategory)
  const search = usePublicStore((s) => s.search)
  const setView = usePublicStore((s) => s.setView)

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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => {
            setView('home')
            handleCategoryClick(null)
          }}
          className="flex items-center gap-2 text-lg font-extrabold tracking-tight"
        >
          <span className="text-destructive" style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem' }}>
            N
          </span>
          <span className="hidden sm:inline">ewsPortal</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`relative px-3 py-2 text-sm font-medium transition-colors hover:text-foreground ${
              selectedCategory === null
                ? 'text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            Todas
            {selectedCategory === null && (
              <motion.div
                layoutId="activeCategory"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-destructive"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`relative px-3 py-2 text-sm font-medium transition-colors hover:text-foreground ${
                selectedCategory === cat.slug
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {cat.name}
              {selectedCategory === cat.slug && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: cat.color }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
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
              <nav className="flex flex-col gap-1 px-4 pt-2" aria-label="Mobile navigation">
                <button
                  onClick={() => {
                    handleCategoryClick(null)
                  }}
                  className={`rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? 'bg-destructive/10 text-destructive'
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
