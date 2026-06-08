import { useState, useEffect } from 'react'

export function useServerTime() {
  const [serverTime, setServerTime] = useState<number>(Date.now())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchServerTime() {
      try {
        const res = await fetch('/api/time', { cache: 'no-store' })
        const data = await res.json()
        if (data.timestamp) {
          setServerTime(data.timestamp)
        }
      } catch (error) {
        console.error('Error fetching server time:', error)
        // Fallback a hora local si falla
        setServerTime(Date.now())
      } finally {
        setIsLoading(false)
      }
    }

    fetchServerTime()
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchServerTime, 30000)
    return () => clearInterval(interval)
  }, [])

  return { serverTime, isLoading }
}
