const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://cgdgehvmdewdjanyajzx.supabase.co'
const supabaseKey = 'sb_secret_BHiVfqD6NqgaPuvvNHZISg_CvJpXmDm'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

async function checkMatches() {
  console.log('🔍 Verificando partidos en DB del proyecto ORIGINAL...\n')
  
  const { data: matches, error } = await supabase
    .from('matches')
    .select('match_order, match_date, home_team:home_team_id(code), away_team:away_team_id(code), group_letter, venue, city')
    .order('match_order', { ascending: true })
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  console.log(`📊 Total de partidos: ${matches?.length || 0}`)
  
  // Verificar partidos extra (más de 72)
  const extra = matches?.filter(m => m.match_order > 72) || []
  if (extra.length > 0) {
    console.log(`\n⚠️  Partidos extra: ${extra.length}`)
    extra.forEach(m => console.log(`   Match ${m.match_order}: ${m.home_team?.code} vs ${m.away_team?.code}`))
  }
  
  // Verificar partidos faltantes
  const existing = new Set(matches?.map(m => m.match_order) || [])
  const missing = []
  for (let i = 1; i <= 72; i++) {
    if (!existing.has(i)) missing.push(i)
  }
  if (missing.length > 0) {
    console.log(`\n❌ Partidos faltantes: ${missing.length}`)
    missing.forEach(m => console.log(`   Match ${m}`))
  }
  
  // Verificar primeros 10 y últimos 10 partidos
  console.log('\n📅 Primeros 10 partidos:')
  matches?.slice(0, 10).forEach(m => {
    const d = new Date(m.match_date)
    console.log(`   ${m.match_order}: ${m.home_team?.code} vs ${m.away_team?.code} - ${d.toISOString()} UTC - Grupo ${m.group_letter}`)
  })
  
  console.log('\n📅 Últimos 10 partidos:')
  matches?.slice(-10).forEach(m => {
    const d = new Date(m.match_date)
    console.log(`   ${m.match_order}: ${m.home_team?.code} vs ${m.away_team?.code} - ${d.toISOString()} UTC - Grupo ${m.group_letter}`)
  })
  
  if (matches?.length === 72 && extra.length === 0 && missing.length === 0) {
    console.log('\n✅ Cantidad de partidos correcta: 72')
  }
  
  console.log('\n⚠️  NOTA: Para verificar fechas/horarios exactos, necesito comparar con el calendario oficial.')
  console.log('¿Quieres que haga una verificación completa como en el proyecto GTD?')
}

checkMatches()
