'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Match, Prediction, PredictionResult } from '@/types'
import { cn, formatDate, formatTime } from '@/lib/utils'
import Flag from '@/components/Flag'
import { Badge, GlassCard } from '@/components/ui/modern'
import { useServerTime } from '@/hooks/useServerTime'
import { MatchCountdown } from './MatchCountdown'
import { 
  Trophy, 
  Lock, 
  Check, 
  TrendingUp, 
  Shield, 
  Clock,
  ChevronDown,
  Save,
  Sparkles,
  MapPin,
  Landmark,
  Zap,
  AlertCircle
} from 'lucide-react'

interface MatchCardProps {
  match: Match
  prediction?: Prediction
  onPredict: (matchId: string, result: PredictionResult, homeScore?: number | null, awayScore?: number | null) => Promise<void>
  isSaving: boolean
}

export default function MatchCard({ match, prediction, onPredict, isSaving }: MatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedResult, setSelectedResult] = useState<PredictionResult | null>(prediction?.predicted_result || null)
  const [homeScore, setHomeScore] = useState<string>(prediction?.home_score?.toString() || '')
  const [awayScore, setAwayScore] = useState<string>(prediction?.away_score?.toString() || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  
  const { serverTime } = useServerTime()
  
  // Validar bloqueo con hora del servidor (no se puede manipular)
  const matchTime = new Date(match.match_date).getTime()
  const thirtyMinutesBefore = matchTime - (30 * 60 * 1000)
  const locked = serverTime >= thirtyMinutesBefore
  
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'
  const hasPrediction = !!prediction

  // Validar marcador cuando cambia
  const validateScore = (hScore: string, aScore: string, result: PredictionResult | null) => {
    if (!result || !hScore || !aScore) {
      setValidationError(null)
      return true
    }

    const h = parseInt(hScore)
    const a = parseInt(aScore)

    if (isNaN(h) || isNaN(a)) {
      setValidationError(null)
      return true
    }

    if (result === 'home_win' && h <= a) {
      setValidationError(`El marcador debe ser mayor para ${match.home_team?.code}`)
      return false
    }
    if (result === 'away_win' && a <= h) {
      setValidationError(`El marcador debe ser mayor para ${match.away_team?.code}`)
      return false
    }
    if (result === 'draw' && h !== a) {
      setValidationError('El marcador debe ser igual para empate')
      return false
    }

    setValidationError(null)
    return true
  }
  
  const handleSubmit = async () => {
    if (!selectedResult || locked) return

    // Validar marcador antes de enviar
    if (homeScore && awayScore && !validateScore(homeScore, awayScore, selectedResult)) {
      return
    }
    
    setIsSubmitting(true)
    try {
      await onPredict(
        match.id,
        selectedResult,
        homeScore ? parseInt(homeScore) : null,
        awayScore ? parseInt(awayScore) : null
      )
    } catch (error) {
      console.error('Error saving prediction:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getResultLabel = () => {
    if (!selectedResult) return 'Selecciona un resultado'
    if (selectedResult === 'home_win') return `Gana ${match.home_team?.code}`
    if (selectedResult === 'draw') return 'Empate'
    return `Gana ${match.away_team?.code}`
  }

  const getResultIcon = () => {
    if (!selectedResult) return <Shield className="w-4 h-4" />
    if (selectedResult === 'home_win') return <Shield className="w-4 h-4" />
    if (selectedResult === 'draw') return <TrendingUp className="w-4 h-4" />
    return <Shield className="w-4 h-4" />
  }

  return (
    <GlassCard 
      className={cn(
        'overflow-hidden',
        isLive && 'border-red-500/20 shadow-red-500/10',
        isFinished && 'opacity-60',
        hasPrediction && !isFinished && 'border-primary/10'
      )}
      hover={!isFinished}
    >
      {/* Match Header */}
      <div className="p-5">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {isLive ? (
              <Badge variant="live">
                <Zap className="w-3 h-3" />
                EN VIVO
              </Badge>
            ) : isFinished ? (
              <Badge variant="default">
                <Lock className="w-3 h-3" />
                Finalizado
              </Badge>
            ) : (
              <Badge variant="default">
                <Clock className="w-3 h-3" />
                {formatDate(match.match_date)} · {formatTime(match.match_date)}
              </Badge>
            )}
            <Badge variant="primary">
              Grupo {match.group_letter}
            </Badge>
            {!isLive && !isFinished && (
              <MatchCountdown matchDate={match.match_date} />
            )}
          </div>
          
          {hasPrediction && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              {prediction?.points === 3 ? (
                <Badge variant="success">
                  <Trophy className="w-3 h-3" />
                  +3 pts
                </Badge>
              ) : prediction?.points === 1 ? (
                <Badge variant="warning">
                  <Check className="w-3 h-3" />
                  +1 pt
                </Badge>
              ) : isFinished ? (
                <Badge variant="danger">0 pts</Badge>
              ) : (
                <Badge variant="success">
                  <Check className="w-3 h-3" />
                  Predicho
                </Badge>
              )}
            </motion.div>
          )}
        </div>

        {/* Teams Display */}
        <div className="flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex-1 flex flex-col items-center text-center gap-2">
            <div className="relative">
              <Flag isoCode={match.home_team?.iso_code || 'UN'} size={56} />
              {isFinished && match.home_score !== null && match.home_score !== undefined && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                >
                  {match.home_score}
                </motion.div>
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-foreground leading-tight">{match.home_team?.name || 'Local'}</p>
              <p className="text-xs text-muted mt-0.5">{match.home_team?.code}</p>
            </div>
          </div>

          {/* Score / VS */}
          <div className="flex flex-col items-center gap-1 px-2">
            {isLive || isFinished ? (
              <div className="text-4xl font-black text-foreground tracking-tight">
                {match.home_score ?? '-'} : {match.away_score ?? '-'}
              </div>
            ) : (
              <div className="relative">
                <div className="text-3xl font-black text-muted/40 tracking-wider">VS</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>
              </div>
            )}
            
            {hasPrediction && !isExpanded && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-primary/80 font-medium bg-primary/5 px-2 py-0.5 rounded-full mt-1"
              >
                {prediction?.home_score !== null && prediction?.away_score !== null 
                  ? `${prediction.home_score} - ${prediction.away_score}`
                  : prediction?.predicted_result === 'home_win' ? 'Gana Local'
                  : prediction?.predicted_result === 'away_win' ? 'Gana Visitante'
                  : 'Empate'
                }
              </motion.div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 flex flex-col items-center text-center gap-2">
            <div className="relative">
              <Flag isoCode={match.away_team?.iso_code || 'UN'} size={56} />
              {isFinished && match.away_score !== null && match.away_score !== undefined && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                >
                  {match.away_score}
                </motion.div>
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-foreground leading-tight">{match.away_team?.name || 'Visitante'}</p>
              <p className="text-xs text-muted mt-0.5">{match.away_team?.code}</p>
            </div>
          </div>
        </div>

        {/* Venue Info */}
        {(match.venue || match.city) && (
          <div className="flex items-center justify-center gap-3 mt-4 text-xs text-muted/70">
            {match.venue && (
              <span className="flex items-center gap-1">
                <Landmark className="w-3 h-3" />
                {match.venue}
              </span>
            )}
            {match.venue && match.city && (
              <span className="w-1 h-1 rounded-full bg-muted/30" />
            )}
            {match.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {match.city}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Prediction Section - Only for non-finished matches */}
      {!isFinished && (
        <div className="border-t border-white/5">
          {/* Accordion Trigger */}
          <button
            onClick={() => !locked && setIsExpanded(!isExpanded)}
            disabled={locked}
            className={cn(
              'w-full flex items-center justify-between px-5 py-3.5 transition-all duration-200',
              !locked && 'hover:bg-white/5 cursor-pointer',
              locked && 'cursor-not-allowed opacity-60',
              isExpanded && 'bg-white/5'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                selectedResult ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted'
              )}>
                {getResultIcon()}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">
                  {getResultLabel()}
                </p>
                <p className="text-xs text-muted">
                  {locked ? 'Predicciones cerradas' : 'Toca para expandir'}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                isExpanded ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted'
              )}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>

          {/* Accordion Content */}
          <AnimatePresence>
            {isExpanded && !locked && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                className="overflow-hidden"
              >
                <div className="px-5 py-5 space-y-4">
                  {/* Result Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <ResultButton
                      isSelected={selectedResult === 'home_win'}
                      onClick={() => {
                        setSelectedResult('home_win')
                        validateScore(homeScore, awayScore, 'home_win')
                      }}
                      label={`Gana ${match.home_team?.code}`}
                      icon={<Shield className="w-4 h-4" />}
                    />
                    <ResultButton
                      isSelected={selectedResult === 'draw'}
                      onClick={() => {
                        setSelectedResult('draw')
                        validateScore(homeScore, awayScore, 'draw')
                      }}
                      label="Empate"
                      icon={<TrendingUp className="w-4 h-4" />}
                    />
                    <ResultButton
                      isSelected={selectedResult === 'away_win'}
                      onClick={() => {
                        setSelectedResult('away_win')
                        validateScore(homeScore, awayScore, 'away_win')
                      }}
                      label={`Gana ${match.away_team?.code}`}
                      icon={<Shield className="w-4 h-4" />}
                    />
                  </div>

                  {/* Exact Score Section */}
                  <AnimatePresence>
                    {selectedResult && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-background/50 rounded-xl p-4 border border-white/5">
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <Sparkles className="w-3.5 h-3.5 text-primary/60" />
                            <p className="text-xs text-muted font-medium">Marcador exacto (opcional — +3 pts)</p>
                          </div>
                          
                          <div className="flex items-center justify-center gap-4">
                            <div className="flex flex-col items-center gap-1.5">
                              <span className="text-xs text-muted font-medium">{match.home_team?.code}</span>
                              <ScoreInput
                                value={homeScore}
                                onChange={(val) => {
                                  setHomeScore(val)
                                  validateScore(val, awayScore, selectedResult)
                                }}
                              />
                            </div>
                            <span className="text-muted font-bold text-lg mt-5">-</span>
                            <div className="flex flex-col items-center gap-1.5">
                              <span className="text-xs text-muted font-medium">{match.away_team?.code}</span>
                              <ScoreInput
                                value={awayScore}
                                onChange={(val) => {
                                  setAwayScore(val)
                                  validateScore(homeScore, val, selectedResult)
                                }}
                              />
                            </div>
                           </div>
                           
                           {/* Validation Error */}
                           <AnimatePresence>
                             {validationError && (
                               <motion.div
                                 initial={{ opacity: 0, y: -10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: -10 }}
                                 className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2"
                               >
                                 <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                 {validationError}
                               </motion.div>
                             )}
                           </AnimatePresence>
                         </div>

                         {/* Save Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSubmit}
                          disabled={isSubmitting || isSaving}
                          className={cn(
                            'w-full mt-3 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all',
                            (isSubmitting || isSaving)
                              ? 'bg-white/5 text-muted cursor-not-allowed'
                              : 'bg-gradient-to-r from-primary to-emerald-500 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40'
                          )}
                        >
                          {isSubmitting || isSaving ? (
                            <>
                              <Save className="w-4 h-4 animate-spin" />
                              Guardando...
                            </>
                          ) : hasPrediction ? (
                            <>
                              <Check className="w-4 h-4" />
                              Actualizar Predicción
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Guardar Predicción
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Locked State */}
          {locked && (
            <div className="px-5 pb-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted bg-white/5 rounded-xl py-3 border border-white/5">
                <Lock className="w-4 h-4" />
                Partido bloqueado para predicciones
              </div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  )
}

// Sub-components
function ResultButton({ isSelected, onClick, label, icon }: {
  isSelected: boolean
  onClick: () => void
  label: string
  icon: React.ReactNode
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl font-semibold text-xs transition-all duration-200 border',
        isSelected 
          ? 'bg-gradient-to-br from-primary/20 to-emerald-500/10 border-primary/40 text-primary shadow-lg shadow-primary/10' 
          : 'bg-white/5 border-white/5 text-muted hover:border-white/10 hover:bg-white/10'
      )}
    >
      {icon}
      <span className="leading-tight">{label}</span>
    </motion.button>
  )
}

function ScoreInput({ value, onChange, hasError }: { value: string; onChange: (val: string) => void; hasError?: boolean }) {
  return (
    <div className="relative">
      <input
        type="number"
        min={0}
        max={20}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-16 h-14 text-center text-2xl font-black bg-card/80 border-2 rounded-xl',
          'focus:border-primary focus:outline-none transition-all',
          'text-foreground placeholder:text-muted/30',
          hasError ? 'border-red-400/60 shadow-lg shadow-red-500/10' : 
          value ? 'border-primary/40 shadow-lg shadow-primary/10' : 'border-white/10'
        )}
        placeholder="0"
      />
    </div>
  )
}
