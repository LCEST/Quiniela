import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = createServiceClient()
    
    const { data: stats, error } = await supabase
      .from('user_stats')
      .select(`
        *,
        users:user_id (display_name, avatar_url)
      `)
      .order('total_points', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Leaderboard error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const leaderboard = (stats || []).map((s: any, index: number) => {
      const user = s.users || {}
      return {
        rank: index + 1,
        user_id: s.user_id,
        display_name: user.display_name || 'Usuario',
        avatar_url: user.avatar_url,
        total_points: s.total_points || 0,
        exact_predictions: s.exact_predictions || 0,
        correct_predictions: s.correct_predictions || 0,
        total_predictions: s.total_predictions || 0,
      }
    })

    return NextResponse.json({ success: true, leaderboard })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
