import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'
import { isAdmin } from '@/lib/admin'

// GET - List users and matches for the admin dropdowns
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Check admin
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (!isAdmin(userData?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, display_name')
      .order('display_name', { ascending: true })

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    // Fetch all matches with teams
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(`
        id,
        match_order,
        match_date,
        status,
        home_team:teams!matches_home_team_id_fkey(id, name, code, iso_code),
        away_team:teams!matches_away_team_id_fkey(id, name, code, iso_code)
      `)
      .order('match_order', { ascending: true })

    if (matchesError) {
      return NextResponse.json({ error: matchesError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      users: users || [],
      matches: matches || [],
    })
  } catch (error) {
    console.error('Error in admin predictions GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create or update a prediction on behalf of any user (admin only)
export async function POST(req: NextRequest) {
  try {
    const { userId: adminUserId } = await auth()
    if (!adminUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { user_id, match_id, predicted_result, home_score, away_score } = body

    if (!user_id || !match_id || !predicted_result) {
      return NextResponse.json({ error: 'Missing required fields: user_id, match_id, predicted_result' }, { status: 400 })
    }

    // Validate score consistency
    const h = home_score !== null && home_score !== undefined ? parseInt(home_score) : null
    const a = away_score !== null && away_score !== undefined ? parseInt(away_score) : null

    if (h !== null && a !== null && !isNaN(h) && !isNaN(a)) {
      if (predicted_result === 'home_win' && h <= a) {
        return NextResponse.json({ error: 'Marcador no coincide con Gana Local', code: 'INVALID_SCORE' }, { status: 400 })
      }
      if (predicted_result === 'away_win' && a <= h) {
        return NextResponse.json({ error: 'Marcador no coincide con Gana Visitante', code: 'INVALID_SCORE' }, { status: 400 })
      }
      if (predicted_result === 'draw' && h !== a) {
        return NextResponse.json({ error: 'Marcador no coincide con Empate', code: 'INVALID_SCORE' }, { status: 400 })
      }
    }

    const supabase = createServiceClient()

    // Verify admin
    const { data: adminUser } = await supabase
      .from('users')
      .select('email')
      .eq('id', adminUserId)
      .single()

    if (!isAdmin(adminUser?.email)) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    // Ensure target user exists (or create if not)
    const { data: targetUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user_id)
      .single()

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    // Upsert prediction directly (bypass time lock)
    const { data: prediction, error } = await supabase
      .from('predictions')
      .upsert({
        user_id,
        match_id,
        predicted_result,
        home_score: h !== null && !isNaN(h) ? h : null,
        away_score: a !== null && !isNaN(a) ? a : null,
      }, { onConflict: 'user_id,match_id' })
      .select('*, match:matches(*)')
      .single()

    if (error) {
      console.error('Error saving admin prediction:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      prediction,
    })
  } catch (error) {
    console.error('Error in admin predictions POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
