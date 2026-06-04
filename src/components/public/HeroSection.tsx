'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { User, Clock } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Article } from '@/store/public-store'
import { CategoryBadge } from './CategoryBadge'

interface HeroSectionProps {
  article: Article
  onClick: () => void
}

export function HeroSection({ article, onClick }: HeroSectionProps) {
  const publishedDate = article.publishedAt
    ? format(new Date(article.publishedAt), "d 'de' MMMM, yyyy", { locale: es })
    : ''

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative cursor-pointer overflow-hidden"
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
      <div className="relative aspect-[21/9] w-full sm:aspect-[21/7] md:aspect-[21/6]">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            priority
            className="object-cover transition-transform duration-700 hover:scale-[1.02]"
            sizes="100vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-4xl font-bold text-muted-foreground/30">N</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-10 lg:p-14">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl"
          >
            {article.category && (
              <div className="mb-3">
                <CategoryBadge
                  name={article.category.name}
                  color={article.category.color}
                  size="md"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <h1 className="mb-2 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            <p className="mb-4 line-clamp-2 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base md:text-lg">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/70 sm:text-sm">
              {article.author && (
                <div className="flex items-center gap-2">
                  {article.author.avatar ? (
                    <Image
                      src={article.author.avatar}
                      alt={article.author.name}
                      width={32}
                      height={32}
                      className="rounded-full ring-2 ring-white/30"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
                      <User className="h-4 w-4 text-white/80" />
                    </div>
                  )}
                  <span className="font-medium text-white">{article.author.name}</span>
                </div>
              )}
              {publishedDate && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{publishedDate}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Editorial accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-destructive" />
      </div>
    </motion.section>
  )
}
