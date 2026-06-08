import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status') as 'upcoming' | 'live' | 'finished' | null
    const group = searchParams.get('group')
    const date = searchParams.get('date')

    const supabase = createServiceClient()
    let query = supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      `)
      .order('match_date', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }
    if (group && group !== 'all') {
      query = query.eq('group_letter', group)
    }
    if (date) {
      const start = new Date(date)
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      query = query.gte('match_date', start.toISOString()).lt('match_date', end.toISOString())
    }

    const { data: matches, error } = await query

    if (error) {
      console.error('Error fetching matches:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If user is logged in, fetch their predictions
    let predictions: any[] = []
    if (userId) {
      const { data: userPredictions } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', userId)
      
      predictions = userPredictions || []
    }

    return NextResponse.json({ 
      success: true, 
      matches: matches || [],
      predictions: predictions,
    })
  } catch (error) {
    console.error('Error in matches API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
