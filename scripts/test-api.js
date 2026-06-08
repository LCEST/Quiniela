#!/usr/bin/env node

/**
 * Script de verificación rápida
 * Ejecuta: node scripts/test-api.js
 */

const BASE_URL = 'http://localhost:3000'

async function test(endpoint, description) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`)
    const data = await res.json()
    
    if (data.success || data.matches || data.error === undefined) {
      console.log(`✅ ${description}`)
      return true
    } else {
      console.log(`❌ ${description}: ${data.error || 'Unknown error'}`)
      return false
    }
  } catch (err) {
    console.log(`❌ ${description}: ${err.message}`)
    return false
  }
}

async function runTests() {
  console.log('🔍 Verificando Quiniela Mundial 2026...\n')
  
  const results = []
  
  // Test 1: API de partidos
  results.push(await test('/api/matches?group=all', 'API de partidos'))
  
  // Test 2: Seed de equipos
  const seedRes = await fetch(`${BASE_URL}/api/seed`, { method: 'POST' })
  const seedData = await seedRes.json()
  if (seedData.success && seedData.matches === 72) {
    console.log(`✅ Seeding correcto (72 partidos, 48 equipos)`)
    results.push(true)
  } else {
    console.log(`❌ Seeding: Esperado 72 partidos, recibido ${seedData.matches || 0}`)
    results.push(false)
  }
  
  // Test 3: Verificar partidos por grupo
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
  for (const group of groups) {
    const res = await fetch(`${BASE_URL}/api/matches?group=${group}`)
    const data = await res.json()
    const count = data.matches?.length || 0
    if (count === 6) {
      console.log(`✅ Grupo ${group}: ${count} partidos`)
      results.push(true)
    } else {
      console.log(`❌ Grupo ${group}: Esperado 6, recibido ${count}`)
      results.push(false)
    }
  }
  
  // Test 4: Verificar 72 partidos totales
  const res = await fetch(`${BASE_URL}/api/matches?group=all`)
  const data = await res.json()
  const totalMatches = data.matches?.length || 0
  if (totalMatches === 72) {
    console.log(`✅ Total: ${totalMatches} partidos (correcto)`)
    results.push(true)
  } else {
    console.log(`❌ Total: Esperado 72, recibido ${totalMatches}`)
    results.push(false)
  }
  
  // Resumen
  const passed = results.filter(r => r).length
  const total = results.length
  
  console.log(`\n📊 Resumen: ${passed}/${total} pruebas pasadas`)
  
  if (passed === total) {
    console.log('🎉 ¡Todo está funcionando correctamente!')
    process.exit(0)
  } else {
    console.log('⚠️ Algunas pruebas fallaron. Revisa los errores arriba.')
    process.exit(1)
  }
}

runTests()
