'use client'

import { create } from 'zustand'

// --- Types ---

export type AdminSection = 'dashboard' | 'articles' | 'users' | 'logs' | 'categories' | 'tags' | 'settings'

export interface ArticleAuthor {
  id: string
  name: string
  avatar?: string | null
}

export interface ArticleCategory {
  id: string
  name: string
  slug: string
  color?: string
}

export interface ArticleTag {
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
  coverImage?: string | null
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED'
  isFeatured: boolean
  views: number
  authorId: string
  categoryId?: string | null
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  author?: ArticleAuthor
  category?: ArticleCategory
  tags?: ArticleTag[]
}

export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'WRITER'
  avatar?: string | null
  bio?: string | null
  isActive: boolean
  createdAt: string
  updatedAt?: string
  articleCount?: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  color: string
  order: number
  createdAt: string
  updatedAt?: string
  articleCount?: number
}

export interface Tag {
  id: string
  name: string
  slug: string
  createdAt: string
  articleCount?: number
}

export interface SystemLog {
  id: string
  action: string
  userId?: string | null
  userName: string
  userEmail?: string | null
  details?: string | null
  ipAddress?: string | null
  createdAt: string
}

export interface Stats {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  pendingArticles: number
  totalUsers: number
  totalViews: number
  recentArticles: Pick<Article, 'id' | 'title' | 'slug' | 'status' | 'createdAt' | 'author' | 'category'>[]
  recentLogs: Pick<SystemLog, 'id' | 'action' | 'userId' | 'userName' | 'details' | 'createdAt'>[]
  topArticles?: { title: string; views: number }[]
  categoriesBreakdown?: { name: string; count: number }[]
}

export interface SiteSettings {
  [key: string]: string
}

// --- Store ---

interface AdminState {
  // Navigation
  activeSection: AdminSection
  sidebarOpen: boolean

  // Data
  stats: Stats | null
  articles: Article[]
  users: User[]
  categories: Category[]
  tags: Tag[]
  logs: SystemLog[]
  logsTotal: number
  logsPage: number
  logsTotalPages: number
  settings: SiteSettings

  // Loading states
  isLoading: boolean
  isLoadingArticles: boolean

  // Article filters
  articleStatusFilter: string
  articleSearchQuery: string

  // Log filters
  logActionFilter: string

  // Actions
  setActiveSection: (section: AdminSection) => void
  setSidebarOpen: (open: boolean) => void
  setArticleStatusFilter: (filter: string) => void
  setArticleSearchQuery: (query: string) => void
  setLogActionFilter: (filter: string) => void

  // Fetch methods
  fetchStats: () => Promise<void>
  fetchArticles: () => Promise<void>
  fetchUsers: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchTags: () => Promise<void>
  fetchLogs: (page?: number, action?: string) => Promise<void>
  fetchSettings: () => Promise<void>

  // Article CRUD
  createArticle: (data: {
    title: string
    content: string
    excerpt: string
    coverImage?: string
    categoryId?: string
    tags: string[]
    status: string
    isFeatured?: boolean
  }) => Promise<Article | null>
  updateArticle: (id: string, data: {
    title?: string
    content?: string
    excerpt?: string
    coverImage?: string
    categoryId?: string
    tags?: string[]
    status?: string
    isFeatured?: boolean
  }) => Promise<Article | null>
  deleteArticle: (id: string) => Promise<boolean>

  // User CRUD
  createUser: (data: { email: string; name: string; password: string; role: string }) => Promise<User | null>
  updateUser: (id: string, data: { name?: string; email?: string; role?: string; isActive?: boolean }) => Promise<User | null>
  deleteUser: (id: string) => Promise<boolean>

  // Category CRUD
  createCategory: (data: { name: string; description?: string; color: string; order: number }) => Promise<Category | null>
  updateCategory: (id: string, data: { name?: string; description?: string; color?: string; order?: number }) => Promise<Category | null>
  deleteCategory: (id: string) => Promise<boolean>

  // Tag CRUD
  createTag: (name: string) => Promise<Tag | null>
  deleteTag: (id: string) => Promise<boolean>

  // Settings
  updateSettings: (settings: Record<string, string>) => Promise<boolean>
  updateSingleSetting: (key: string, value: string) => Promise<boolean>
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // Initial state
  activeSection: 'dashboard',
  sidebarOpen: false,
  stats: null,
  articles: [],
  users: [],
  categories: [],
  tags: [],
  logs: [],
  logsTotal: 0,
  logsPage: 1,
  logsTotalPages: 1,
  settings: {},
  isLoading: false,
  isLoadingArticles: false,
  articleStatusFilter: 'ALL',
  articleSearchQuery: '',
  logActionFilter: '',

  // Navigation actions
  setActiveSection: (section) => set({ activeSection: section, sidebarOpen: false }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setArticleStatusFilter: (filter) => set({ articleStatusFilter: filter }),
  setArticleSearchQuery: (query) => set({ articleSearchQuery: query }),
  setLogActionFilter: (filter) => set({ logActionFilter: filter }),

  // Fetch methods
  fetchStats: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/stats')
      if (res.ok) {
        const data = await res.json()
        set({ stats: data })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchArticles: async () => {
    set({ isLoadingArticles: true })
    try {
      const params = new URLSearchParams()
      const { articleStatusFilter, articleSearchQuery } = get()
      // Use all statuses for admin view
      if (articleSearchQuery) params.set('search', articleSearchQuery)
      params.set('limit', '100')
      params.set('page', '1')
      params.set('status', 'ALL')

      const res = await fetch(`/api/articles?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        let filtered = data.articles
        if (articleStatusFilter && articleStatusFilter !== 'ALL') {
          filtered = filtered.filter((a: Article) => a.status === articleStatusFilter)
        }
        set({ articles: filtered })
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      set({ isLoadingArticles: false })
    }
  },

  fetchUsers: async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        set({ users: data })
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  },

  fetchCategories: async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        set({ categories: data })
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  },

  fetchTags: async () => {
    try {
      const res = await fetch('/api/tags')
      if (res.ok) {
        const data = await res.json()
        set({ tags: data })
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  },

  fetchLogs: async (page = 1, action?: string) => {
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (action) params.set('action', action)
      else {
        const filter = get().logActionFilter
        if (filter) params.set('action', filter)
      }

      const res = await fetch(`/api/logs?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        set({
          logs: data.logs,
          logsTotal: data.total,
          logsPage: data.page,
          logsTotalPages: data.totalPages,
        })
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  },

  fetchSettings: async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        set({ settings: data })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  },

  // Article CRUD
  createArticle: async (data) => {
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const article = await res.json()
        set((state) => ({ articles: [article, ...state.articles] }))
        return article
      }
      return null
    } catch (error) {
      console.error('Failed to create article:', error)
      return null
    }
  },

  updateArticle: async (id, data) => {
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const article = await res.json()
        set((state) => ({
          articles: state.articles.map((a) => (a.id === id ? article : a)),
        }))
        return article
      }
      return null
    } catch (error) {
      console.error('Failed to update article:', error)
      return null
    }
  },

  deleteArticle: async (id) => {
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
      if (res.ok) {
        set((state) => ({ articles: state.articles.filter((a) => a.id !== id) }))
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete article:', error)
      return false
    }
  },

  // User CRUD
  createUser: async (data) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const user = await res.json()
        set((state) => ({ users: [user, ...state.users] }))
        return user
      }
      return null
    } catch (error) {
      console.error('Failed to create user:', error)
      return null
    }
  },

  updateUser: async (id, data) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const user = await res.json()
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? user : u)),
        }))
        return user
      }
      return null
    } catch (error) {
      console.error('Failed to update user:', error)
      return null
    }
  },

  deleteUser: async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        set((state) => ({ users: state.users.map((u) => (u.id === id ? { ...u, isActive: false } : u)) }))
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete user:', error)
      return false
    }
  },

  // Category CRUD
  createCategory: async (data) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const category = await res.json()
        set((state) => ({ categories: [...state.categories, category] }))
        return category
      }
      return null
    } catch (error) {
      console.error('Failed to create category:', error)
      return null
    }
  },

  updateCategory: async (id, data) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const category = await res.json()
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? category : c)),
        }))
        return category
      }
      return null
    } catch (error) {
      console.error('Failed to update category:', error)
      return null
    }
  },

  deleteCategory: async (id) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (res.ok) {
        set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }))
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete category:', error)
      return false
    }
  },

  // Tag CRUD
  createTag: async (name) => {
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const tag = await res.json()
        set((state) => ({ tags: [...state.tags, tag] }))
        return tag
      }
      return null
    } catch (error) {
      console.error('Failed to create tag:', error)
      return null
    }
  },

  deleteTag: async (id) => {
    try {
      const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' })
      if (res.ok) {
        set((state) => ({ tags: state.tags.filter((t) => t.id !== id) }))
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete tag:', error)
      return false
    }
  },

  // Settings
  updateSettings: async (settings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      if (res.ok) {
        const data = await res.json()
        set((state) => ({ settings: { ...state.settings, ...data } }))
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to update settings:', error)
      return false
    }
  },

  updateSingleSetting: async (key, value) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      if (res.ok) {
        set((state) => ({ settings: { ...state.settings, [key]: value } }))
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to update setting:', error)
      return false
    }
  },
}))
