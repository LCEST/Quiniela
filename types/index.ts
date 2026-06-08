export interface Team {
  id: string
  name: string
  code: string
  flag: string      // Emoji flag
  iso_code: string  // ISO country code
  group: string
}

export interface Match {
  id: string
  home_team_id: string
  away_team_id: string
  home_team: Team
  away_team: Team
  match_date: string
  group_letter: string | null
  round_name: string
  status: 'upcoming' | 'live' | 'finished'
  home_score: number | null
  away_score: number | null
  venue: string | null
  city: string | null
  match_order: number | null
  created_at: string
}

export type PredictionResult = 'home_win' | 'draw' | 'away_win'

export interface Prediction {
  id: string
  user_id: string
  match_id: string
  match: Match
  predicted_result: PredictionResult
  home_score: number | null
  away_score: number | null
  points: number
  created_at: string
  updated_at: string
}

export interface LeaderboardEntry {
  user_id: string
  display_name: string
  avatar_url: string | null
  total_points: number
  exact_predictions: number
  correct_predictions: number
  total_predictions: number
  rank: number
}

export interface League {
  id: string
  name: string
  code: string
  created_by: string
  created_at: string
  member_count: number
}

export interface LeagueMember {
  id: string
  league_id: string
  user_id: string
  user: {
    display_name: string
    avatar_url: string | null
  }
  total_points: number
  joined_at: string
}

export type MatchStatus = 'upcoming' | 'live' | 'finished'
export type FilterType = 'all' | 'today' | 'upcoming' | 'live' | 'finished'
export type GroupFilter = 'all' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L'
