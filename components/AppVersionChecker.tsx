'use client'

import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

// Cambia este número cada vez que hagas un deploy importante
const APP_VERSION = '3'

export function AppVersionChecker() {
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    // Guardar versión actual en localStorage
    const savedVersion = localStorage.getItem('app-version')
    
    if (savedVersion && savedVersion !== APP_VERSION) {
      // Hay nueva versión
      setShowUpdate(true)
    } else {
      localStorage.setItem('app-version', APP_VERSION)
    }
  }, [])

  const handleUpdate = () => {
    // Limpiar todo el cache y recargar
    localStorage.setItem('app-version', APP_VERSION)
    
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName)
        })
      })
    }
    
    // Recargar forzando no-cache
    window.location.href = window.location.href + '?nocache=' + Date.now()
  }

  if (!showUpdate) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-white px-4 py-3 flex items-center justify-between shadow-lg">
      <span className="text-sm font-medium">¡Nueva versión disponible!</span>
      <button 
        onClick={handleUpdate}
        className="flex items-center gap-2 bg-white text-primary px-3 py-1.5 rounded-lg text-sm font-bold active:scale-95 transition-transform"
      >
        <RefreshCw className="w-4 h-4" />
        Actualizar
      </button>
    </div>
  )
}
