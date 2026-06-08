import { useQuery } from '@tanstack/react-query'
import { Match } from '@/types'

async function fetchMatches(filters?: { status?: string; group?: string; date?: string }) {
  const params = new URLSearchParams()
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status)
  if (filters?.group && filters.group !== 'all') params.append('group', filters.group)
  if (filters?.date) params.append('date', filters.date)

  const res = await fetch(`/api/matches?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch matches')
  const data = await res.json()
  return data.matches as Match[]
}

export function useMatches(filters?: { status?: string; group?: string; date?: string }) {
  return useQuery({
    queryKey: ['matches', filters],
    queryFn: () => fetchMatches(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const res = await fetch(`/api/matches?id=${matchId}`)
      if (!res.ok) throw new Error('Failed to fetch match')
      const data = await res.json()
      return data.matches[0] as Match
    },
    enabled: !!matchId,
  })
}
