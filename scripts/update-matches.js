const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://cgdgehvmdewdjanyajzx.supabase.co'
const supabaseKey = 'sb_secret_BHiVfqD6NqgaPuvvNHZISg_CvJpXmDm'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

const WORLD_CUP_2026_MATCHES = [
  // ===== JUEVES 11 DE JUNIO =====
  { match_number: 1, date: "2026-06-11", time: "19:00:00", group: "A", home_team: "MEX", away_team: "RSA", venue: "Estadio Ciudad de México", city: "Mexico City" },
  { match_number: 2, date: "2026-06-12", time: "02:00:00", group: "A", home_team: "KOR", away_team: "CZE", venue: "Estadio Guadalajara", city: "Guadalajara" },
  // ===== VIERNES 12 DE JUNIO =====
  { match_number: 3, date: "2026-06-12", time: "19:00:00", group: "B", home_team: "CAN", away_team: "BIH", venue: "Estadio de Toronto", city: "Toronto" },
  { match_number: 4, date: "2026-06-13", time: "01:00:00", group: "D", home_team: "USA", away_team: "PAR", venue: "Estadio de Los Ángeles", city: "Los Angeles" },
  // ===== SÁBADO 13 DE JUNIO =====
  { match_number: 5, date: "2026-06-13", time: "19:00:00", group: "B", home_team: "QAT", away_team: "SUI", venue: "Estadio Bahía de San Francisco", city: "San Francisco" },
  { match_number: 6, date: "2026-06-13", time: "22:00:00", group: "C", home_team: "BRA", away_team: "MAR", venue: "Estadio Nueva York Nueva Jersey", city: "New York" },
  { match_number: 7, date: "2026-06-14", time: "01:00:00", group: "C", home_team: "HAI", away_team: "SCO", venue: "Estadio de Boston", city: "Boston" },
  { match_number: 8, date: "2026-06-14", time: "04:00:00", group: "D", home_team: "AUS", away_team: "TUR", venue: "Estadio BC Place Vancouver", city: "Vancouver" },
  // ===== DOMINGO 14 DE JUNIO =====
  { match_number: 9, date: "2026-06-14", time: "17:00:00", group: "E", home_team: "GER", away_team: "CUW", venue: "Estadio de Houston", city: "Houston" },
  { match_number: 10, date: "2026-06-14", time: "20:00:00", group: "F", home_team: "NED", away_team: "JPN", venue: "Estadio de Dallas", city: "Dallas" },
  { match_number: 11, date: "2026-06-14", time: "23:00:00", group: "E", home_team: "CIV", away_team: "ECU", venue: "Estadio de Filadelfia", city: "Philadelphia" },
  { match_number: 12, date: "2026-06-15", time: "02:00:00", group: "F", home_team: "SWE", away_team: "TUN", venue: "Estadio Monterrey", city: "Monterrey" },
  // ===== LUNES 15 DE JUNIO =====
  { match_number: 13, date: "2026-06-15", time: "16:00:00", group: "H", home_team: "ESP", away_team: "CPV", venue: "Estadio de Atlanta", city: "Atlanta" },
  { match_number: 14, date: "2026-06-15", time: "19:00:00", group: "G", home_team: "BEL", away_team: "EGY", venue: "Estadio de Seattle", city: "Seattle" },
  { match_number: 15, date: "2026-06-15", time: "22:00:00", group: "H", home_team: "KSA", away_team: "URU", venue: "Estadio de Miami", city: "Miami" },
  { match_number: 16, date: "2026-06-16", time: "01:00:00", group: "G", home_team: "IRN", away_team: "NZL", venue: "Estadio de Los Ángeles", city: "Los Angeles" },
  // ===== MARTES 16 DE JUNIO =====
  { match_number: 17, date: "2026-06-16", time: "19:00:00", group: "I", home_team: "FRA", away_team: "SEN", venue: "Estadio Nueva York Nueva Jersey", city: "New York" },
  { match_number: 18, date: "2026-06-16", time: "22:00:00", group: "I", home_team: "IRQ", away_team: "NOR", venue: "Estadio de Boston", city: "Boston" },
  { match_number: 19, date: "2026-06-17", time: "01:00:00", group: "J", home_team: "ARG", away_team: "ALG", venue: "Estadio de Kansas City", city: "Kansas City" },
  { match_number: 20, date: "2026-06-17", time: "04:00:00", group: "J", home_team: "AUT", away_team: "JOR", venue: "Estadio Bahía de San Francisco", city: "San Francisco" },
  // ===== MIÉRCOLES 17 DE JUNIO =====
  { match_number: 21, date: "2026-06-17", time: "17:00:00", group: "K", home_team: "POR", away_team: "COD", venue: "Estadio de Houston", city: "Houston" },
  { match_number: 22, date: "2026-06-17", time: "20:00:00", group: "L", home_team: "ENG", away_team: "CRO", venue: "Estadio de Dallas", city: "Dallas" },
  { match_number: 23, date: "2026-06-17", time: "23:00:00", group: "L", home_team: "GHA", away_team: "PAN", venue: "Estadio de Toronto", city: "Toronto" },
  { match_number: 24, date: "2026-06-18", time: "02:00:00", group: "K", home_team: "UZB", away_team: "COL", venue: "Estadio Ciudad de México", city: "Mexico City" },
  // ===== JUEVES 18 DE JUNIO =====
  { match_number: 25, date: "2026-06-18", time: "16:00:00", group: "A", home_team: "CZE", away_team: "RSA", venue: "Estadio de Atlanta", city: "Atlanta" },
  { match_number: 26, date: "2026-06-18", time: "19:00:00", group: "B", home_team: "SUI", away_team: "BIH", venue: "Estadio de Los Ángeles", city: "Los Angeles" },
  { match_number: 27, date: "2026-06-18", time: "22:00:00", group: "B", home_team: "CAN", away_team: "QAT", venue: "Estadio BC Place Vancouver", city: "Vancouver" },
  { match_number: 28, date: "2026-06-19", time: "01:00:00", group: "A", home_team: "MEX", away_team: "KOR", venue: "Estadio Guadalajara", city: "Guadalajara" },
  // ===== VIERNES 19 DE JUNIO =====
  { match_number: 29, date: "2026-06-19", time: "19:00:00", group: "D", home_team: "USA", away_team: "AUS", venue: "Estadio de Seattle", city: "Seattle" },
  { match_number: 30, date: "2026-06-19", time: "22:00:00", group: "C", home_team: "SCO", away_team: "MAR", venue: "Estadio de Boston", city: "Boston" },
  { match_number: 31, date: "2026-06-20", time: "00:30:00", group: "C", home_team: "BRA", away_team: "HAI", venue: "Estadio de Filadelfia", city: "Philadelphia" },
  { match_number: 32, date: "2026-06-20", time: "03:00:00", group: "D", home_team: "TUR", away_team: "PAR", venue: "Estadio Bahía de San Francisco", city: "San Francisco" },
  // ===== SÁBADO 20 DE JUNIO =====
  { match_number: 33, date: "2026-06-20", time: "17:00:00", group: "F", home_team: "NED", away_team: "SWE", venue: "Estadio de Houston", city: "Houston" },
  { match_number: 34, date: "2026-06-20", time: "20:00:00", group: "E", home_team: "GER", away_team: "CIV", venue: "Estadio de Toronto", city: "Toronto" },
  { match_number: 35, date: "2026-06-21", time: "00:00:00", group: "E", home_team: "ECU", away_team: "CUW", venue: "Estadio de Kansas City", city: "Kansas City" },
  { match_number: 36, date: "2026-06-21", time: "04:00:00", group: "F", home_team: "TUN", away_team: "JPN", venue: "Estadio Monterrey", city: "Monterrey" },
  // ===== DOMINGO 21 DE JUNIO =====
  { match_number: 37, date: "2026-06-21", time: "16:00:00", group: "H", home_team: "ESP", away_team: "KSA", venue: "Estadio de Atlanta", city: "Atlanta" },
  { match_number: 38, date: "2026-06-21", time: "19:00:00", group: "G", home_team: "BEL", away_team: "IRN", venue: "Estadio de Los Ángeles", city: "Los Angeles" },
  { match_number: 39, date: "2026-06-21", time: "22:00:00", group: "H", home_team: "URU", away_team: "CPV", venue: "Estadio de Miami", city: "Miami" },
  { match_number: 40, date: "2026-06-22", time: "01:00:00", group: "G", home_team: "NZL", away_team: "EGY", venue: "Estadio BC Place Vancouver", city: "Vancouver" },
  // ===== LUNES 22 DE JUNIO =====
  { match_number: 41, date: "2026-06-22", time: "17:00:00", group: "J", home_team: "ARG", away_team: "AUT", venue: "Estadio de Dallas", city: "Dallas" },
  { match_number: 42, date: "2026-06-22", time: "21:00:00", group: "I", home_team: "FRA", away_team: "IRQ", venue: "Estadio de Filadelfia", city: "Philadelphia" },
  { match_number: 43, date: "2026-06-23", time: "00:00:00", group: "I", home_team: "NOR", away_team: "SEN", venue: "Estadio Nueva York Nueva Jersey", city: "New York" },
  { match_number: 44, date: "2026-06-23", time: "03:00:00", group: "J", home_team: "JOR", away_team: "ALG", venue: "Estadio Bahía de San Francisco", city: "San Francisco" },
  // ===== MARTES 23 DE JUNIO =====
  { match_number: 45, date: "2026-06-23", time: "17:00:00", group: "K", home_team: "POR", away_team: "UZB", venue: "Estadio de Houston", city: "Houston" },
  { match_number: 46, date: "2026-06-23", time: "20:00:00", group: "L", home_team: "ENG", away_team: "GHA", venue: "Estadio de Miami", city: "Miami" },
  { match_number: 47, date: "2026-06-23", time: "23:00:00", group: "L", home_team: "PAN", away_team: "CRO", venue: "Estadio de Toronto", city: "Toronto" },
  { match_number: 48, date: "2026-06-24", time: "02:00:00", group: "K", home_team: "COL", away_team: "COD", venue: "Estadio Guadalajara", city: "Guadalajara" },
  // ===== MIÉRCOLES 24 DE JUNIO =====
  { match_number: 49, date: "2026-06-24", time: "19:00:00", group: "B", home_team: "SUI", away_team: "CAN", venue: "Estadio BC Place Vancouver", city: "Vancouver" },
  { match_number: 50, date: "2026-06-24", time: "19:00:00", group: "B", home_team: "BIH", away_team: "QAT", venue: "Estadio de Seattle", city: "Seattle" },
  { match_number: 51, date: "2026-06-24", time: "22:00:00", group: "C", home_team: "MAR", away_team: "HAI", venue: "Estadio de Atlanta", city: "Atlanta" },
  { match_number: 52, date: "2026-06-24", time: "22:00:00", group: "C", home_team: "SCO", away_team: "BRA", venue: "Estadio de Miami", city: "Miami" },
  { match_number: 53, date: "2026-06-25", time: "01:00:00", group: "A", home_team: "CZE", away_team: "MEX", venue: "Estadio Ciudad de México", city: "Mexico City" },
  { match_number: 54, date: "2026-06-25", time: "01:00:00", group: "A", home_team: "RSA", away_team: "KOR", venue: "Estadio Monterrey", city: "Monterrey" },
  // ===== JUEVES 25 DE JUNIO =====
  { match_number: 55, date: "2026-06-25", time: "20:00:00", group: "E", home_team: "CUW", away_team: "CIV", venue: "Estadio de Filadelfia", city: "Philadelphia" },
  { match_number: 56, date: "2026-06-25", time: "20:00:00", group: "E", home_team: "ECU", away_team: "GER", venue: "Estadio Nueva York Nueva Jersey", city: "New York" },
  { match_number: 57, date: "2026-06-25", time: "23:00:00", group: "F", home_team: "TUN", away_team: "NED", venue: "Estadio de Kansas City", city: "Kansas City" },
  { match_number: 58, date: "2026-06-25", time: "23:00:00", group: "F", home_team: "JPN", away_team: "SWE", venue: "Estadio de Dallas", city: "Dallas" },
  { match_number: 59, date: "2026-06-26", time: "02:00:00", group: "D", home_team: "TUR", away_team: "USA", venue: "Estadio de Los Ángeles", city: "Los Angeles" },
  { match_number: 60, date: "2026-06-26", time: "02:00:00", group: "D", home_team: "PAR", away_team: "AUS", venue: "Estadio Bahía de San Francisco", city: "San Francisco" },
  // ===== VIERNES 26 DE JUNIO =====
  { match_number: 61, date: "2026-06-26", time: "19:00:00", group: "I", home_team: "NOR", away_team: "FRA", venue: "Estadio de Boston", city: "Boston" },
  { match_number: 62, date: "2026-06-26", time: "19:00:00", group: "I", home_team: "SEN", away_team: "IRQ", venue: "Estadio de Toronto", city: "Toronto" },
  { match_number: 63, date: "2026-06-27", time: "00:00:00", group: "H", home_team: "CPV", away_team: "KSA", venue: "Estadio de Houston", city: "Houston" },
  { match_number: 64, date: "2026-06-27", time: "00:00:00", group: "H", home_team: "URU", away_team: "ESP", venue: "Estadio de Seattle", city: "Seattle" },
  { match_number: 65, date: "2026-06-27", time: "03:00:00", group: "G", home_team: "NZL", away_team: "BEL", venue: "Estadio BC Place Vancouver", city: "Vancouver" },
  { match_number: 66, date: "2026-06-27", time: "03:00:00", group: "G", home_team: "EGY", away_team: "IRN", venue: "Estadio de Los Ángeles", city: "Los Angeles" },
  // ===== SÁBADO 27 DE JUNIO =====
  { match_number: 67, date: "2026-06-27", time: "20:00:00", group: "L", home_team: "PAN", away_team: "ENG", venue: "Estadio Nueva York Nueva Jersey", city: "New York" },
  { match_number: 68, date: "2026-06-27", time: "20:00:00", group: "L", home_team: "CRO", away_team: "GHA", venue: "Estadio de Boston", city: "Boston" },
  { match_number: 69, date: "2026-06-27", time: "23:30:00", group: "K", home_team: "COL", away_team: "POR", venue: "Estadio de Miami", city: "Miami" },
  { match_number: 70, date: "2026-06-27", time: "23:30:00", group: "K", home_team: "COD", away_team: "UZB", venue: "Estadio de Atlanta", city: "Atlanta" },
  { match_number: 71, date: "2026-06-28", time: "02:00:00", group: "J", home_team: "ALG", away_team: "AUT", venue: "Estadio de Dallas", city: "Dallas" },
  { match_number: 72, date: "2026-06-28", time: "02:00:00", group: "J", home_team: "JOR", away_team: "ARG", venue: "Estadio de Kansas City", city: "Kansas City" },
]

async function updateMatches() {
  console.log('🔄 Actualizando partidos en DB del proyecto ORIGINAL...\n')
  
  // 1. Obtener equipos
  const { data: teams } = await supabase.from('teams').select('id, code')
  const teamMap = new Map(teams?.map(t => [t.code, t.id]) || [])
  
  // 2. Obtener partidos actuales
  const { data: currentMatches } = await supabase
    .from('matches')
    .select('id, match_order')
    .order('match_order', { ascending: true })
  
  const matchMap = new Map(currentMatches?.map(m => [m.match_order, m.id]) || [])
  
  let updated = 0
  let errors = 0
  
  for (const match of WORLD_CUP_2026_MATCHES) {
    const matchId = matchMap.get(match.match_number)
    if (!matchId) {
      console.error(`❌ Match ${match.match_number} no encontrado`)
      errors++
      continue
    }
    
    const homeTeamId = teamMap.get(match.home_team)
    const awayTeamId = teamMap.get(match.away_team)
    
    if (!homeTeamId || !awayTeamId) {
      console.error(`❌ Equipos no encontrados para match ${match.match_number}`)
      errors++
      continue
    }
    
    const matchDate = new Date(`${match.date}T${match.time}Z`)
    
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        match_date: matchDate.toISOString(),
        group_letter: match.group,
        venue: match.venue,
        city: match.city,
      })
      .eq('id', matchId)
    
    if (updateError) {
      console.error(`❌ Error actualizando match ${match.match_number}:`, updateError)
      errors++
    } else {
      console.log(`✅ Match ${match.match_number}: ${match.home_team} vs ${match.away_team}`)
      updated++
    }
  }
  
  console.log(`\n📊 Resumen: ${updated} actualizados, ${errors} errores`)
  
  // Eliminar partido 73 si existe
  const { data: match73 } = await supabase
    .from('matches')
    .select('id')
    .eq('match_order', 73)
    .single()
  
  if (match73) {
    await supabase.from('matches').delete().eq('id', match73.id)
    console.log('✅ Partido 73 eliminado')
  }
  
  // Verificar si falta match 61
  const { data: match61 } = await supabase
    .from('matches')
    .select('id')
    .eq('match_order', 61)
    .single()
  
  if (!match61) {
    const norId = teamMap.get('NOR')
    const fraId = teamMap.get('FRA')
    if (norId && fraId) {
      await supabase.from('matches').insert({
        match_order: 61,
        home_team_id: norId,
        away_team_id: fraId,
        match_date: '2026-06-26T19:00:00.000Z',
        group_letter: 'I',
        round_name: 'group_stage',
        venue: 'Estadio de Boston',
        city: 'Boston',
        status: 'upcoming'
      })
      console.log('✅ Partido 61 creado')
    }
  }
  
  console.log('\n🎉 ¡Proceso completado!')
}

updateMatches()
