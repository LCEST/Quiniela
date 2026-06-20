'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  User,
  CalendarDays,
  Target,
  ChevronDown,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import { SignOutButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'

interface AdminUser {
  id: string
  email: string
  display_name: string
}

interface AdminMatch {
  id: string
  match_order: number
  match_date: string
  status: string
  home_team: { id: string; name: string; code: string; iso_code: string }
  away_team: { id: string; name: string; code: string; iso_code: string }
}

async function fetchAdminData() {
  const res = await fetch('/api/admin/predictions')
  if (!res.ok) throw new Error('Failed to fetch admin data')
  const data = await res.json()
  return {
    users: data.users as AdminUser[],
    matches: data.matches as AdminMatch[],
  }
}

async function createPrediction(payload: {
  user_id: string
  match_id: string
  predicted_result: 'home_win' | 'draw' | 'away_win'
  home_score: number | null
  away_score: number | null
}) {
  const res = await fetch('/api/admin/predictions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to save prediction')
  }
  return res.json()
}

export default function AdminPredictionsPage() {
  const { user, isLoaded } = useUser()
  const queryClient = useQueryClient()

  const userEmail = user?.emailAddresses?.[0]?.emailAddress
  const userIsAdmin = isAdmin(userEmail)

  if (isLoaded && !userIsAdmin) {
    redirect('/partidos')
  }

  const { data, isLoading } = useQuery({
    queryKey: ['admin-predictions-data'],
    queryFn: fetchAdminData,
    enabled: userIsAdmin,
  })

  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [selectedResult, setSelectedResult] = useState<'home_win' | 'draw' | 'away_win' | ''>('')
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [saved, setSaved] = useState(false)
  const [searchUser, setSearchUser] = useState('')
  const [searchMatch, setSearchMatch] = useState('')

  const createMutation = useMutation({
    mutationFn: createPrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-predictions-data'] })
      queryClient.invalidateQueries({ queryKey: ['predictions'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  const selectedUser = data?.users.find((u) => u.id === selectedUserId)
  const selectedMatch = data?.matches.find((m) => m.id === selectedMatchId)

  const filteredUsers =
    data?.users.filter(
      (u) =>
        u.display_name.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.email.toLowerCase().includes(searchUser.toLowerCase())
    ) || []

  const filteredMatches =
    data?.matches.filter(
      (m) =>
        m.home_team?.name.toLowerCase().includes(searchMatch.toLowerCase()) ||
        m.away_team?.name.toLowerCase().includes(searchMatch.toLowerCase()) ||
        m.home_team?.code.toLowerCase().includes(searchMatch.toLowerCase()) ||
        m.away_team?.code.toLowerCase().includes(searchMatch.toLowerCase()) ||
        String(m.match_order).includes(searchMatch)
    ) || []

  const handleSubmit = () => {
    if (!selectedUserId || !selectedMatchId || !selectedResult) return

    const h = homeScore !== '' ? parseInt(homeScore) : null
    const a = awayScore !== '' ? parseInt(awayScore) : null

    createMutation.mutate({
      user_id: selectedUserId,
      match_id: selectedMatchId,
      predicted_result: selectedResult as 'home_win' | 'draw' | 'away_win',
      home_score: h,
      away_score: a,
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('es-GT', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted">Cargando datos...</p>
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
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground leading-tight">Admin</h1>
                <p className="text-xs text-muted">Predicciones por Usuario</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/resultados"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-muted hover:text-foreground hover:bg-white/10 transition-all"
              >
                <Trophy className="w-4 h-4" />
                Resultados
              </Link>
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

      <div className="max-w-7xl mx-auto px-4 py-4 pb-32">
        {/* Instructions */}
        <GlassCard className="p-4 mb-6 border-amber-500/10" hover={false}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Instrucciones</h3>
              <p className="text-sm text-muted mt-1 leading-relaxed">
                1. Selecciona el usuario.<br />
                2. Selecciona el partido.<br />
                3. Elige el resultado y el marcador (opcional).<br />
                4. Presiona "Guardar Predicción". Se guardará incluso si el partido ya cerró.
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* User Selection */}
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              1. Seleccionar Usuario
            </h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card/60 border border-white/5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/30 transition-all"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all',
                    selectedUserId === u.id
                      ? 'bg-primary/15 border border-primary/30 text-primary'
                      : 'bg-white/5 border border-transparent text-foreground hover:bg-white/10'
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {u.display_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{u.display_name}</p>
                    <p className="text-xs text-muted truncate">{u.email}</p>
                  </div>
                  {selectedUserId === u.id && <Check className="w-4 h-4 ml-auto text-primary" />}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Match Selection */}
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              2. Seleccionar Partido
            </h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={searchMatch}
                onChange={(e) => setSearchMatch(e.target.value)}
                placeholder="Buscar equipo o #match..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card/60 border border-white/5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary/30 transition-all"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
              {filteredMatches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMatchId(m.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all',
                    selectedMatchId === m.id
                      ? 'bg-primary/15 border border-primary/30 text-primary'
                      : 'bg-white/5 border border-transparent text-foreground hover:bg-white/10'
                  )}
                >
                  <Badge variant={m.status === 'finished' ? 'success' : 'primary'} className="flex-shrink-0">
                    #{m.match_order}
                  </Badge>
                  <div className="flex items-center gap-2 min-w-0">
                    <Flag isoCode={m.home_team?.iso_code || 'UN'} size={20} />
                    <span className="truncate">{m.home_team?.code}</span>
                    <span className="text-muted">vs</span>
                    <span className="truncate">{m.away_team?.code}</span>
                    <Flag isoCode={m.away_team?.iso_code || 'UN'} size={20} />
                  </div>
                  <span className="text-xs text-muted ml-auto flex-shrink-0">{formatDateTime(m.match_date)}</span>
                  {selectedMatchId === m.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Prediction Form */}
        <AnimatePresence>
          {selectedUser && selectedMatch && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <GlassCard className="p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  3. Ingresar Predicción
                </h3>

                <div className="flex items-center gap-4 mb-6">
                  {/* Home Team */}
                  <div className="flex-1 flex items-center gap-3">
                    <Flag isoCode={selectedMatch.home_team?.iso_code || 'UN'} size={40} />
                    <div>
                      <p className="font-bold text-sm text-foreground">{selectedMatch.home_team?.name}</p>
                      <p className="text-xs text-muted">{selectedMatch.home_team?.code}</p>
                    </div>
                  </div>

                  {/* Score Inputs */}
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs text-muted font-medium">{selectedMatch.home_team?.code}</span>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={homeScore}
                        onChange={(e) => setHomeScore(e.target.value)}
                        className="w-16 h-12 text-center text-xl font-bold bg-card/80 border-2 border-white/10 rounded-xl focus:border-primary focus:outline-none text-foreground transition-all"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-muted font-bold text-lg mt-4">-</span>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs text-muted font-medium">{selectedMatch.away_team?.code}</span>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={awayScore}
                        onChange={(e) => setAwayScore(e.target.value)}
                        className="w-16 h-12 text-center text-xl font-bold bg-card/80 border-2 border-white/10 rounded-xl focus:border-primary focus:outline-none text-foreground transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex-1 flex items-center gap-3 justify-end">
                    <div className="text-right">
                      <p className="font-bold text-sm text-foreground">{selectedMatch.away_team?.name}</p>
                      <p className="text-xs text-muted">{selectedMatch.away_team?.code}</p>
                    </div>
                    <Flag isoCode={selectedMatch.away_team?.iso_code || 'UN'} size={40} />
                  </div>
                </div>

                {/* Result Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <ResultButton
                    isSelected={selectedResult === 'home_win'}
                    onClick={() => setSelectedResult('home_win')}
                    label={`Gana ${selectedMatch.home_team?.code}`}
                  />
                  <ResultButton
                    isSelected={selectedResult === 'draw'}
                    onClick={() => setSelectedResult('draw')}
                    label="Empate"
                  />
                  <ResultButton
                    isSelected={selectedResult === 'away_win'}
                    onClick={() => setSelectedResult('away_win')}
                    label={`Gana ${selectedMatch.away_team?.code}`}
                  />
                </div>

                {/* User + Match summary */}
                <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {selectedUser.display_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted">Guardar como</span>{' '}
                    <span className="text-foreground font-semibold">{selectedUser.display_name}</span>
                  </div>
                  <div className="ml-auto text-xs text-muted">
                    Match #{selectedMatch.match_order}
                  </div>
                </div>

                {/* Save Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSubmit}
                  disabled={!selectedResult || createMutation.isPending}
                  className={cn(
                    'w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all',
                    saved
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                      : createMutation.isPending
                      ? 'bg-white/5 text-muted cursor-not-allowed'
                      : !selectedResult
                      ? 'bg-white/5 text-muted cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary to-emerald-500 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40'
                  )}
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4" />
                      ¡Predicción Guardada!
                    </>
                  ) : createMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Predicción
                    </>
                  )}
                </motion.button>

                {createMutation.isError && (
                  <p className="text-sm text-red-400 text-center mt-3">
                    {createMutation.error instanceof Error ? createMutation.error.message : 'Error'}
                  </p>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ResultButton({
  isSelected,
  onClick,
  label,
}: {
  isSelected: boolean
  onClick: () => void
  label: string
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'py-3 px-2 rounded-xl font-semibold text-xs transition-all border',
        isSelected
          ? 'bg-gradient-to-br from-primary/20 to-primary/10 border-primary/40 text-primary shadow-lg shadow-primary/10'
          : 'bg-white/5 border-white/5 text-muted hover:border-white/10 hover:bg-white/10'
      )}
    >
      {label}
    </motion.button>
  )
}
