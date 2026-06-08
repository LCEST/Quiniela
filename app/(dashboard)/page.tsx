'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardRootPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/partidos')
  }, [router])
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}
