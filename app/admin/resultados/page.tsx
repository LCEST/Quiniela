'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Match } from '@/types'
import { isAdmin } from '@/lib/admin'
import { GlassCard, Badge } from '@/components/ui/modern'
import Flag from '@/components/Flag'
import { 
  Trophy, 
  Save, 
  Check, 
  AlertCircle, 
  ArrowLeft, 
  LogOut,
  ChevronDown,
  Search,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { SignOutButton } from '@clerk/nextjs'

async function fetchAdminMatches() {
  const res = await fetch('/api/admin/results')
  if (!res.ok) throw new Error('Failed to fetch matches')
  const data = await res.json()
  return data.matches as Match[]
}

async function updateResult(matchId: string, homeScore: number, awayScore: number) {
  const res = await fetch('/api/admin/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchId, homeScore, awayScore }),
  })
  if (!res.ok) throw new Error('Failed to update result')
  return res.json()
}

export default function AdminResultsPage() {
  const { user, isLoaded } = useUser()
  const queryClient = useQueryClient()
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({})
  const [savedMatch, setSavedMatch] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)

  const userEmail = user?.emailAddresses?.[0]?.emailAddress
  const userIsAdmin = isAdmin(userEmail)

  if (isLoaded && !userIsAdmin) {
    redirect('/partidos')
  }

  const { data: matches, isLoading } = useQuery({
    queryKey: ['admin-matches'],
    queryFn: fetchAdminMatches,
    enabled: userIsAdmin,
  })

  const updateMutation = useMutation({
    mutationFn: ({ matchId, homeScore, awayScore }: { matchId: string; homeScore: number; awayScore: number }) =>
      updateResult(matchId, homeScore, awayScore),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-matches'] })
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      queryClient.invalidateQueries({ queryKey: ['predictions'] })
    },
  })

  useEffect(() => {
    if (matches) {
      const initialScores: Record<string, { home: string; away: string }> = {}
      matches.forEach((match) => {
        initialScores[match.id] = {
          home: match.home_score?.toString() || '',
          away: match.away_score?.toString() || '',
        }
      })
      setScores(initialScores)
    }
  }, [matches])

  const handleSave = (matchId: string) => {
    const score = scores[matchId]
    if (!score || score.home === '' || score.away === '') return

    const homeScore = parseInt(score.home)
    const awayScore = parseInt(score.away)

    if (isNaN(homeScore) || isNaN(awayScore)) return

    updateMutation.mutate(
      { matchId, homeScore, awayScore },
      {
        onSuccess: () => {
          setSavedMatch(matchId)
          setTimeout(() => setSavedMatch(null), 2000)
        },
      }
    )
  }

  const filteredMatches = matches?.filter(match => 
    match.home_team?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.away_team?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.home_team?.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.away_team?.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.group_letter?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-GT', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted">Cargando partidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground leading-tight">Admin</h1>
                <p className="text-xs text-muted">Resultados</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/partidos"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-muted hover:text-foreground hover:bg-white/10 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Link>
              <SignOutButton>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Instructions */}
        <GlassCard className="p-4 mb-6 border-amber-500/10" hover={false}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Instrucciones</h3>
              <p className="text-sm text-muted mt-1 leading-relaxed">
                1. Ingresa los goles de cada equipo.<br/>
                2. Presiona "Guardar Resultado".<br/>
                3. El sistema calculará automáticamente los puntos de todas las predicciones.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar equipo, grupo..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card/60 border border-white/5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/30 transition-all"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 mb-4 text-xs text-muted">
          <span>{filteredMatches?.length || 0} partidos</span>
          <span className="w-1 h-1 rounded-full bg-muted/30" />
          <span>{matches?.filter(m => m.status === 'finished').length || 0} completados</span>
          <span className="w-1 h-1 rounded-full bg-muted/30" />
          <span>{matches?.filter(m => m.status !== 'finished').length || 0} pendientes</span>
        </div>

        {/* Matches */}
        <div className="grid gap-3">
          <AnimatePresence>
            {filteredMatches?.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <GlassCard 
                  className={cn(
                    'overflow-hidden',
                    match.status === 'finished' && 'border-green-500/20'
                  )}
                  hover={match.status !== 'finished'}
                >
                  {/* Match Header */}
                  <button
                    onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant={match.status === 'finished' ? 'success' : 'primary'}>
                        Grupo {match.group_letter}
                      </Badge>
                      <span className="text-xs text-muted">{formatDateTime(match.match_date)}</span>
                      {match.status === 'finished' && (
                        <Badge variant="success">
                          <Check className="w-3 h-3" />
                          Completado
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">#{match.match_order}</span>
                      <motion.div
                        animate={{ rotate: expandedMatch === match.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Match Content */}
                  <AnimatePresence>
                    {expandedMatch === match.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5">
                          {/* Teams */}
                          <div className="flex items-center gap-4 mb-6">
                            {/* Home Team */}
                            <div className="flex-1 flex items-center gap-3">
                              <Flag isoCode={match.home_team?.iso_code || 'UN'} size={40} />
                              <div>
                                <p className="font-bold text-sm text-foreground">{match.home_team?.name}</p>
                                <p className="text-xs text-muted">{match.home_team?.code}</p>
                              </div>
                            </div>

                            {/* Score Inputs */}
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs text-muted font-medium">{match.home_team?.code}</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={20}
                                  value={scores[match.id]?.home || ''}
                                  onChange={(e) =>
                                    setScores((prev) => ({
                                      ...prev,
                                      [match.id]: { ...prev[match.id], home: e.target.value },
                                    }))
                                  }
                                  className="w-16 h-12 text-center text-xl font-bold bg-card/80 border-2 border-white/10 rounded-xl focus:border-primary focus:outline-none text-foreground transition-all"
                                  placeholder="0"
                                />
                              </div>
                              <span className="text-muted font-bold text-lg mt-4">-</span>
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs text-muted font-medium">{match.away_team?.code}</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={20}
                                  value={scores[match.id]?.away || ''}
                                  onChange={(e) =>
                                    setScores((prev) => ({
                                      ...prev,
                                      [match.id]: { ...prev[match.id], away: e.target.value },
                                    }))
                                  }
                                  className="w-16 h-12 text-center text-xl font-bold bg-card/80 border-2 border-white/10 rounded-xl focus:border-primary focus:outline-none text-foreground transition-all"
                                  placeholder="0"
                                />
                              </div>
                            </div>

                            {/* Away Team */}
                            <div className="flex-1 flex items-center gap-3 justify-end">
                              <div className="text-right">
                                <p className="font-bold text-sm text-foreground">{match.away_team?.name}</p>
                                <p className="text-xs text-muted">{match.away_team?.code}</p>
                              </div>
                              <Flag isoCode={match.away_team?.iso_code || 'UN'} size={40} />
                            </div>
                          </div>

                          {/* Save Button */}
                          <div className="flex justify-end">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSave(match.id)}
                              disabled={
                                updateMutation.isPending ||
                                scores[match.id]?.home === '' ||
                                scores[match.id]?.away === ''
                              }
                              className={cn(
                                'flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all',
                                savedMatch === match.id
                                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                                  : updateMutation.isPending
                                  ? 'bg-white/5 text-muted cursor-not-allowed'
                                  : 'bg-gradient-to-r from-primary to-emerald-500 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40'
                              )}
                            >
                              {savedMatch === match.id ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  ¡Guardado!
                                </>
                              ) : updateMutation.isPending ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Guardando...
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4" />
                                  Guardar Resultado
                                </>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}
