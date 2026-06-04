'use client'

import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, SlidersHorizontal } from 'lucide-react'
import { usePublicStore } from '@/store/public-store'
import { ArticleCard } from './ArticleCard'
import { CategoryBadge } from './CategoryBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'

export function NewsGrid() {
  const articles = usePublicStore((s) => s.articles)
  const categories = usePublicStore((s) => s.categories)
  const selectedCategory = usePublicStore((s) => s.selectedCategory)
  const currentPage = usePublicStore((s) => s.currentPage)
  const totalPages = usePublicStore((s) => s.totalPages)
  const isLoading = usePublicStore((s) => s.isLoading)
  const selectCategory = usePublicStore((s) => s.selectCategory)
  const fetchArticle = usePublicStore((s) => s.fetchArticle)
  const setPage = usePublicStore((s) => s.setPage)
  const searchQuery = usePublicStore((s) => s.searchQuery)
  const search = usePublicStore((s) => s.search)

  const [sortBy, setSortBy] = useState<'latest' | 'views'>('latest')

  const handleArticleClick = useCallback(
    (id: string) => {
      fetchArticle(id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [fetchArticle]
  )

  const handleCategorySelect = useCallback(
    (slug: string | null) => {
      selectCategory(slug)
    },
    [selectCategory]
  )

  // Sort articles locally
  const sortedArticles = [...articles].sort((a, b) => {
    if (sortBy === 'views') {
      return b.views - a.views
    }
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : new Date(a.createdAt).getTime()
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : new Date(b.createdAt).getTime()
    return dateB - dateA
  })

  // Loading skeletons
  if (isLoading && articles.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Category filters skeleton */}
        <div className="mb-8 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-sm" />
          ))}
        </div>
        {/* Grid skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-border">
              <Skeleton className="aspect-[16/10] w-full" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center gap-3 pt-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // Empty state
  if (!isLoading && articles.length === 0) {
    return (
      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <Newspaper className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">No se encontraron artículos</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          {selectedCategory || searchQuery
            ? 'Ningún artículo coincide con los filtros.'
            : 'Comienza publicando tu primer artículo.'}
        </p>
        {(selectedCategory || searchQuery) && (
          <button
            onClick={() => {
              handleCategorySelect(null)
              search('')
            }}
            className="text-sm font-medium text-destructive hover:underline"
          >
            Limpiar todos los filtros
          </button>
        )}
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Category Filter Tabs */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`rounded-sm px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              selectedCategory === null
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <CategoryBadge
              key={cat.id}
              name={cat.name}
              color={cat.color}
              slug={cat.slug}
              onClick={() => handleCategorySelect(cat.slug)}
              className={
                selectedCategory === cat.slug
                  ? 'ring-1 ring-offset-1'
                  : 'opacity-70 hover:opacity-100'
              }
            />
          ))}
        </div>
      )}

      {/* Search status banner */}
      {searchQuery && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Mostrando resultados de búsqueda para:</span>
            <span className="font-semibold text-foreground">"{searchQuery}"</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => search('')}
            className="h-7 text-xs text-destructive hover:bg-destructive/10"
          >
            Limpiar Búsqueda
          </Button>
        </div>
      )}

      {/* Section header & sorting */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name || 'Últimas'
              : 'Últimas Historias'}
          </h2>
          <div className="h-px w-full bg-border" />
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground mr-1">Ordenar:</span>
          <div className="inline-flex rounded-lg bg-muted p-0.5">
            <button
              onClick={() => setSortBy('latest')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                sortBy === 'latest'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Recientes
            </button>
            <button
              onClick={() => setSortBy('views')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                sortBy === 'views'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Populares
            </button>
          </div>
        </div>
      </div>

      {/* Article Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {sortedArticles.map((article) => (
            <motion.div
              key={article.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <ArticleCard
                article={article}
                onClick={() => handleArticleClick(article.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading more indicator */}
      {isLoading && articles.length > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full bg-destructive"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
            />
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-10">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) {
                    setPage(currentPage - 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
                aria-disabled={currentPage <= 1}
                className={currentPage <= 1 ? 'pointer-events-none opacity-40' : ''}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1
              const isFirst = page === 1
              const isLast = page === totalPages
              const isNearCurrent = Math.abs(page - currentPage) <= 1
              const showEllipsisBefore = !isFirst && page === currentPage - 2
              const showEllipsisAfter = !isLast && page === currentPage + 2

              if (showEllipsisBefore || showEllipsisAfter) {
                return (
                  <PaginationItem key={`ellipsis-${page}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }

              if (!isFirst && !isLast && !isNearCurrent && !showEllipsisBefore && !showEllipsisAfter) {
                return null
              }

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(page)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage < totalPages) {
                    setPage(currentPage + 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
                aria-disabled={currentPage >= totalPages}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-40' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </section>
  )
}
