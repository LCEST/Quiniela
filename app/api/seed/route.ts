import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'
import { TEAMS_2026 } from '@/lib/seed/teams'
import { WORLD_CUP_2026_MATCHES } from '@/lib/seed/matches'

// Helper to build real matches from calendar data
function buildRealMatches(teamMap: Map<string, string>) {
  return WORLD_CUP_2026_MATCHES.map((match, index) => {
    const matchDate = new Date(`${match.date}T${match.time}Z`)
    
    return {
      match_order: match.match_number || index + 1,
      home_team_id: teamMap.get(match.home_team),
      away_team_id: teamMap.get(match.away_team),
      match_date: matchDate.toISOString(),
      group_letter: match.group,
      round_name: 'group_stage',
      venue: match.venue || 'TBD',
      city: match.city || null,
    }
  }).filter(m => m.home_team_id && m.away_team_id)
}

export async function POST() {
  try {
    const supabase = createServiceClient()

    // 1. Insert teams
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .upsert(
        TEAMS_2026.map(t => ({
          name: t.name,
          code: t.code,
          iso_code: t.iso_code,
          flag: t.flag,
          group_letter: t.group,
        })),
        { onConflict: 'code' }
      )
      .select()

    if (teamsError) {
      console.error('Error seeding teams:', teamsError)
      return NextResponse.json({ error: teamsError.message }, { status: 500 })
    }

    // 2. Get teams with UUIDs
    const { data: dbTeams, error: fetchError } = await supabase
      .from('teams')
      .select('id, code')

    if (fetchError || !dbTeams) {
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
    }

    // 3. Map codes to UUIDs
    const teamMap = new Map(dbTeams.map(t => [t.code, t.id]))
    const matches = buildRealMatches(teamMap)

    // 4. Clear existing matches and re-insert
    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (deleteError) {
      console.error('Error clearing matches:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .insert(matches)
      .select()

    if (matchesError) {
      console.error('Error seeding matches:', matchesError)
      return NextResponse.json({ error: matchesError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      teams: teamsData?.length || 0,
      matches: matchesData?.length || 0,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
