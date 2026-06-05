'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Eye } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Article } from '@/store/public-store'
import { CategoryBadge } from './CategoryBadge'
import { Skeleton } from '@/components/ui/skeleton'

interface ArticleCardProps {
  article: Article
  onClick: () => void
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  const publishedDate = article.publishedAt
    ? format(new Date(article.publishedAt), "d 'de' MMM, yyyy", { locale: es })
    : null

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm card-shadow-hover transition-all duration-300"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Cover Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/40">
            <span className="text-xl font-bold text-muted-foreground/30 font-heading">colombiadebate</span>
          </div>
        )}
        {article.category && (
          <div className="absolute top-3 left-3 z-10">
            <CategoryBadge
              name={article.category.name}
              color={article.category.color}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2.5 p-5">
        <h3 className="line-clamp-2 text-base font-bold font-heading leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </h3>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>

        {/* Meta */}
        <div className="mt-4 flex items-center gap-3 border-t border-border/30 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          </div>
          <span className="text-[11px] text-muted-foreground/80">
            {publishedDate}
          </span>
          <div className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground/80">
            <Eye className="h-3.5 w-3.5" />
            <span>{article.views}</span>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
