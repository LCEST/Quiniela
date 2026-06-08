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

    if (match.status !== 'upcoming' || new Date(match.match_date) <= new Date()) {
      return NextResponse.json({ error: 'Match is locked for predictions' }, { status: 403 })
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
