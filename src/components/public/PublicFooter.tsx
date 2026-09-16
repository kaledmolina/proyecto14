'use client'

import { Github, Twitter, Rss, Heart, Loader2 } from 'lucide-react'
import { usePublicStore } from '@/store/public-store'
import { Separator } from '@/components/ui/separator'

export function PublicFooter() {
  const categories = usePublicStore((s) => s.categories)
  const tags = usePublicStore((s) => s.tags)

  const settings = usePublicStore((s) => s.settings || {})
  const isSettingsLoading = Object.keys(settings).length === 0
  const siteName = settings.site_name || 'Tolima Informa'
  const siteLogo = settings.site_logo

  const firstLetter = siteName.charAt(0)
  const restOfName = siteName.slice(1)

  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border/40 bg-card/60 backdrop-blur-md">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              {isSettingsLoading ? (
                <div className="flex h-8 items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              ) : siteLogo ? (
                <img src={siteLogo} alt={siteName} className="h-10 max-w-[200px] object-contain w-auto transition-transform duration-300 hover:scale-105" />
              ) : (
                <div className="flex items-center gap-1.5 font-heading">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-serif font-black shadow-md shadow-primary/20">
                    {firstLetter}
                  </div>
                  <span className="text-base font-extrabold tracking-tight text-gradient-primary">{restOfName}</span>
                </div>
              )}
            </div>
            <p className="mb-6 max-w-sm text-xs leading-relaxed text-muted-foreground">
              Tu fuente confiable de noticias de última hora, análisis en profundidad e historias de todo el mundo.
            </p>
            {/* Social Links */}
            <div className="flex gap-2">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/65 text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/65 text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:scale-110"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/65 text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:scale-110"
                aria-label="RSS Feed"
              >
                <Rss className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="sm:justify-self-end font-heading">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground/80">
              Categorías
            </h4>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2.5">
              {categories.slice(0, 8).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => usePublicStore.getState().selectCategory(cat.slug)}
                    className="text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <Separator className="bg-border/30" />
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-[11px] text-muted-foreground/80">
          © {currentYear} {siteName}. Todos los derechos reservados.
        </p>
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
          Hecho con <Heart className="h-3 w-3 text-primary animate-pulse" /> para el periodismo
        </p>
      </div>
    </footer>
  )
}
