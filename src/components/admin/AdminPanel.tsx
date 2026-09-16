'use client'

import React, { useEffect } from 'react'
import { Session } from 'next-auth'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard,
  FileText,
  Users,
  ScrollText,
  FolderTree,
  Tags,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  PenTool,
  Sun,
  Moon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAdminStore, type AdminSection } from '@/store/admin-store'
import { cn } from '@/lib/utils'

import Dashboard from './Dashboard'
import ArticleManager from './ArticleManager'
import UserManager from './UserManager'
import LogsViewer from './LogsViewer'
import CategoriesManager from './CategoriesManager'
import TagsManager from './TagsManager'
import SettingsManager from './SettingsManager'

interface AdminPanelProps {
  session: Session
  onLogout: () => void
}

interface NavItem {
  id: AdminSection
  label: string
  icon: React.ReactNode
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'articles', label: 'Artículos', icon: <FileText className="h-4 w-4" /> },
  { id: 'users', label: 'Usuarios', icon: <Users className="h-4 w-4" />, adminOnly: true },
  { id: 'logs', label: 'Historial de Actividad', icon: <ScrollText className="h-4 w-4" />, adminOnly: true },
  { id: 'categories', label: 'Categorías', icon: <FolderTree className="h-4 w-4" />, adminOnly: true },
  { id: 'tags', label: 'Etiquetas', icon: <Tags className="h-4 w-4" />, adminOnly: true },
  { id: 'settings', label: 'Configuración', icon: <Settings className="h-4 w-4" />, adminOnly: true },
]

function SidebarContent({
  session,
  activeSection,
  onNavigate,
  onLogout,
}: {
  session: Session
  activeSection: AdminSection
  onNavigate: (section: AdminSection) => void
  onLogout: () => void
}) {
  const isAdmin = session.user.role === 'ADMIN'

  const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <div className="flex h-full flex-col">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold leading-tight">Tolima Informa</h2>
          <p className="text-xs text-muted-foreground">Panel de Control</p>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left w-full',
                activeSection === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      {/* User Info */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={session.user.avatar || undefined} alt={session.user.name} />
            <AvatarFallback className="text-xs">
              {session.user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session.user.name}</p>
            <Badge
              variant={isAdmin ? 'destructive' : 'secondary'}
              className="text-[10px] px-1.5 py-0"
            >
              {isAdmin ? (
                <><Shield className="h-3 w-3 mr-0.5" /> Administrador</>
              ) : (
                <><PenTool className="h-3 w-3 mr-0.5" /> Escritor</>
              )}
            </Badge>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}

export default function AdminPanel({ session, onLogout }: AdminPanelProps) {
  const {
    activeSection,
    setActiveSection,
    sidebarOpen,
    setSidebarOpen,
    fetchStats,
    fetchCategories,
    fetchTags,
  } = useAdminStore()

  const { theme, setTheme } = useTheme()

  const isAdmin = session.user.role === 'ADMIN'

  // Load data on mount
  useEffect(() => {
    fetchStats()
    fetchCategories()
    fetchTags()
  }, [fetchStats, fetchCategories, fetchTags])

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard isAdmin={isAdmin} />
      case 'articles':
        return <ArticleManager isAdmin={isAdmin} userId={session.user.id} />
      case 'users':
        return isAdmin ? <UserManager /> : null
      case 'logs':
        return isAdmin ? <LogsViewer /> : null
      case 'categories':
        return isAdmin ? <CategoriesManager /> : null
      case 'tags':
        return isAdmin ? <TagsManager /> : null
      case 'settings':
        return isAdmin ? <SettingsManager /> : null
      default:
        return <Dashboard isAdmin={isAdmin} />
    }
  }

  const sectionTitle = navItems.find((item) => item.id === activeSection)?.label || 'Dashboard'

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r bg-card">
        <SidebarContent
          session={session}
          activeSection={activeSection}
          onNavigate={setActiveSection}
          onLogout={onLogout}
        />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navegación</SheetTitle>
          </SheetHeader>
          <SidebarContent
            session={session}
            activeSection={activeSection}
            onNavigate={setActiveSection}
            onLogout={onLogout}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b px-4 py-3 lg:px-6 bg-card">
          <div className="flex items-center gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Alternar menú</span>
                </Button>
              </SheetTrigger>
            </Sheet>
            <h1 className="text-lg font-semibold">{sectionTitle}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-600" />
            )}
          </Button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
