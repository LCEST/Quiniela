// Configuración de administradores
// Puedes agregar múltiples emails de admin aquí
export const ADMIN_EMAILS = [
  'lcesturban10@gmail.com',
  'p.aldana1997@gmail.com',
]

export function isAdmin(email?: string): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
