'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Trophy, Medal, Crown, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

async function fetchLeaderboard() {
  const res = await fetch('/api/leaderboard')
  if (!res.ok) throw new Error('Failed to fetch leaderboard')
  const data = await res.json()
  return data.leaderboard || []
}

export default function RankingPage() {
  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    staleTime: 1000 * 60 * 5,
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Clasificación Global
          </h1>
          <p className="text-sm text-muted mt-1">
            Top predictores del Mundial 2026
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-accent">Error al cargar el ranking</div>
        ) : !leaderboard?.length ? (
          <div className="text-center py-20 text-muted">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Aún no hay participantes</p>
            <p className="text-sm mt-2">Sé el primero en hacer predicciones</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry: any, index: number) => {
              const isTop3 = index < 3
              const rank = index + 1
              
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-2xl border transition-all',
                    isTop3 
                      ? 'bg-card border-primary/30 shadow-lg shadow-primary/5' 
                      : 'bg-card border-border'
                  )}
                >
                  {/* Rank */}
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm',
                    rank === 1 && 'bg-primary/20 text-primary',
                    rank === 2 && 'bg-secondary/20 text-secondary',
                    rank === 3 && 'bg-accent/20 text-accent',
                    rank > 3 && 'bg-card-hover text-muted'
                  )}>
                    {rank === 1 ? <Crown className="w-5 h-5" /> : 
                     rank === 2 ? <Medal className="w-5 h-5" /> :
                     rank === 3 ? <Medal className="w-5 h-5" /> : rank}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {entry.display_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground truncate">
                          {entry.display_name || 'Usuario'}
                        </p>
                        <p className="text-xs text-muted">
                          {entry.exact_predictions} exactas · {entry.correct_predictions} acertadas
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{entry.total_points}</p>
                    <p className="text-xs text-muted">pts</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
