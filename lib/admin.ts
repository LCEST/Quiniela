// Configuración de administradores
// Puedes agregar múltiples emails de admin aquí
export const ADMIN_EMAILS = [
  'luis@example.com', // Cambia esto por tu email real
]

export function isAdmin(email?: string): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
