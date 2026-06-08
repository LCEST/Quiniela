import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'

async function syncUserToSupabase(userId: string, supabase: ReturnType<typeof createServiceClient>) {
  // Check if user exists in Supabase
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single()

  if (!existingUser) {
    // Get user data from Clerk
    const user = await currentUser()
    if (user) {
      const email = user.emailAddresses[0]?.emailAddress || 'unknown@example.com'
      const name = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.username || email.split('@')[0]
      
      // Create user in Supabase
      await supabase.from('users').insert({
        id: userId,
        email: email,
        display_name: name,
        avatar_url: user.imageUrl || null,
      })
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in again', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    const body = await req.json()
    const { match_id, predicted_result, home_score, away_score } = body

    if (!match_id || !predicted_result) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validar que el marcador sea consistente con el resultado
    if (home_score !== null && away_score !== null && home_score !== undefined && away_score !== undefined) {
      const h = parseInt(home_score)
      const a = parseInt(away_score)
      
      if (!isNaN(h) && !isNaN(a)) {
        if (predicted_result === 'home_win' && h <= a) {
          return NextResponse.json({ error: 'El marcador no coincide: Gana Local requiere marcador mayor para el equipo local', code: 'INVALID_SCORE' }, { status: 400 })
        }
        if (predicted_result === 'away_win' && a <= h) {
          return NextResponse.json({ error: 'El marcador no coincide: Gana Visitante requiere marcador mayor para el equipo visitante', code: 'INVALID_SCORE' }, { status: 400 })
        }
        if (predicted_result === 'draw' && h !== a) {
          return NextResponse.json({ error: 'El marcador no coincide: Empate requiere marcadores iguales', code: 'INVALID_SCORE' }, { status: 400 })
        }
      }
    }

    const supabase = createServiceClient()

    // Sync user to Supabase first
    await syncUserToSupabase(userId, supabase)

    // Check if match is locked
    const { data: match } = await supabase
      .from('matches')
      .select('match_date, status')
      .eq('id', match_id)
      .single()

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Bloquear predicciones 30 minutos antes del partido
    const matchTime = new Date(match.match_date).getTime()
    const now = new Date().getTime()
    const thirtyMinutesBefore = matchTime - (30 * 60 * 1000)
    if (match.status !== 'upcoming' || now >= thirtyMinutesBefore) {
      return NextResponse.json({ error: 'Match is locked for predictions (30 min before)' }, { status: 403 })
    }

    // Upsert prediction
    const { data: prediction, error } = await supabase
      .from('predictions')
      .upsert({
        user_id: userId,
        match_id,
        predicted_result,
        home_score: home_score || null,
        away_score: away_score || null,
      }, { onConflict: 'user_id,match_id' })
      .select('*, match:matches(*)')
      .single()

    if (error) {
      console.error('Error saving prediction:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      prediction,
    })
  } catch (error) {
    console.error('Error in predictions API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()
    
    // Sync user to Supabase first
    await syncUserToSupabase(userId, supabase)

    const { data: predictions, error } = await supabase
      .from('predictions')
      .select('*, match:matches(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      predictions: predictions || [],
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
