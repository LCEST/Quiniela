import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Prediction, PredictionResult } from '@/types'

async function fetchPredictions() {
  const res = await fetch('/api/predictions')
  if (!res.ok) throw new Error('Failed to fetch predictions')
  const data = await res.json()
  return (data.predictions || []) as Prediction[]
}

async function savePrediction({ 
  matchId, 
  result, 
  homeScore, 
  awayScore 
}: { 
  matchId: string; 
  result: PredictionResult; 
  homeScore?: number | null; 
  awayScore?: number | null; 
}) {
  const res = await fetch('/api/predictions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      match_id: matchId,
      predicted_result: result,
      home_score: homeScore,
      away_score: awayScore,
    }),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    console.error('Save prediction error:', { status: res.status, data: errorData })
    throw new Error(errorData.error || errorData.message || `Failed to save prediction (${res.status})`)
  }
  return res.json()
}

export function usePredictions() {
  return useQuery({
    queryKey: ['predictions'],
    queryFn: fetchPredictions,
    staleTime: 1000 * 60 * 2,
  })
}

export function useSavePrediction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: savePrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] })
      queryClient.invalidateQueries({ queryKey: ['matches'] })
    },
  })
}
