import { create } from 'zustand'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  order: number
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage: string | null
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED'
  isFeatured: boolean
  views: number
  authorId: string
  categoryId: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  author?: { id: string; name: string; avatar?: string | null }
  category?: { id: string; name: string; slug: string; color: string }
  tags?: { tag: Tag }[]
}

interface PublicState {
  currentView: 'home' | 'article'
  selectedArticle: Article | null
  categories: Category[]
  tags: Tag[]
  selectedCategory: string | null
  articles: Article[]
  totalArticles: number
  totalPages: number
  currentPage: number
  searchQuery: string
  isLoading: boolean
  settings: Record<string, string>
  featuredArticle: Article | null

  fetchSettings: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchTags: () => Promise<void>
  fetchArticles: (params?: {
    category?: string
    search?: string
    tag?: string
    page?: number
    limit?: number
    featured?: boolean
  }) => Promise<void>
  fetchArticle: (id: string) => Promise<void>
  setView: (view: 'home' | 'article') => void
  selectCategory: (slug: string | null) => void
  search: (query: string) => void
  setPage: (page: number) => void
}

export const usePublicStore = create<PublicState>((set, get) => ({
  currentView: 'home',
  selectedArticle: null,
  categories: [],
  tags: [],
  selectedCategory: null,
  articles: [],
  totalArticles: 0,
  totalPages: 0,
  currentPage: 1,
  searchQuery: '',
  isLoading: false,
  settings: {},
  featuredArticle: null,

  fetchSettings: async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        const cleanSettings: Record<string, string> = {}
        for (const [k, v] of Object.entries(data)) {
          cleanSettings[k] = typeof v === 'string'
            ? v.replace(/Colombia\s+en\s+Debate/gi, 'Tolima Informa')
            : (v as any)
        }
        if (!cleanSettings.site_name || /Colombia\s+en\s+Debate/i.test(cleanSettings.site_name)) {
          cleanSettings.site_name = 'Tolima Informa'
        }
        set({ settings: cleanSettings })
      }
    } catch {
      console.error('Failed to fetch settings')
    }
  },

  fetchCategories: async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        set({ categories: data.sort((a: Category, b: Category) => a.order - b.order) })
      }
    } catch {
      console.error('Failed to fetch categories')
    }
  },

  fetchTags: async () => {
    try {
      const res = await fetch('/api/tags')
      if (res.ok) {
        const data = await res.json()
        set({ tags: data })
      }
    } catch {
      console.error('Failed to fetch tags')
    }
  },

  fetchArticles: async (params = {}) => {
    set({ isLoading: true })
    try {
      const state = get()
      const queryParams = new URLSearchParams()
      if (params.category || state.selectedCategory) {
        queryParams.set('category', params.category || state.selectedCategory || '')
      }
      if (params.search || state.searchQuery) {
        queryParams.set('search', params.search || state.searchQuery || '')
      }
      if (params.tag) {
        queryParams.set('tag', params.tag)
      }
      queryParams.set('page', String(params.page || state.currentPage))
      queryParams.set('limit', String(params.limit || 12))

      const res = await fetch(`/api/articles?${queryParams.toString()}`)
      if (res.ok) {
        const data = await res.json()
        set({
          articles: data.articles,
          totalArticles: data.total,
          totalPages: data.totalPages,
          currentPage: data.page,
        })
      }
    } catch {
      console.error('Failed to fetch articles')
    } finally {
      set({ isLoading: false })
    }
  },

  fetchArticle: async (id: string) => {
    set({ isLoading: true })
    try {
      const res = await fetch(`/api/articles/${id}`)
      if (res.ok) {
        const article = await res.json()
        set({ selectedArticle: article, currentView: 'article' })
      }
    } catch {
      console.error('Failed to fetch article')
    } finally {
      set({ isLoading: false })
    }
  },

  setView: (view) => {
    set({ currentView: view, selectedArticle: view === 'home' ? null : get().selectedArticle })
    if (view === 'home') {
      get().fetchArticles()
    }
  },

  selectCategory: (slug) => {
    set({ selectedCategory: slug, currentPage: 1, currentView: 'home' })
    get().fetchArticles({ category: slug || undefined, page: 1 })
  },

  search: (query) => {
    set({ searchQuery: query, currentPage: 1, currentView: 'home' })
    get().fetchArticles({ search: query || undefined, page: 1 })
  },

  setPage: (page) => {
    set({ currentPage: page })
    get().fetchArticles({ page })
  },
}))
