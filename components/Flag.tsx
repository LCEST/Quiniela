'use client'

interface FlagProps {
  isoCode: string
  size?: number
  className?: string
}

export default function Flag({ isoCode, size = 40, className = '' }: FlagProps) {
  // Convertir códigos especiales
  const codeMap: Record<string, string> = {
    'GB-SCT': 'gb-sct',
    'GB-ENG': 'gb-eng',
    'CW': 'cw',
  }
  
  const code = codeMap[isoCode] || isoCode.toLowerCase()
  
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={`Bandera ${isoCode}`}
      width={size}
      height={size}
      className={`rounded-md shadow-sm inline-block ${className}`}
      style={{ objectFit: 'cover' }}
      onError={(e) => {
        // Fallback si no carga la imagen
        const target = e.target as HTMLImageElement
        target.style.display = 'none'
      }}
    />
  )
}
