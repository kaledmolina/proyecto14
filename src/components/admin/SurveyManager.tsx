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
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Vote className="h-3.5 w-3.5" />
            Ibagué decide · Opinión Pública Ibagué
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Informe de Encuesta: Ibagué</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Resultados consolidados, analítica de intención de voto y exportación en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySurveyLink}
            className="gap-1.5 border-rose-500/25 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 shadow-sm"
            title="Copiar enlace directo /encuesta"
          >
            <Share2 className="h-4 w-4" />
            Copiar Link del Sondeo
          </Button>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-1.5 text-muted-foreground hover:text-foreground"
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
            className="gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loadingStats ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>

          <Button
            size="sm"
            onClick={handleExportExcel}
            disabled={isExporting || (stats?.totalResponses || 0) === 0}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
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

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Responses */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Respuestas
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="space-y-1">
                <div className="text-2xl font-bold">{stats?.totalResponses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-emerald-600">
                    +{stats?.todayResponses || 0}
                  </span>{' '}
                  recibidas hoy
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Candidate */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Intención de Voto #1
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Award className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="space-y-1">
                <div className="text-xl font-bold truncate">
                  {topCandidate ? topCandidate.name : 'Sin datos'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {topCandidate
                    ? `${topCandidate.percentage}% (${topCandidate.count} votos)`
                    : 'A la espera de respuestas'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Problem */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Principal Problema
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="space-y-1">
                <div className="text-xl font-bold truncate">
                  {topProblem ? topProblem.name : 'Sin datos'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {topProblem
                    ? `${topProblem.percentage}% de menciones`
                    : 'A la espera de respuestas'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* City Direction Ratio */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Rumbo de Ibagué
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="space-y-1">
                <div className="text-xl font-bold flex items-center gap-2">
                  <span className="text-emerald-600">{goodTrackPct}%</span>
                  <span className="text-xs text-muted-foreground font-normal">vs</span>
                  <span className="text-rose-600">{badTrackPct}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Buen camino vs Mal camino</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="dashboard" className="text-xs sm:text-sm font-semibold">
            Gráficos e Informe
          </TabsTrigger>
          <TabsTrigger value="opinions" className="text-xs sm:text-sm font-semibold">
            Voz Ciudadana ({stats?.openAnswers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="responses" className="text-xs sm:text-sm font-semibold">
            Respuestas ({totalRecords})
          </TabsTrigger>
        </TabsList>

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
            <div className="space-y-6">
              {/* Row 1: Intención de Voto Alcaldía & Calificación Alcaldía */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Intención de Voto */}
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Intención de Voto para Alcaldía</span>
                      <Badge variant="outline" className="text-xs font-normal">
                        P9 del Sondeo
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Distribución porcentual de preferencias para Alcalde de Ibagué
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={stats?.mayorCandidateStats || []}
                          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 'dataMax + 2']} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={110}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(v) => (v.length > 16 ? `${v.substring(0, 16)}...` : v)}
                          />
                          <Tooltip
                            formatter={(value: any, name: any, item: any) => [
                              `${value} votos (${item?.payload?.percentage}%)`,
                              'Preferencia',
                            ]}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar dataKey="count" fill="#e11d48" radius={[0, 4, 4, 0]}>
                            {(stats?.mayorCandidateStats || []).map((_, idx) => (
                              <Cell key={`cell-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Calificación Gestión Alcaldía */}
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Calificación de la Gestión de la Alcaldía</span>
                      <Badge variant="outline" className="text-xs font-normal">
                        P8 del Sondeo
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Percepción ciudadana sobre la actual Alcaldía de Ibagué
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats?.managementStats || []}
                          margin={{ top: 15, right: 15, left: -15, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            angle={-15}
                            textAnchor="end"
                          />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip
                            formatter={(val: any, _, item: any) => [
                              `${val} respuestas (${item?.payload?.percentage}%)`,
                              'Opinión',
                            ]}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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
                  </CardContent>
                </Card>
              </div>

              {/* Row 2: Rumbo de la Ciudad & Principal Problema */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rumbo de la Ciudad */}
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Rumbo General de Ibagué</span>
                      <Badge variant="outline" className="text-xs font-normal">
                        P6 del Sondeo
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      ¿Va por buen o por mal camino?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats?.cityTrackStats || []}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={4}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
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
                              `${val} respuestas (${item?.payload?.percentage}%)`,
                              'Percepción',
                            ]}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Principal Problema */}
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Principal Problema de Ibagué</span>
                      <Badge variant="outline" className="text-xs font-normal">
                        P7 del Sondeo
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Problemática más urgente identificada por los ciudadanos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats?.mainProblemStats || []}
                          margin={{ top: 15, right: 10, left: -20, bottom: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 9 }}
                            angle={-35}
                            textAnchor="end"
                            interval={0}
                          />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip
                            formatter={(val: any, _, item: any) => [
                              `${val} respuestas (${item?.payload?.percentage}%)`,
                              'Problemática',
                            ]}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]}>
                            {(stats?.mainProblemStats || []).map((_, idx) => (
                              <Cell key={`cell-prob-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Row 3: Temas Prioritarios & Evolución Diaria */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Temas Prioritarios */}
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Temas que Debería Priorizar el Alcalde</span>
                      <Badge variant="outline" className="text-xs font-normal">
                        P10 (Máx. 2 temas)
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Áreas prioritarias demandadas por la ciudadanía
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={stats?.priorityTopicsStats || []}
                          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={110}
                            tick={{ fontSize: 10 }}
                          />
                          <Tooltip
                            formatter={(val: any, _, item: any) => [
                              `${val} menciones (${item?.payload?.percentage}% de encuestados)`,
                              'Tema prioritario',
                            ]}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Tendencia de Respuestas por Día */}
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Participación por Día (Últimos 14 días)</span>
                      <Badge variant="outline" className="text-xs font-normal">
                        Evolución
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Volumen de encuestas diligenciadas por fecha
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={stats?.dailyTrend || []}
                          margin={{ top: 15, right: 15, left: -20, bottom: 20 }}
                        >
                          <defs>
                            <linearGradient id="colorRespuestas" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#e11d48" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                          <Tooltip
                            formatter={(val: any) => [`${val} respuestas`, 'Volumen']}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="respuestas"
                            stroke="#e11d48"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRespuestas)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Row 4: Demografía (Sexo, Edad, Estrato) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sexo */}
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Distribución por Sexo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats?.genderStats || []}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
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
                              borderRadius: '8px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Edad */}
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Grupos de Edad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats?.ageRangeStats || []}
                          margin={{ top: 10, right: 10, left: -25, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip
                            formatter={(v: any, _, item: any) => [
                              `${v} (${item?.payload?.percentage}%)`,
                              'Cantidad',
                            ]}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Estrato */}
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Estrato Socioeconómico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats?.stratumStats || []}
                          margin={{ top: 10, right: 10, left: -25, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip
                            formatter={(v: any, _, item: any) => [
                              `${v} (${item?.payload?.percentage}%)`,
                              'Cantidad',
                            ]}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar dataKey="count" fill="#0891b2" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Row 5: Top Comunas y Barrios */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Barrios y Comunas con Mayor Participación
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Lugares de residencia más frecuentes mencionados por los participantes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {(stats?.topNeighborhoods || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border bg-muted/20 flex flex-col justify-between"
                      >
                        <span className="text-xs font-semibold truncate" title={item.name}>
                          {item.name}
                        </span>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t text-[11px] text-muted-foreground">
                          <span>Respuestas:</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-bold">
                            {item.count}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
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
