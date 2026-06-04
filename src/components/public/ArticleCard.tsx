'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Eye, User } from 'lucide-react'
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
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-shadow duration-300 hover:shadow-lg"
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
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <Skeleton className="h-full w-full" />
        )}
        {article.category && (
          <div className="absolute top-3 left-3">
            <CategoryBadge
              name={article.category.name}
              color={article.category.color}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-lg font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-destructive">
          {article.title}
        </h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>

        {/* Meta */}
        <div className="mt-auto flex items-center gap-3 border-t border-border pt-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {article.author ? (
              <>
                {article.author.avatar ? (
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                    <User className="h-3 w-3" />
                  </div>
                )}
                <span className="font-medium text-foreground">{article.author.name}</span>
              </>
            ) : null}
          </div>
          <span className="text-xs text-muted-foreground">
            {publishedDate}
          </span>
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <span>{article.views}</span>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
