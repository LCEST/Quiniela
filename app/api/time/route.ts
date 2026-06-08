import { NextResponse } from 'next/server'

export async function GET() {
  // Devuelve la hora actual del servidor (UTC)
  // Esto no se puede manipular desde el cliente
  return NextResponse.json({
    serverTime: new Date().toISOString(),
    timestamp: Date.now(),
  })
}
