'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  RotateCcw,
  Building2,
  Vote,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  Sparkles,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface SurveyFormData {
  isAdultResident: string
  gender: string
  ageRange: string
  stratum: string
  neighborhood: string
  cityTrack: string
  mainProblem: string
  mainProblemOther: string
  managementRating: string
  mayorCandidate: string
  priorityTopics: string[]
  firstChange: string
}

const initialFormData: SurveyFormData = {
  isAdultResident: '',
  gender: '',
  ageRange: '',
  stratum: '',
  neighborhood: '',
  cityTrack: '',
  mainProblem: '',
  mainProblemOther: '',
  managementRating: '',
  mayorCandidate: '',
  priorityTopics: [],
  firstChange: '',
}

export function SurveyForm({ onBackToHome }: { onBackToHome?: () => void }) {
  const [formData, setFormData] = useState<SurveyFormData>(initialFormData)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Options matching the PDF
  const genderOptions = ['Hombre', 'Mujer', 'Otro']
  const ageOptions = ['18-25', '26-35', '36-45', '46-55', '56-65', '66 o más']
  const stratumOptions = ['1', '2', '3', '4', '5', '6', 'No sabe']
  const cityTrackOptions = ['Buen camino', 'Mal camino', 'No sabe/No responde']
  const mainProblemOptions = [
    'Movilidad y transporte',
    'Seguridad',
    'Empleo',
    'Servicios públicos',
    'Corrupción',
    'Salud',
    'Educación',
    'Otro',
    'No sabe/No responde',
  ]
  const managementRatingOptions = [
    'Muy buena',
    'Buena',
    'Regular',
    'Mala',
    'Muy mala',
    'No sabe/No responde',
  ]
  const candidateOptions = [
    'Harold Urrea',
    'Felipe Ferro',
    'Cristian Ávila',
    'Óscar Berbeo',
    'William Rosas',
    'Jorge Bolívar',
    'Ninguno de ellos',
    'Votaría en blanco',
    'No sabe/No responde',
  ]
  const priorityTopicOptions = [
    'Movilidad y transporte',
    'Seguridad',
    'Empleo',
    'Servicios públicos',
    'Educación',
    'Salud',
    'Espacios públicos',
  ]

  // Calculate progress
  const answeredCount = useMemo(() => {
    let count = 0
    if (formData.isAdultResident) count++
    if (formData.gender) count++
    if (formData.ageRange) count++
    if (formData.stratum) count++
    if (formData.neighborhood.trim()) count++
    if (formData.cityTrack) count++
    if (formData.mainProblem) count++
    if (formData.managementRating) count++
    if (formData.mayorCandidate) count++
    if (formData.priorityTopics.length > 0) count++
    if (formData.firstChange.trim()) count++
    return count
  }, [formData])

  const progressPercent = Math.min(100, Math.round((answeredCount / 11) * 100))

  const handlePriorityTopicToggle = (topic: string) => {
    setFormData((prev) => {
      const exists = prev.priorityTopics.includes(topic)
      if (exists) {
        return { ...prev, priorityTopics: prev.priorityTopics.filter((t) => t !== topic) }
      }
      if (prev.priorityTopics.length >= 2) {
        toast.warning('Solo puedes seleccionar un máximo de 2 temas.')
        return prev
      }
      return { ...prev, priorityTopics: [...prev.priorityTopics, topic] }
    })
    if (validationErrors.priorityTopics) {
      setValidationErrors((prev) => {
        const next = { ...prev }
        delete next.priorityTopics
        return next
      })
    }
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!formData.isAdultResident) errors.isAdultResident = 'Esta pregunta es obligatoria.'
    if (formData.isAdultResident === 'No') {
      errors.isAdultResident = 'Debe ser mayor de edad y residir en Ibagué para participar.'
    }
    if (!formData.gender) errors.gender = 'Seleccione una opción.'
    if (!formData.ageRange) errors.ageRange = 'Seleccione su rango de edad.'
    if (!formData.stratum) errors.stratum = 'Seleccione el estrato de su vivienda.'
    if (!formData.neighborhood.trim()) errors.neighborhood = 'Ingrese su comuna, barrio o corregimiento.'
    if (!formData.cityTrack) errors.cityTrack = 'Seleccione una opción.'
    if (!formData.mainProblem) errors.mainProblem = 'Seleccione una opción.'
    if (formData.mainProblem === 'Otro' && !formData.mainProblemOther.trim()) {
      errors.mainProblemOther = 'Especifique cuál es el otro problema.'
    }
    if (!formData.managementRating) errors.managementRating = 'Seleccione una opción.'
    if (!formData.mayorCandidate) errors.mayorCandidate = 'Seleccione una opción.'
    if (formData.priorityTopics.length === 0) {
      errors.priorityTopics = 'Seleccione al menos 1 tema (máximo 2).'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Por favor responda las preguntas obligatorias marcadas con asterisco (*)')
      window.scrollTo({ top: 300, behavior: 'smooth' })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/surveys/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (res.ok) {
        setSubmitted(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        toast.success('¡Encuesta enviada exitosamente!')
      } else {
        toast.error(data.error || 'Ocurrió un error al enviar el sondeo')
      }
    } catch {
      toast.error('Error de conexión al enviar el formulario')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    if (window.confirm('¿Desea reiniciar el formulario y borrar las respuestas?')) {
      setFormData(initialFormData)
      setValidationErrors({})
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-zinc-950 py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Navigation Bar / Return */}
        <div className="flex items-center justify-between">
          {onBackToHome && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToHome}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Portal
            </Button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground font-medium">Progreso:</span>
            <div className="w-24 sm:w-32">
              <Progress value={progressPercent} className="h-2" />
            </div>
            <span className="text-xs font-semibold">{progressPercent}%</span>
          </div>
        </div>

        {/* Survey Header Card (Google Forms styled) */}
        <div className="bg-card text-card-foreground rounded-2xl border shadow-sm overflow-hidden relative">
          {/* Top Decorative accent banner */}
          <div className="h-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600" />

          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
                  <Vote className="h-3.5 w-3.5" />
                  Sondeo de Opinión Pública
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Sondeo web #1
                </h1>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-primary" />
                  Ibagué, Tolima, Colombia
                </p>
              </div>

              {/* Company Logo / Header */}
              <div className="flex flex-col items-start sm:items-end justify-center bg-muted/40 dark:bg-muted/10 p-3 rounded-xl border">
                <span className="text-xs font-black tracking-wider uppercase text-foreground">
                  AGUILAR
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                  Consulting Group
                </span>
                <span className="text-[9px] text-muted-foreground/80 font-mono mt-0.5">
                  NIT. 901162722-2
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Le invitamos a expresar su percepción sobre la situación de la ciudad, los principales
              retos y el panorama político de Ibagué. Sus respuestas son completamente confidenciales
              y se procesarán de manera agregada para estudios estadísticos.
            </p>

            <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-medium pt-1">
              <span>* Indica que la pregunta es obligatoria</span>
              <span className="text-muted-foreground">Tiempo estimado: ~2 minutos</span>
            </div>
          </div>
        </div>

        {/* When Submitted, show Google Forms completion screen */}
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="bg-card rounded-2xl border shadow-sm p-8 text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl font-bold tracking-tight">¡Muchas gracias por su tiempo!</h2>
              <p className="text-muted-foreground text-sm">
                Se ha registrado su respuesta exitosamente en el Sondeo Web #1 de Ibagué. Su opinión es
                fundamental para conocer las necesidades y la voz de la ciudadanía.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border max-w-md mx-auto text-left space-y-2 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" /> Aguilar Consulting Group
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> 300 797 4618
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> info@aguilarconsulting.co
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" /> www.aguilarconsulting.co
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Button
                variant="outline"
                onClick={() => {
                  setFormData(initialFormData)
                  setSubmitted(false)
                  setValidationErrors({})
                }}
                className="w-full sm:w-auto"
              >
                Enviar otra respuesta
              </Button>
              {onBackToHome && (
                <Button onClick={onBackToHome} className="w-full sm:w-auto">
                  Ir a las noticias principales
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* P1: Mayor de edad y residente */}
            <div
              className={`bg-card rounded-2xl border p-5 sm:p-6 shadow-sm transition-all duration-200 ${
                validationErrors.isAdultResident ? 'border-destructive ring-1 ring-destructive' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Label className="text-base font-semibold leading-snug">
                    ¿Es usted mayor de edad y reside actualmente en el municipio de Ibagué?{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                </div>

                <div className="space-y-2 pt-1">
                  {['Sí', 'No'].map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        formData.isAdultResident === opt
                          ? 'border-primary bg-primary/5 font-medium'
                          : 'border-border/70 hover:bg-muted/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="isAdultResident"
                        value={opt}
                        checked={formData.isAdultResident === opt}
                        onChange={(e) => {
                          setFormData({ ...formData, isAdultResident: e.target.value })
                          if (validationErrors.isAdultResident) {
                            setValidationErrors((p) => ({ ...p, isAdultResident: '' }))
                          }
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>

                {formData.isAdultResident === 'No' && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3.5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>
                      <strong>Atención:</strong> Este sondeo está dirigido exclusivamente a ciudadanos
                      mayores de edad que residen actualmente en Ibagué. No podrás completar el envío
                      si seleccionas &quot;No&quot;.
                    </p>
                  </div>
                )}

                {validationErrors.isAdultResident && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.isAdultResident}
                  </p>
                )}
              </div>
            </div>

            {/* P2: Sexo */}
            <div
              className={`bg-card rounded-2xl border p-5 sm:p-6 shadow-sm transition-all duration-200 ${
                validationErrors.gender ? 'border-destructive ring-1 ring-destructive' : ''
              }`}
            >
              <div className="space-y-3">
                <Label className="text-base font-semibold leading-snug">
                  Sexo <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {genderOptions.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        formData.gender === opt
                          ? 'border-primary bg-primary/5 font-medium'
                          : 'border-border/70 hover:bg-muted/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={opt}
                        checked={formData.gender === opt}
                        onChange={(e) => {
                          setFormData({ ...formData, gender: e.target.value })
                          if (validationErrors.gender) {
                            setValidationErrors((p) => ({ ...p, gender: '' }))
                          }
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.gender && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.gender}
                  </p>
                )}
              </div>
            </div>

            {/* P3: Edad */}
            <div
              className={`bg-card rounded-2xl border p-5 sm:p-6 shadow-sm transition-all duration-200 ${
                validationErrors.ageRange ? 'border-destructive ring-1 ring-destructive' : ''
              }`}
            >
              <div className="space-y-3">
                <Label className="text-base font-semibold leading-snug">
                  Edad <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {ageOptions.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        formData.ageRange === opt
                          ? 'border-primary bg-primary/5 font-medium'
                          : 'border-border/70 hover:bg-muted/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="ageRange"
                        value={opt}
                        checked={formData.ageRange === opt}
                        onChange={(e) => {
                          setFormData({ ...formData, ageRange: e.target.value })
                          if (validationErrors.ageRange) {
                            setValidationErrors((p) => ({ ...p, ageRange: '' }))
                          }
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.ageRange && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.ageRange}
                  </p>
                )}
              </div>
            </div>

            {/* P4: Estrato socioeconómico */}
            <div
              className={`bg-card rounded-2xl border p-5 sm:p-6 shadow-sm transition-all duration-200 ${
                validationErrors.stratum ? 'border-destructive ring-1 ring-destructive' : ''
              }`}
            >
              <div className="space-y-3">
                <Label className="text-base font-semibold leading-snug">
                  ¿Cuál es el estrato socioeconómico de su vivienda? <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {stratumOptions.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        formData.stratum === opt
                          ? 'border-primary bg-primary/5 font-medium'
                          : 'border-border/70 hover:bg-muted/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="stratum"
                        value={opt}
                        checked={formData.stratum === opt}
                        onChange={(e) => {
                          setFormData({ ...formData, stratum: e.target.value })
                          if (validationErrors.stratum) {
                            setValidationErrors((p) => ({ ...p, stratum: '' }))
                          }
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{opt === 'No sabe' ? opt : `Estrato ${opt}`}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.stratum && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.stratum}
                  </p>
                )}
              </div>
            </div>

            {/* P5: Comuna, barrio o corregimiento (Respuesta abierta) */}
            <div
              className={`bg-card rounded-2xl border p-5 sm:p-6 shadow-sm transition-all duration-200 ${
                validationErrors.neighborhood ? 'border-destructive ring-1 ring-destructive' : ''
              }`}
            >
              <div className="space-y-3">
                <Label className="text-base font-semibold leading-snug" htmlFor="neighborhood">
                  ¿En qué comuna, barrio o corregimiento de Ibagué reside?{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">Respuesta abierta</p>
                <Input
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => {
                    setFormData({ ...formData, neighborhood: e.target.value })
                    if (validationErrors.neighborhood) {
                      setValidationErrors((p) => ({ ...p, neighborhood: '' }))
                    }
                  }}
                  placeholder="Ej: Barrio La Pola, El Salado, Comuna 5, Jordán..."
                  className="rounded-xl"
                />
                {validationErrors.neighborhood && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.neighborhood}
                  </p>
                )}
              </div>
            </div>

            {/* P6: Buen o mal camino */}
            <div
              className={`bg-card rounded-2xl border p-5 sm:p-6 shadow-sm transition-all duration-200 ${
                validationErrors.cityTrack ? 'border-destructive ring-1 ring-destructive' : ''
              }`}
            >
              <div className="space-y-3">
                <Label className="text-base font-semibold leading-snug">
                  En términos generales, ¿usted diría que Ibagué va por buen o por mal camino?{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-2 pt-1">
                  {cityTrackOptions.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        formData.cityTrack === opt
                          ? 'border-primary bg-primary/5 font-medium'
                          : 'border-border/70 hover:bg-muted/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cityTrack"
                        value={opt}
                        checked={formData.cityTrack === opt}
                        onChange={(e) => {
                          setFormData({ ...formData, cityTrack: e.target.value })
                          if (validationErrors.cityTrack) {
                            setValidationErrors((p) => ({ ...p, cityTrack: '' }))
                          }
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.cityTrack && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.cityTrack}
                  </p>
                )}
              </div>
            </div>

            {/* P7: Principal problema que afecta hoy a Ibagué */}
            <div
              className={`bg-card rounded-2xl border p-5 sm:p-6 shadow-sm transition-all duration-200 ${
                validationErrors.mainProblem ? 'border-destructive ring-1 ring-destructive' : ''
              }`}
            >
              <div className="space-y-3">
                <Label className="text-base font-semibold leading-snug">
                  ¿Cuál considera que es el principal problema que afecta hoy a Ibagué?{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {mainProblemOptions.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        formData.mainProblem === opt
                          ? 'border-primary bg-primary/5 font-medium'
                          : 'border-border/70 hover:bg-muted/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mainProblem"
                        value={opt}
                        checked={formData.mainProblem === opt}
                        onChange={(e) => {
                          setFormData({ ...formData, mainProblem: e.target.value })
                          if (validationErrors.mainProblem) {
                            setValidationErrors((p) => ({ ...p, mainProblem: '' }))
                          }
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>

                {formData.mainProblem === 'Otro' && (
                  <div className="pt-2">
                    <Input
                      placeholder="Especifique cuál es el principal problema..."
                      value={formData.mainProblemOther}
                      onChange={(e) => setFormData({ ...formData, mainProblemOther: e.target.value })}
                      className="rounded-xl"
                    />
                    {validationErrors.mainProblemOther && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {validationErrors.mainProblemOther}
                      </p>
                    )}
                  </div>
                )}

                {validationErrors.mainProblem && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.mainProblem}
                  </p>
                )}
              </div>
            </div>

            {/* P8: Gestión de la actual Alcaldía de Ibagué */}
            <div
              className={`bg-card rounded-2xl border p-5 sm:p-6 shadow-sm transition-all duration-200 ${
                validationErrors.managementRating ? 'border-destructive ring-1 ring-destructive' : ''
              }`}
            >
              <div className="space-y-3">
                <Label className="text-base font-semibold leading-snug">
                  ¿Cómo califica la gestión de la actual Alcaldía de Ibagué?{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {managementRatingOptions.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        formData.managementRating === opt
                          ? 'border-primary bg-primary/5 font-medium'
                          : 'border-border/70 hover:bg-muted/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="managementRating"
                        value={opt}
                        checked={formData.managementRating === opt}
                        onChange={(e) => {
                          setFormData({ ...formData, managementRating: e.target.value })
                          if (validationErrors.managementRating) {
                            setValidationErrors((p) => ({ ...p, managementRating: '' }))
                          }
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.managementRating && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.managementRating}
                  </p>
                )}
              </div>
            </div>

            {/* P9: Intención de voto Alcalde de Ibagué */}
            <div
              className={`bg-card rounded-2xl border p-5 sm:p-6 shadow-sm transition-all duration-200 ${
                validationErrors.mayorCandidate ? 'border-destructive ring-1 ring-destructive' : ''
              }`}
            >
              <div className="space-y-3">
                <div>
                  <Label className="text-base font-semibold leading-snug">
                    Si las elecciones para Alcalde de Ibagué fueran hoy, ¿por cuál de ellos votaría?{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Estos nombres han sido tomados por la influencia política en el territorio, no
                    corresponden a campañas oficiales.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {candidateOptions.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        formData.mayorCandidate === opt
                          ? 'border-primary bg-primary/5 font-medium'
                          : 'border-border/70 hover:bg-muted/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mayorCandidate"
                        value={opt}
                        checked={formData.mayorCandidate === opt}
                        onChange={(e) => {
                          setFormData({ ...formData, mayorCandidate: e.target.value })
                          if (validationErrors.mayorCandidate) {
                            setValidationErrors((p) => ({ ...p, mayorCandidate: '' }))
                          }
                        }}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.mayorCandidate && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.mayorCandidate}
                  </p>
                )}
              </div>
            </div>

            {/* P10: Dos temas prioritarios para el próximo Alcalde (Máximo 2) */}
            <div
              className={`bg-card rounded-2xl border p-5 sm:p-6 shadow-sm transition-all duration-200 ${
                validationErrors.priorityTopics ? 'border-destructive ring-1 ring-destructive' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <Label className="text-base font-semibold leading-snug">
                    ¿Cuáles son los dos temas que más le gustaría que priorice el próximo Alcalde?{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Badge
                    variant={formData.priorityTopics.length === 2 ? 'default' : 'secondary'}
                    className="self-start sm:self-auto text-xs"
                  >
                    {formData.priorityTopics.length}/2 seleccionados
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Selección múltiple, máximo 2 opciones.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {priorityTopicOptions.map((opt) => {
                    const isSelected = formData.priorityTopics.includes(opt)
                    const isMaxReached = formData.priorityTopics.length >= 2 && !isSelected

                    return (
                      <label
                        key={opt}
                        onClick={(e) => {
                          if (isMaxReached) {
                            e.preventDefault()
                            toast.warning('Ya has seleccionado el máximo de 2 opciones')
                          }
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'border-primary bg-primary/5 font-medium text-foreground'
                            : isMaxReached
                            ? 'border-border/40 opacity-50 cursor-not-allowed bg-muted/10'
                            : 'border-border/70 hover:bg-muted/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={opt}
                          checked={isSelected}
                          disabled={isMaxReached}
                          onChange={() => handlePriorityTopicToggle(opt)}
                          className="h-4 w-4 rounded text-primary focus:ring-primary disabled:opacity-50"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    )
                  })}
                </div>
                {validationErrors.priorityTopics && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {validationErrors.priorityTopics}
                  </p>
                )}
              </div>
            </div>

            {/* P11: Respuesta abierta opcional */}
            <div className="bg-card rounded-2xl border p-5 sm:p-6 shadow-sm">
              <div className="space-y-3">
                <div>
                  <Label className="text-base font-semibold leading-snug" htmlFor="firstChange">
                    En sus propias palabras, ¿qué es lo primero que le gustaría que cambiara en Ibagué?
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">Pregunta opcional.</p>
                </div>
                <Textarea
                  id="firstChange"
                  rows={4}
                  value={formData.firstChange}
                  onChange={(e) => setFormData({ ...formData, firstChange: e.target.value })}
                  placeholder="Escriba su respuesta…"
                  className="rounded-xl resize-y"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 pb-8">
              <Button
                type="submit"
                disabled={isSubmitting || formData.isAdultResident === 'No'}
                className="w-full sm:w-auto min-w-[200px] h-11 text-sm font-semibold rounded-xl shadow-md gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando respuestas...
                  </>
                ) : (
                  <>
                    <Vote className="h-4 w-4" />
                    Enviar Encuesta
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Borrar formulario
              </Button>
            </div>
          </form>
        )}

        {/* Footer Credit & Legal */}
        <div className="text-center py-6 text-xs text-muted-foreground border-t space-y-1">
          <p className="font-semibold text-foreground">AGUILAR CONSULTING GROUP</p>
          <p>NIT. 901162722-2 | Ibagué, Colombia</p>
          <p className="text-[11px] text-muted-foreground/80">
            Teléfono: 300 797 4618 · Correo: info@aguilarconsulting.co · Web: www.aguilarconsulting.co
          </p>
        </div>
      </div>
    </div>
  )
}
export default SurveyForm
