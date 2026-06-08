'use client'

import { useEffect, useState } from 'react'
import { useServerTime } from '@/hooks/useServerTime'
import { Clock, Lock } from 'lucide-react'

interface MatchCountdownProps {
  matchDate: string
}

export function MatchCountdown({ matchDate }: MatchCountdownProps) {
  const { serverTime } = useServerTime()
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [isLocked, setIsLocked] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    const updateCountdown = () => {
      const matchTime = new Date(matchDate).getTime()
      const thirtyMinutesBefore = matchTime - (30 * 60 * 1000)
      const now = serverTime || Date.now()
      const diff = thirtyMinutesBefore - now

      if (diff <= 0) {
        setIsLocked(true)
        setTimeLeft('')
        return
      }

      setIsLocked(false)
      
      // Urgent if less than 1 hour
      setIsUrgent(diff < 60 * 60 * 1000)

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [matchDate, serverTime])

  if (isLocked) {
    return (
      <div className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
        <Lock className="w-3 h-3" />
        <span>Predicciones cerradas</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${isUrgent ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
      <Clock className="w-3 h-3" />
      <span>Cierra en: {timeLeft}</span>
    </div>
  )
}
