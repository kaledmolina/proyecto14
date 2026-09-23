'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Vote,
  Download,
  RefreshCw,
  Search,
  Trash2,
  Eye,
  Calendar,
  Building2,
  Users,
  Award,
  AlertTriangle,
  TrendingUp,
  MapPin,
  MessageSquare,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Shield,
  Loader2,
  Share2,
  Copy,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Scale,
  BarChart3,
  ListOrdered,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import { toast } from 'sonner'

// Colors for charts
const PALETTE = [
  '#e11d48', // rose-600
  '#2563eb', // blue-600
  '#16a34a', // green-600
  '#d97706', // amber-600
  '#9333ea', // purple-600
  '#0891b2', // cyan-600
  '#ea580c', // orange-600
  '#4f46e5', // indigo-600
  '#64748b', // slate-500
]

const RATING_COLORS: Record<string, string> = {
  'Muy buena': '#16a34a',
  'Buena': '#22c55e',
  'Regular': '#eab308',
  'Mala': '#f97316',
  'Muy mala': '#dc2626',
  'No sabe/No responde': '#94a3b8',
}

const TRACK_COLORS: Record<string, string> = {
  'Buen camino': '#16a34a',
  'Mal camino': '#dc2626',
  'No sabe/No responde': '#94a3b8',
}

interface StatItem {
  name: string
  count: number
  percentage?: number
}

interface SurveyStats {
  totalResponses: number
  todayResponses: number
  cityTrackStats: StatItem[]
  managementStats: StatItem[]
  mayorCandidateStats: StatItem[]
  mainProblemStats: StatItem[]
  priorityTopicsStats: StatItem[]
  genderStats: StatItem[]
  ageRangeStats: StatItem[]
  stratumStats: StatItem[]
  topNeighborhoods: { name: string; count: number }[]
  openAnswers: {
    id: string
    fullName?: string
    answer: string
    neighborhood: string
    ageRange: string
    gender: string
    createdAt: string
  }[]
  dailyTrend: { date: string; respuestas: number }[]
}

interface SurveyResponseRecord {
  id: string
  surveyCode: string
  fullName: string
  isAdultResident: string
  gender: string
  ageRange: string
  stratum: string
  neighborhood: string
  cityTrack: string
  mainProblem: string
  mainProblemOther?: string | null
  managementRating: string
  mayorCandidate: string
  priorityTopics: string
  firstChange?: string | null
  ipAddress?: string | null
  createdAt: string
}

export default function SurveyManager() {
  const [stats, setStats] = useState<SurveyStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // Responses list state
  const [responses, setResponses] = useState<SurveyResponseRecord[]>([])
  const [loadingResponses, setLoadingResponses] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')

  // Modal inspection
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponseRecord | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Search filter for open answers
  const [openAnswerSearch, setOpenAnswerSearch] = useState('')

  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const res = await fetch('/api/surveys/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else {
        toast.error('No se pudieron cargar las estadísticas')
      }
    } catch {
      toast.error('Error al conectar con el servidor')
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const fetchResponses = useCallback(
    async (targetPage = 1, query = searchQuery) => {
      setLoadingResponses(true)
      try {
        const params = new URLSearchParams()
        params.set('page', String(targetPage))
        params.set('limit', '15')
        if (query.trim()) params.set('search', query.trim())

        const res = await fetch(`/api/surveys/responses?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setResponses(data.responses)
          setTotalPages(data.totalPages)
          setTotalRecords(data.total)
          setPage(data.page)
        }
      } catch {
        toast.error('Error al cargar lista de respuestas')
      } finally {
        setLoadingResponses(false)
      }
    },
    [searchQuery]
  )

  useEffect(() => {
    fetchStats()
    fetchResponses(1)
  }, [fetchStats, fetchResponses])

  // Export to Excel handler
  const handleExportExcel = async () => {
    setIsExporting(true)
    try {
      const res = await fetch('/api/surveys/export')
      if (!res.ok) {
        throw new Error('Error en la descarga')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const dateStr = new Date().toISOString().split('T')[0]
      a.download = `Sondeo_Ibague_Respuestas_${dateStr}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Archivo Excel descargado exitosamente')
    } catch (err) {
      console.error(err)
      toast.error('Error al exportar el archivo Excel')
    } finally {
      setIsExporting(false)
    }
  }

  // Delete response handler
  const handleDeleteResponse = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar esta respuesta de la encuesta?')) return

    try {
      const res = await fetch(`/api/surveys/responses/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Respuesta eliminada')
        fetchResponses(page)
        fetchStats()
        if (selectedResponse?.id === id) {
          setIsModalOpen(false)
          setSelectedResponse(null)
        }
      } else {
        toast.error('No se pudo eliminar la respuesta')
      }
    } catch {
      toast.error('Error al intentar eliminar la respuesta')
    }
  }

  // Filtered open answers
  const filteredOpenAnswers = (stats?.openAnswers || []).filter((ans) => {
    if (!openAnswerSearch.trim()) return true
    const term = openAnswerSearch.toLowerCase()
    return (
      (ans.fullName && ans.fullName.toLowerCase().includes(term)) ||
      ans.answer.toLowerCase().includes(term) ||
      ans.neighborhood.toLowerCase().includes(term) ||
      ans.gender.toLowerCase().includes(term)
    )
  })

  // Candidates sorted
  const topCandidate = stats?.mayorCandidateStats?.[0]
  const topProblem = stats?.mainProblemStats?.[0]
  const goodTrackPct =
    stats?.cityTrackStats?.find((t) => t.name === 'Buen camino')?.percentage || 0
  const badTrackPct =
    stats?.cityTrackStats?.find((t) => t.name === 'Mal camino')?.percentage || 0
  const otherTrackPct =
    stats?.cityTrackStats?.find((t) => t.name === 'No sabe/No responde')?.percentage || 0

  const positiveRatingPct = (
    (stats?.managementStats?.find((m) => m.name === 'Muy buena')?.percentage || 0) +
    (stats?.managementStats?.find((m) => m.name === 'Buena')?.percentage || 0)
  ).toFixed(1)
  const negativeRatingPct = (
    (stats?.managementStats?.find((m) => m.name === 'Mala')?.percentage || 0) +
    (stats?.managementStats?.find((m) => m.name === 'Muy mala')?.percentage || 0)
  ).toFixed(1)
  const regularRatingPct = (
    stats?.managementStats?.find((m) => m.name === 'Regular')?.percentage || 0
  ).toFixed(1)

  const [candidateViewMode, setCandidateViewMode] = useState<'ranking' | 'chart'>('ranking')

  const handleCopySurveyLink = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/encuesta` : '/encuesta'
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = url
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      toast.success('¡Enlace directo a la encuesta copiado!', {
        description: url,
      })
    } catch {
      toast.info(`Enlace directo: ${url}`)
    }
  }

  return (
    <div className="space-y-8 max-w-[1550px] mx-auto pb-12">
      {/* Top Banner & Action Header */}
      <div className="relative overflow-hidden bg-card border rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 border-0 font-semibold gap-1.5 px-3 py-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                Sondeo en Vivo
              </Badge>
              <Badge variant="outline" className="text-muted-foreground text-xs font-normal">
                Ibagué, Tolima
              </Badge>
              <Badge variant="outline" className="text-muted-foreground text-xs font-normal">
                {stats?.totalResponses || 0} ciudadanos registrados
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ibagué decide · Informe de Encuesta
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Analítica de opinión pública ciudadana en tiempo real, intención de voto a la Alcaldía, problemáticas de ciudad y gestión gubernamental.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySurveyLink}
              className="gap-2 border-rose-500/25 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 shadow-sm rounded-xl font-medium"
              title="Copiar enlace directo /encuesta"
            >
              <Share2 className="h-4 w-4" />
              Copiar Link Directo
            </Button>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 text-muted-foreground hover:text-foreground rounded-xl"
            >
              <a href="/encuesta" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Ver encuesta
              </a>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchStats()
                fetchResponses(page)
                toast.info('Datos actualizados')
              }}
              disabled={loadingStats}
              className="gap-2 rounded-xl"
            >
              <RefreshCw className={`h-4 w-4 ${loadingStats ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>

            <Button
              size="sm"
              onClick={handleExportExcel}
              disabled={isExporting || (stats?.totalResponses || 0) === 0}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-xl font-medium"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              Descargar Excel (.xlsx)
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Respuestas */}
        <Card className="rounded-2xl shadow-sm hover:shadow transition-all border p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Respuestas
            </span>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-3xl font-extrabold tracking-tight">
              {loadingStats ? <Skeleton className="h-9 w-20" /> : (stats?.totalResponses.toLocaleString() || 0)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              <span className="inline-flex items-center text-emerald-600 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                +{stats?.todayResponses || 0} hoy
              </span>
              participaciones ciudadanas
            </p>
          </div>
        </Card>

        {/* Intención de Voto #1 */}
        <Card className="rounded-2xl shadow-sm hover:shadow transition-all border p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Intención de Voto #1
            </span>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-xl font-bold tracking-tight truncate text-foreground">
              {loadingStats ? <Skeleton className="h-7 w-28" /> : (topCandidate && topCandidate.count > 0 ? topCandidate.name : 'Sin votos aún')}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              {topCandidate && topCandidate.count > 0 ? (
                <span className="text-amber-600 font-semibold">
                  {topCandidate.percentage}% ({topCandidate.count} {topCandidate.count === 1 ? 'voto' : 'votos'})
                </span>
              ) : (
                'A la espera de respuestas'
              )}
            </p>
          </div>
        </Card>

        {/* Principal Problema */}
        <Card className="rounded-2xl shadow-sm hover:shadow transition-all border p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Principal Problema
            </span>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-xl font-bold tracking-tight truncate text-foreground">
              {loadingStats ? <Skeleton className="h-7 w-28" /> : (topProblem && topProblem.count > 0 ? topProblem.name : 'Sin registrar')}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              {topProblem && topProblem.count > 0 ? (
                <span className="text-rose-600 font-semibold">
                  {topProblem.percentage}% de menciones
                </span>
              ) : (
                'A la espera de respuestas'
              )}
            </p>
          </div>
        </Card>

        {/* Rumbo de la Ciudad */}
        <Card className="rounded-2xl shadow-sm hover:shadow transition-all border p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Rumbo de Ibagué
            </span>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-xl font-bold flex items-center gap-2">
              <span className="text-emerald-600 font-extrabold">{goodTrackPct}%</span>
              <span className="text-[11px] text-muted-foreground font-normal">Buen camino</span>
              <span className="text-muted-foreground/30 font-light">/</span>
              <span className="text-rose-600 font-extrabold">{badTrackPct}%</span>
              <span className="text-[11px] text-muted-foreground font-normal">Mal camino</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Percepción del rumbo general
            </p>
          </div>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <TabsList className="grid grid-cols-3 max-w-md p-1.5 h-auto rounded-2xl bg-muted/70">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm font-semibold rounded-xl gap-2 py-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Métricas y</span> Gráficos
            </TabsTrigger>
            <TabsTrigger value="opinions" className="text-xs sm:text-sm font-semibold rounded-xl gap-2 py-2">
              <MessageSquare className="h-4 w-4" />
              Voz Ciudadana ({stats?.openAnswers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="responses" className="text-xs sm:text-sm font-semibold rounded-xl gap-2 py-2">
              <FileSpreadsheet className="h-4 w-4" />
              Respuestas ({totalRecords})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: GRÁFICOS E INFORME ESTADÍSTICO */}
        <TabsContent value="dashboard" className="space-y-6">
          {loadingStats ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <Skeleton className="h-64 w-full" />
                </Card>
              ))}
            </div>
          ) : (stats?.totalResponses || 0) === 0 ? (
            <Card className="p-12 text-center rounded-2xl border-dashed">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Vote className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Aún no se registran respuestas en el Sondeo</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                Una vez los ciudadanos comiencen a responder la encuesta desde la web o mediante el
                enlace directo, las estadísticas y gráficos aparecerán aquí automáticamente.
              </p>
              <Button
                variant="outline"
                onClick={() => window.open('/encuesta', '_blank')}
                className="gap-2"
              >
                Abrir Encuesta Pública
              </Button>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Row 1: Intención de Voto Alcaldía & Calificación Alcaldía */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Intención de Voto para Alcaldía */}
                <Card className="lg:col-span-7 rounded-3xl shadow-sm border p-6 sm:p-7 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-semibold bg-rose-500/10 text-rose-600 border-0 px-2 py-0.5">
                          P9 del Sondeo
                        </Badge>
                        <span className="text-xs text-muted-foreground font-medium">Elecciones Ibagué</span>
                      </div>
                      <h3 className="text-lg font-bold tracking-tight">Intención de Voto para Alcaldía</h3>
                      <p className="text-xs text-muted-foreground">Distribución porcentual y conteo de votos de los candidatos</p>
                    </div>

                    {/* Toggle Ranking / Gráfico */}
                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl self-start sm:self-center">
                      <Button
                        type="button"
                        variant={candidateViewMode === 'ranking' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCandidateViewMode('ranking')}
                        className="h-7 text-xs px-2.5 rounded-lg gap-1.5 font-semibold"
                      >
                        <ListOrdered className="h-3.5 w-3.5" />
                        Ranking
                      </Button>
                      <Button
                        type="button"
                        variant={candidateViewMode === 'chart' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCandidateViewMode('chart')}
                        className="h-7 text-xs px-2.5 rounded-lg gap-1.5 font-semibold"
                      >
                        <BarChart3 className="h-3.5 w-3.5" />
                        Gráfico
                      </Button>
                    </div>
                  </div>

                  {candidateViewMode === 'ranking' ? (
                    <div className="space-y-3">
                      {(stats?.mayorCandidateStats || []).map((c, idx) => (
                        <div
                          key={c.name}
                          className="p-3.5 rounded-2xl border bg-card/60 hover:bg-muted/20 transition-colors space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5 font-semibold text-foreground">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                                  idx === 0 && c.count > 0
                                    ? 'bg-amber-500 text-white shadow-sm'
                                    : idx === 1 && c.count > 0
                                    ? 'bg-slate-400 text-white'
                                    : idx === 2 && c.count > 0
                                    ? 'bg-amber-700 text-white'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <span className="font-bold text-sm tracking-tight truncate max-w-[200px] sm:max-w-[320px]">
                                {c.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-xs font-medium">
                                {c.count} {c.count === 1 ? 'voto' : 'votos'}
                              </span>
                              <Badge
                                variant="secondary"
                                className="font-extrabold text-xs px-2.5 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              >
                                {c.percentage}%
                              </Badge>
                            </div>
                          </div>
                          <div className="w-full bg-muted/60 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{
                                width: `${Math.max(c.percentage || 0, c.count > 0 ? 3 : 0)}%`,
                                backgroundColor: PALETTE[idx % PALETTE.length],
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-96 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={stats?.mayorCandidateStats || []}
                          margin={{ top: 5, right: 35, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                          <XAxis
                            type="number"
                            allowDecimals={false}
                            domain={[0, (max: number) => Math.max(max + 1, 4)]}
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={115}
                            tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                            tickFormatter={(v) => (v.length > 16 ? `${v.substring(0, 16)}...` : v)}
                          />
                          <Tooltip
                            formatter={(value: any, _, item: any) => [
                              `${value} votos (${item?.payload?.percentage}%)`,
                              'Preferencia',
                            ]}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '12px',
                              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                            }}
                          />
                          <Bar dataKey="count" maxBarSize={16} radius={[0, 6, 6, 0]}>
                            {(stats?.mayorCandidateStats || []).map((_, idx) => (
                              <Cell key={`cell-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </Card>

                {/* Calificación Gestión Alcaldía */}
                <Card className="lg:col-span-5 rounded-3xl shadow-sm border p-6 sm:p-7 space-y-5">
                  <div className="border-b pb-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-semibold bg-amber-500/10 text-amber-600 border-0 px-2 py-0.5">
                        P8 del Sondeo
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">Evaluación Institucional</span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">Calificación de la Gestión</h3>
                    <p className="text-xs text-muted-foreground">Percepción ciudadana sobre la actual Alcaldía de Ibagué</p>
                  </div>

                  <div className="h-72 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats?.managementStats || []}
                        margin={{ top: 20, right: 15, left: -20, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          angle={-20}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis
                          allowDecimals={false}
                          domain={[0, (max: number) => Math.max(max + 1, 4)]}
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                          formatter={(val: any, _, item: any) => [
                            `${val} respuestas (${item?.payload?.percentage}%)`,
                            'Calificación',
                          ]}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Bar dataKey="count" maxBarSize={34} radius={[6, 6, 0, 0]}>
                          {(stats?.managementStats || []).map((entry, idx) => (
                            <Cell
                              key={`cell-${idx}`}
                              fill={RATING_COLORS[entry.name] || PALETTE[idx % PALETTE.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Resumen ejecutivo de aprobación */}
                  <div className="grid grid-cols-3 gap-2.5 pt-3 border-t text-center">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block tracking-wider">
                        Positiva
                      </span>
                      <span className="text-base font-extrabold text-emerald-600">
                        {positiveRatingPct}%
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block tracking-wider">
                        Regular
                      </span>
                      <span className="text-base font-extrabold text-amber-600">
                        {regularRatingPct}%
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 block tracking-wider">
                        Negativa
                      </span>
                      <span className="text-base font-extrabold text-rose-600">
                        {negativeRatingPct}%
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Row 2: Rumbo de la Ciudad & Principal Problema */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Rumbo de la Ciudad */}
                <Card className="lg:col-span-5 rounded-3xl shadow-sm border p-6 sm:p-7 space-y-5">
                  <div className="border-b pb-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-semibold bg-blue-500/10 text-blue-600 border-0 px-2 py-0.5">
                        P6 del Sondeo
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">Clima de Opinión</span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">Rumbo General de Ibagué</h3>
                    <p className="text-xs text-muted-foreground">¿Considera que la ciudad va por buen o por mal camino?</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-7 h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats?.cityTrackStats || []}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={88}
                            paddingAngle={3}
                          >
                            {(stats?.cityTrackStats || []).map((entry) => (
                              <Cell
                                key={entry.name}
                                fill={TRACK_COLORS[entry.name] || '#94a3b8'}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(val: any, _, item: any) => [
                              `${val} votos (${item?.payload?.percentage}%)`,
                              'Percepción',
                            ]}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '12px',
                              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="sm:col-span-5 space-y-2">
                      {(stats?.cityTrackStats || []).map((t) => (
                        <div
                          key={t.name}
                          className="p-2.5 rounded-xl border bg-muted/10 space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground flex items-center gap-1.5 truncate">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: TRACK_COLORS[t.name] || '#94a3b8' }}
                              />
                              <span className="truncate">{t.name}</span>
                            </span>
                            <span className="font-bold">{t.percentage}%</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground flex justify-between">
                            <span>{t.count} {t.count === 1 ? 'voto' : 'votos'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Principal Problema */}
                <Card className="lg:col-span-7 rounded-3xl shadow-sm border p-6 sm:p-7 space-y-5">
                  <div className="border-b pb-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-semibold bg-rose-500/10 text-rose-600 border-0 px-2 py-0.5">
                        P7 del Sondeo
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">Diagnóstico de Urgencias</span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">Principal Problema de Ibagué</h3>
                    <p className="text-xs text-muted-foreground">Problemática más urgente identificada por los ciudadanos</p>
                  </div>

                  <div className="h-80 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={stats?.mainProblemStats?.slice(0, 8) || []}
                        margin={{ top: 5, right: 35, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          domain={[0, (max: number) => Math.max(max + 1, 4)]}
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={130}
                          tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                          tickFormatter={(v) => (v.length > 18 ? `${v.substring(0, 18)}...` : v)}
                        />
                        <Tooltip
                          formatter={(val: any, _, item: any) => [
                            `${val} respuestas (${item?.payload?.percentage}%)`,
                            'Problemática',
                          ]}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Bar dataKey="count" maxBarSize={16} radius={[0, 6, 6, 0]}>
                          {(stats?.mainProblemStats || []).map((_, idx) => (
                            <Cell key={`cell-prob-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Row 3: Temas Prioritarios & Evolución Diaria */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Temas Prioritarios */}
                <Card className="rounded-3xl shadow-sm border p-6 sm:p-7 space-y-5">
                  <div className="border-b pb-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-semibold bg-indigo-500/10 text-indigo-600 border-0 px-2 py-0.5">
                        P10 del Sondeo
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">Prioridades de Acción</span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">Temas que Debería Priorizar el Alcalde</h3>
                    <p className="text-xs text-muted-foreground">Demandas ciudadanas de intervención inmediata</p>
                  </div>

                  <div className="h-80 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={stats?.priorityTopicsStats?.slice(0, 8) || []}
                        margin={{ top: 5, right: 35, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          domain={[0, (max: number) => Math.max(max + 1, 4)]}
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={130}
                          tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                          tickFormatter={(v) => (v.length > 18 ? `${v.substring(0, 18)}...` : v)}
                        />
                        <Tooltip
                          formatter={(val: any, _, item: any) => [
                            `${val} menciones (${item?.payload?.percentage}% de participantes)`,
                            'Tema Prioritario',
                          ]}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Bar dataKey="count" fill="#2563eb" maxBarSize={16} radius={[0, 6, 6, 0]}>
                          {(stats?.priorityTopicsStats || []).map((_, idx) => (
                            <Cell key={`cell-prio-${idx}`} fill={PALETTE[(idx + 2) % PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Tendencia de Respuestas por Día */}
                <Card className="rounded-3xl shadow-sm border p-6 sm:p-7 space-y-5">
                  <div className="border-b pb-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 border-0 px-2 py-0.5">
                        Evolución Temporal
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">Últimos 14 días</span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">Participación Diaria</h3>
                    <p className="text-xs text-muted-foreground">Volumen de encuestas diligenciadas por fecha</p>
                  </div>

                  <div className="h-80 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={stats?.dailyTrend || []}
                        margin={{ top: 15, right: 15, left: -20, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient id="colorRespuestas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#e11d48" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="#e11d48" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} domain={[0, (max: number) => Math.max(max + 1, 4)]} />
                        <Tooltip
                          formatter={(val: any) => [`${val} respuestas`, 'Volumen']}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="respuestas"
                          stroke="#e11d48"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorRespuestas)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Row 4: Demografía (Sexo, Edad, Estrato) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-semibold bg-primary/10 text-primary border-0 px-2.5 py-0.5">
                    Perfil Demográfico
                  </Badge>
                  <h4 className="text-base font-bold text-foreground">Composición de la Muestra</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sexo */}
                  <Card className="rounded-3xl shadow-sm border p-6 space-y-4">
                    <div className="border-b pb-3">
                      <h4 className="text-sm font-bold">Distribución por Género</h4>
                      <p className="text-[11px] text-muted-foreground">Proporción de participantes</p>
                    </div>
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats?.genderStats || []}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={75}
                            paddingAngle={3}
                            label={({ name, percentage }) => `${name} (${percentage}%)`}
                          >
                            {(stats?.genderStats || []).map((_, idx) => (
                              <Cell key={`gender-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '12px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Edad */}
                  <Card className="rounded-3xl shadow-sm border p-6 space-y-4">
                    <div className="border-b pb-3">
                      <h4 className="text-sm font-bold">Grupos de Edad</h4>
                      <p className="text-[11px] text-muted-foreground">Rango etario de encuestados</p>
                    </div>
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats?.ageRangeStats || []}
                          margin={{ top: 10, right: 10, left: -25, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                          <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} angle={-25} textAnchor="end" interval={0} />
                          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} domain={[0, (max: number) => Math.max(max + 1, 4)]} />
                          <Tooltip
                            formatter={(v: any, _, item: any) => [
                              `${v} (${item?.payload?.percentage}%)`,
                              'Cantidad',
                            ]}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '12px',
                            }}
                          />
                          <Bar dataKey="count" fill="#4f46e5" maxBarSize={22} radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Estrato */}
                  <Card className="rounded-3xl shadow-sm border p-6 space-y-4">
                    <div className="border-b pb-3">
                      <h4 className="text-sm font-bold">Estrato Socioeconómico</h4>
                      <p className="text-[11px] text-muted-foreground">Nivel socioeconómico reportado</p>
                    </div>
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats?.stratumStats || []}
                          margin={{ top: 10, right: 10, left: -25, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                          <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} angle={-25} textAnchor="end" interval={0} />
                          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} domain={[0, (max: number) => Math.max(max + 1, 4)]} />
                          <Tooltip
                            formatter={(v: any, _, item: any) => [
                              `${v} (${item?.payload?.percentage}%)`,
                              'Cantidad',
                            ]}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '12px',
                            }}
                          />
                          <Bar dataKey="count" fill="#0891b2" maxBarSize={20} radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Row 5: Top Comunas y Barrios */}
              <Card className="rounded-3xl shadow-sm border p-6 sm:p-7 space-y-5">
                <div className="border-b pb-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 border-0 px-2 py-0.5">
                      Territorio
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">Ubicación Geográfica</span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-rose-600" />
                    Barrios y Comunas con Mayor Participación
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Sectores residenciales más activos en la encuesta
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                  {(stats?.topNeighborhoods || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border bg-muted/15 hover:bg-muted/30 transition-colors flex flex-col justify-between space-y-2"
                    >
                      <span className="text-xs font-bold truncate text-foreground" title={item.name}>
                        {item.name}
                      </span>
                      <div className="flex items-center justify-between pt-1.5 border-t text-[11px] text-muted-foreground">
                        <span>Respuestas</span>
                        <Badge variant="secondary" className="text-[11px] px-2 py-0 font-bold bg-primary/10 text-primary">
                          {item.count}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: VOZ CIUDADANA (RESPUESTAS ABIERTAS P11) */}
        <TabsContent value="opinions" className="space-y-4">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Lo que la gente quiere que cambie en Ibagué
                </CardTitle>
                <CardDescription className="text-xs">
                  Respuestas abiertas directas a la pregunta 11 del sondeo
                </CardDescription>
              </div>
              <div className="w-full sm:w-64">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Filtrar por palabra, barrio..."
                    value={openAnswerSearch}
                    onChange={(e) => setOpenAnswerSearch(e.target.value)}
                    className="h-8 pl-8 text-xs rounded-xl"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredOpenAnswers.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  No se encontraron respuestas abiertas con ese criterio de búsqueda.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOpenAnswers.map((ans) => (
                    <div
                      key={ans.id}
                      className="p-4 rounded-xl border bg-muted/15 space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          {ans.fullName || 'Ciudadano anónimo'}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {ans.neighborhood}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground leading-relaxed italic bg-background/50 p-2.5 rounded-lg border">
                        &quot;{ans.answer}&quot;
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span className="flex items-center gap-1 font-semibold text-foreground/80">
                          <MapPin className="h-3 w-3" /> {ans.neighborhood}
                        </span>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span>
                            {ans.gender} · {ans.ageRange}
                          </span>
                          <span>•</span>
                          <span>{new Date(ans.createdAt).toLocaleDateString('es-CO')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: TABLA DETALLADA DE RESPUESTAS */}
        <TabsContent value="responses" className="space-y-4">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">Listado Completo de Respuestas</CardTitle>
                <CardDescription className="text-xs">
                  {totalRecords} respuestas totales registradas
                </CardDescription>
              </div>

              {/* Search in table */}
              <div className="flex items-center gap-2 w-full sm:w-72">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar barrio, candidato..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') fetchResponses(1, searchQuery)
                    }}
                    className="h-8 pl-8 text-xs rounded-xl"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchResponses(1, searchQuery)}
                  className="h-8 text-xs"
                >
                  Buscar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-xs">#</TableHead>
                      <TableHead className="text-xs">Fecha y Hora</TableHead>
                      <TableHead className="text-xs">Ciudadano / Nombre</TableHead>
                      <TableHead className="text-xs">Barrio / Comuna</TableHead>
                      <TableHead className="text-xs">Perfil</TableHead>
                      <TableHead className="text-xs">Rumbo</TableHead>
                      <TableHead className="text-xs">Alcaldía</TableHead>
                      <TableHead className="text-xs">Candidato</TableHead>
                      <TableHead className="text-xs text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingResponses ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={9}>
                            <Skeleton className="h-8 w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : responses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-sm text-muted-foreground">
                          No hay respuestas registradas aún.
                        </TableCell>
                      </TableRow>
                    ) : (
                      responses.map((r, idx) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {(page - 1) * 15 + idx + 1}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {new Date(r.createdAt).toLocaleString('es-CO', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-foreground max-w-[140px] truncate">
                            {r.fullName || 'Anónimo'}
                          </TableCell>
                          <TableCell className="text-xs font-semibold">{r.neighborhood}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {r.gender} · {r.ageRange} · Est. {r.stratum}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              variant="outline"
                              className={
                                r.cityTrack === 'Buen camino'
                                  ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                                  : r.cityTrack === 'Mal camino'
                                  ? 'border-rose-500 text-rose-600 bg-rose-50/50 dark:bg-rose-950/20'
                                  : ''
                              }
                            >
                              {r.cityTrack}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{r.managementRating}</TableCell>
                          <TableCell className="text-xs font-medium">{r.mayorCandidate}</TableCell>
                          <TableCell className="text-xs text-right space-x-1 whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                setSelectedResponse(r)
                                setIsModalOpen(true)
                              }}
                              title="Ver encuesta completa"
                            >
                              <Eye className="h-3.5 w-3.5 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteResponse(r.id)}
                              title="Eliminar respuesta"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t text-xs">
                  <span className="text-muted-foreground">
                    Página {page} de {totalPages} ({totalRecords} respuestas)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1 || loadingResponses}
                      onClick={() => fetchResponses(page - 1)}
                      className="h-8 text-xs"
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages || loadingResponses}
                      onClick={() => fetchResponses(page + 1)}
                      className="h-8 text-xs"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Inspection Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5 text-primary" />
              Detalle de Respuesta del Sondeo
            </DialogTitle>
            <DialogDescription>
              ID: {selectedResponse?.id} · Registrado el{' '}
              {selectedResponse
                ? new Date(selectedResponse.createdAt).toLocaleString('es-CO')
                : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedResponse && (
            <div className="space-y-4 pt-2 text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border">
                <div className="col-span-2 pb-1 border-b">
                  <span className="text-xs text-muted-foreground block">Nombre Completo:</span>
                  <span className="text-base font-bold text-primary">
                    {selectedResponse.fullName || 'No especificado (Anónimo)'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Mayor de edad y residente:</span>
                  <span className="font-semibold">{selectedResponse.isAdultResident}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Sexo / Rango de Edad:</span>
                  <span className="font-semibold">
                    {selectedResponse.gender} · {selectedResponse.ageRange}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Estrato:</span>
                  <span className="font-semibold">{selectedResponse.stratum}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Barrio / Comuna:</span>
                  <span className="font-semibold">{selectedResponse.neighborhood}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl border">
                  <span className="text-xs font-semibold text-muted-foreground block">
                    P6: Rumbo de Ibagué
                  </span>
                  <span className="text-base font-bold">{selectedResponse.cityTrack}</span>
                </div>

                <div className="p-3 rounded-xl border">
                  <span className="text-xs font-semibold text-muted-foreground block">
                    P7: Principal problema que afecta a la ciudad
                  </span>
                  <span className="text-base font-bold">{selectedResponse.mainProblem}</span>
                  {selectedResponse.mainProblemOther && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Detalle: {selectedResponse.mainProblemOther}
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-xl border">
                  <span className="text-xs font-semibold text-muted-foreground block">
                    P8: Calificación de la gestión de la Alcaldía
                  </span>
                  <span className="text-base font-bold">{selectedResponse.managementRating}</span>
                </div>

                <div className="p-3 rounded-xl border">
                  <span className="text-xs font-semibold text-muted-foreground block">
                    P9: Intención de voto para Alcalde de Ibagué
                  </span>
                  <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                    {selectedResponse.mayorCandidate}
                  </span>
                </div>

                <div className="p-3 rounded-xl border">
                  <span className="text-xs font-semibold text-muted-foreground block">
                    P10: Temas que debe priorizar el próximo Alcalde
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {(() => {
                      try {
                        const parsed = JSON.parse(selectedResponse.priorityTopics || '[]')
                        return (parsed as string[]).map((t) => (
                          <Badge key={t} variant="secondary">
                            {t}
                          </Badge>
                        ))
                      } catch {
                        return <Badge>{selectedResponse.priorityTopics}</Badge>
                      }
                    })()}
                  </div>
                </div>

                {selectedResponse.firstChange && (
                  <div className="p-3 rounded-xl border bg-muted/20">
                    <span className="text-xs font-semibold text-muted-foreground block">
                      P11: En sus propias palabras, ¿qué es lo primero que le gustaría cambiar?
                    </span>
                    <p className="mt-1 text-sm italic font-medium">
                      &quot;{selectedResponse.firstChange}&quot;
                    </p>
                  </div>
                )}

                {selectedResponse.ipAddress && (
                  <p className="text-[11px] text-muted-foreground/70">
                    IP registrada: {selectedResponse.ipAddress}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
