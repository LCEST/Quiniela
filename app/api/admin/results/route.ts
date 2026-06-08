import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { matchId, homeScore, awayScore } = body

    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json(
        { error: 'matchId, homeScore y awayScore son requeridos' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Actualizar el partido con el resultado y marcarlo como finished
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: 'finished',
      })
      .eq('id', matchId)
      .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
      .single()

    if (matchError) {
      console.error('Error updating match:', matchError)
      return NextResponse.json({ error: matchError.message }, { status: 500 })
    }

    // Recalcular puntos para todas las predicciones de este partido
    // El trigger calculate_prediction_points debería hacerlo automáticamente
    // Pero forzamos un recalculo por si acaso
    const { error: predictionsError } = await supabase
      .from('predictions')
      .update({ updated_at: new Date().toISOString() })
      .eq('match_id', matchId)

    if (predictionsError) {
      console.error('Error recalculating predictions:', predictionsError)
    }

    return NextResponse.json({
      success: true,
      message: `Resultado actualizado: ${match.home_team?.name} ${homeScore} - ${awayScore} ${match.away_team?.name}`,
      match: match,
    })
  } catch (error) {
    console.error('Error in update-result API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Listar todos los partidos para admin
export async function GET() {
  try {
    const supabase = createServiceClient()

    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      `)
      .order('match_date', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      matches: matches || [],
    })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
