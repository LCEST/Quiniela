'use client'

import { useState, createContext, useContext, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DropdownContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  selectedValue: string
  setSelectedValue: (value: string) => void
}

const DropdownContext = createContext<DropdownContextType | null>(null)

function useDropdown() {
  const context = useContext(DropdownContext)
  if (!context) throw new Error('useDropdown must be used within Dropdown')
  return context
}

interface DropdownProps {
  children: React.ReactNode
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function Dropdown({ children, defaultValue, value, onChange, className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [internalValue, setInternalValue] = useState(defaultValue || '')
  const selectedValue = value !== undefined ? value : internalValue
  
  const setSelectedValue = (val: string) => {
    setInternalValue(val)
    onChange?.(val)
  }
  
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, selectedValue, setSelectedValue }}>
      <div ref={ref} className={cn('relative', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export function DropdownTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { isOpen, setIsOpen } = useDropdown()
  
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/80 backdrop-blur-sm border border-border/60',
        'text-sm font-medium text-foreground transition-all duration-200',
        'hover:bg-card hover:border-border hover:shadow-md',
        'active:scale-[0.98]',
        isOpen && 'bg-card border-primary/50 shadow-md',
        className
      )}
    >
      {children}
      <svg 
        className={cn('w-4 h-4 text-muted transition-transform duration-200', isOpen && 'rotate-180')} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

export function DropdownContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { isOpen } = useDropdown()
  const [position, setPosition] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 200 })
  const contentRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  // Get trigger ref from parent
  useEffect(() => {
    if (isOpen && contentRef.current) {
      const parent = contentRef.current.parentElement
      const trigger = parent?.querySelector('button')
      if (trigger) {
        const rect = trigger.getBoundingClientRect()
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: Math.max(rect.width, 200),
        })
      }
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            width: position.width,
            zIndex: 9999,
          }}
          className={cn(
            'rounded-xl bg-card/95 backdrop-blur-xl',
            'border border-border/60 shadow-2xl shadow-black/20 overflow-hidden',
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function DropdownItem({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { selectedValue, setSelectedValue, setIsOpen } = useDropdown()
  const isSelected = selectedValue === value
  
  return (
    <button
      onClick={() => {
        setSelectedValue(value)
        setIsOpen(false)
      }}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150',
        'hover:bg-primary/5',
        isSelected ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground',
        className
      )}
    >
      {isSelected && (
        <motion.div
          layoutId="dropdown-check"
          className="w-1.5 h-1.5 rounded-full bg-primary"
        />
      )}
      {!isSelected && <div className="w-1.5 h-1.5 rounded-full bg-transparent" />}
      {children}
    </button>
  )
}

// Accordion Component
interface AccordionProps {
  children: React.ReactNode
  className?: string
  defaultOpen?: boolean
}

export function Accordion({ children, className, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className={cn('rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden', className)}>
      {children}
    </div>
  )
}

export function AccordionTrigger({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between px-5 py-4 text-sm font-medium transition-all',
        'hover:bg-card/80',
        className
      )}
    >
      {children}
    </button>
  )
}

export function AccordionContent({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          className="overflow-hidden"
        >
          <div className="px-5 pb-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Badge Component
export function Badge({ children, variant = 'default', className }: { 
  children: React.ReactNode; 
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'live';
  className?: string 
}) {
  const variants = {
    default: 'bg-card border-border text-muted',
    primary: 'bg-primary/10 border-primary/20 text-primary',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    danger: 'bg-red-500/10 border-red-500/20 text-red-400',
    live: 'bg-red-500/20 border-red-500/30 text-red-400 animate-pulse',
  }
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm',
      variants[variant],
      className
    )}>
      {variant === 'live' && (
        <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
      )}
      {children}
    </span>
  )
}

// GlassCard Component
export function GlassCard({ children, className, hover = true }: { 
  children: React.ReactNode; 
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn(
      'rounded-2xl bg-card/60 backdrop-blur-xl border border-white/5',
      'shadow-xl shadow-black/5',
      hover && 'transition-all duration-300 hover:bg-card/80 hover:border-white/10 hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-0.5',
      className
    )}>
      {children}
    </div>
  )
}

// SectionHeader Component
export function SectionHeader({ title, subtitle, icon: Icon, action }: { 
  title: string; 
  subtitle?: string; 
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </div>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

// FloatingActionButton
export function FloatingActionButton({ children, onClick, className }: { 
  children: React.ReactNode; 
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-primary text-white',
        'shadow-2xl shadow-primary/40 flex items-center justify-center',
        'transition-all duration-200 hover:shadow-primary/60',
        className
      )}
    >
      {children}
    </motion.button>
  )
}

// StickyHeader
export function StickyHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <header className={cn(
      'sticky top-0 z-[50] bg-background/80 backdrop-blur-xl border-b border-white/5',
      className
    )}>
      {children}
    </header>
  )
}
