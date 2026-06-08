import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isMatchLocked(matchDate: string | Date): boolean {
  // Bloquear 30 minutos antes de que inicie el partido
  const matchTime = new Date(matchDate).getTime()
  const now = new Date().getTime()
  const thirtyMinutesBefore = matchTime - (30 * 60 * 1000)
  return now >= thirtyMinutesBefore
}
