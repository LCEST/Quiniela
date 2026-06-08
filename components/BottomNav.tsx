'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { SignOutButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, LogOut, Shield, Home, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isAdmin } from '@/lib/admin'

export default function BottomNav() {
  const { userId } = useAuth()
  const { user } = useUser()
  const pathname = usePathname()

  if (!userId) return null

  const userIsAdmin = isAdmin(user?.emailAddresses?.[0]?.emailAddress)

  const navItems = [
    { href: '/home', label: 'Inicio', icon: Home },
    { href: '/partidos', label: 'Partidos', icon: Trophy },
    { href: '/ranking', label: 'Ranking', icon: BarChart3 },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-2xl border-t border-white/5" />
      
      {/* Content */}
      <div className="relative max-w-lg mx-auto">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted hover:text-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNav"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <div className="relative z-10">
                  <Icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
                </div>
                <span className={cn(
                  'relative z-10 text-[10px] font-medium transition-all',
                  isActive ? 'opacity-100' : 'opacity-70'
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* Admin Link */}
          {userIsAdmin && (
            <Link
              href="/admin/resultados"
              className={cn(
                'relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                pathname?.startsWith('/admin')
                  ? 'text-amber-400'
                  : 'text-muted hover:text-foreground'
              )}
            >
              {pathname?.startsWith('/admin') && (
                <motion.div
                  layoutId="bottomNav"
                  className="absolute inset-0 bg-amber-400/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <div className="relative z-10">
                <Shield className={cn('w-5 h-5', pathname?.startsWith('/admin') && 'scale-110')} />
              </div>
              <span className="relative z-10 text-[10px] font-medium">Admin</span>
            </Link>
          )}

          {/* Sign Out */}
          <SignOutButton>
            <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-muted hover:text-red-400 transition-all duration-200">
              <LogOut className="w-5 h-5" />
              <span className="text-[10px] font-medium">Salir</span>
            </button>
          </SignOutButton>
        </div>
      </div>

      {/* Footer Text */}
      <div className="relative text-center py-1 border-t border-white/5 bg-background/80">
        <p className="text-white/40 text-[9px] font-medium">
          Built by Luis Esturbán · Next.js · Clerk · Supabase · Tailwind CSS
        </p>
      </div>

      {/* Safe Area Spacer for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
