'use client'

import { useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { useMatches } from '@/hooks/useMatches'
import { usePredictions, useSavePrediction } from '@/hooks/usePredictions'
import MatchCard from '@/components/matches/MatchCard'
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, StickyHeader, GlassCard } from '@/components/ui/modern'
import { isAdmin } from '@/lib/admin'
import { FilterType, GroupFilter } from '@/types'
import { Trophy, SlidersHorizontal, CalendarDays, ChevronDown, Sparkles } from 'lucide-react'

const statusOptions = [
  { value: 'all', label: 'Todos', icon: '🏆' },
  { value: 'today', label: 'Hoy', icon: '📅' },
  { value: 'upcoming', label: 'Próximos', icon: '⏳' },
  { value: 'live', label: 'En Vivo', icon: '🔴' },
  { value: 'finished', label: 'Finalizados', icon: '✅' },
] as const

const groupOptions = [
  { value: 'all', label: 'Todos los grupos' },
  ...['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map(g => ({ value: g, label: `Grupo ${g}` }))
]

export default function PartidosPage() {
  const { userId } = useAuth()
  const { user } = useUser()
  const [statusFilter, setStatusFilter] = useState<FilterType>('all')
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all')
  
  const { data: matches, isLoading: matchesLoading, error: matchesError } = useMatches({
    status: statusFilter,
    group: groupFilter,
  })
  
  const { data: predictions } = usePredictions()
  const savePrediction = useSavePrediction()

  const userIsAdmin = isAdmin(user?.emailAddresses?.[0]?.emailAddress)

  const handlePrediction = async (
    matchId: string, 
    result: 'home_win' | 'draw' | 'away_win',
    homeScore?: number | null,
    awayScore?: number | null
  ) => {
    if (!userId) return
    
    await savePrediction.mutateAsync({
      matchId,
      result,
      homeScore,
      awayScore,
    })
  }

  const getPrediction = (matchId: string) => {
    return predictions?.find(p => p.match_id === matchId)
  }

  const currentStatusLabel = statusOptions.find(s => s.value === statusFilter)?.label || 'Todos'
  const currentGroupLabel = groupOptions.find(g => g.value === groupFilter)?.label || 'Todos los grupos'

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <StickyHeader>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg shadow-primary/20">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground leading-tight">Partidos</h1>
                <p className="text-xs text-muted">Mundial 2026</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {userIsAdmin && (
                <a 
                  href="/admin/resultados"
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-xs font-medium text-muted hover:text-foreground hover:bg-white/10 transition-all"
                >
                  Admin
                </a>
              )}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-2 pb-4 flex-wrap">
            {/* Status Dropdown */}
            <Dropdown value={statusFilter} onChange={(val) => setStatusFilter(val as FilterType)}>
              <DropdownTrigger className="whitespace-nowrap">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted" />
                <span className="text-foreground">{currentStatusLabel}</span>
              </DropdownTrigger>
              <DropdownContent className="min-w-[160px]">
                {statusOptions.map((option) => (
                  <DropdownItem key={option.value} value={option.value}>
                    <span className="text-base mr-1">{option.icon}</span>
                    <span>{option.label}</span>
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>

            {/* Group Dropdown */}
            <Dropdown value={groupFilter} onChange={(val) => setGroupFilter(val as GroupFilter)}>
              <DropdownTrigger className="whitespace-nowrap">
                <CalendarDays className="w-3.5 h-3.5 text-muted" />
                <span className="text-foreground">{currentGroupLabel}</span>
              </DropdownTrigger>
              <DropdownContent className="min-w-[160px]">
                {groupOptions.map((option) => (
                  <DropdownItem key={option.value} value={option.value}>
                    <span>{option.label}</span>
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>

            {/* Stats Badge */}
            {matches && matches.length > 0 && (
              <div className="ml-auto flex items-center gap-2 text-xs text-muted whitespace-nowrap">
                <Sparkles className="w-3 h-3 text-primary/60" />
                <span>{matches.length} partidos</span>
              </div>
            )}
          </div>
        </div>
      </StickyHeader>

      {/* Content - pt-4 compensa el header sticky */}
      <main className="relative z-0 max-w-7xl mx-auto px-4 pt-4 pb-32">
        {matchesLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-muted text-sm">Cargando partidos...</p>
          </div>
        ) : matchesError ? (
          <GlassCard className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">⚠️</span>
            </div>
            <p className="text-red-400 font-medium">Error al cargar los partidos</p>
            <p className="text-sm text-muted mt-1">Intenta de nuevo más tarde</p>
          </GlassCard>
        ) : !matches?.length ? (
          <GlassCard className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-muted" />
            </div>
            <p className="text-lg font-medium text-muted">No hay partidos para mostrar</p>
            <p className="text-sm text-muted/60 mt-1">Prueba con otros filtros</p>
          </GlassCard>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {matches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  layout
                >
                  <MatchCard
                    match={match}
                    prediction={getPrediction(match.id)}
                    onPredict={handlePrediction}
                    isSaving={savePrediction.isPending}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}
