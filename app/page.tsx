'use client'

import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Trophy, Globe, Zap, Shield, Users, Smartphone, ArrowRight, Sparkles, Star, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32">
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 backdrop-blur-sm"
            >
              <Globe className="w-4 h-4" />
              Mundial 2026 — USA · Canadá · México
              <Sparkles className="w-3.5 h-3.5" />
            </motion.div>
            
            {/* Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground mb-6 leading-[0.95] tracking-tight">
              La Quiniela
              <span className="block mt-2 bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent">
                Mundial 2026
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
              Predice los resultados, compite con tus amigos y demuestra que eres el mejor experto en fútbol del mundo.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignedOut>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <SignUpButton mode="modal">
                    <button className="group px-8 py-4 bg-gradient-to-r from-primary to-emerald-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center gap-3">
                      <Zap className="w-5 h-5" />
                      Crear Cuenta Gratis
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </SignUpButton>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <SignInButton mode="modal">
                    <button className="px-8 py-4 bg-card/80 backdrop-blur-sm border border-white/10 text-foreground rounded-2xl font-bold text-lg hover:bg-card hover:border-white/20 transition-all">
                      Iniciar Sesión
                    </button>
                  </SignInButton>
                </motion.div>
              </SignedOut>

              <SignedIn>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/home">
                    <button className="group px-8 py-4 bg-gradient-to-r from-primary to-emerald-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center gap-3">
                      <Trophy className="w-5 h-5" />
                      Ir al Dashboard
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </motion.div>
              </SignedIn>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Todo lo que necesitas
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Una experiencia completa para disfrutar del Mundial como nunca antes
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: <Star className="w-6 h-6" />,
                title: 'Predicciones Inteligentes',
                description: 'Predice marcadores exactos o resultados. Gana 3 puntos por acertar el marcador, 1 por acertar el resultado.',
                gradient: 'from-primary/20 to-emerald-500/10',
                border: 'border-primary/20',
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Ranking Global',
                description: 'Compite contra todos los usuarios del mundo. Ve tu posición en tiempo real y demuestra quién es el mejor.',
                gradient: 'from-blue-500/20 to-cyan-500/10',
                border: 'border-blue-500/20',
              },
              {
                icon: <Smartphone className="w-6 h-6" />,
                title: 'App Móvil',
                description: 'Instala la app en tu teléfono. Funciona offline y recibe notificaciones en vivo de los partidos.',
                gradient: 'from-purple-500/20 to-pink-500/10',
                border: 'border-purple-500/20',
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: 'Estadísticas en Vivo',
                description: 'Sigue el rendimiento de tus predicciones en tiempo real. Análisis detallado de tu progreso.',
                gradient: 'from-amber-500/20 to-orange-500/10',
                border: 'border-amber-500/20',
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Seguro y Confiable',
                description: 'Tus predicciones se guardan de forma segura. Bloqueo automático cuando inicia el partido.',
                gradient: 'from-red-500/20 to-rose-500/10',
                border: 'border-red-500/20',
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: 'Diseño Premium',
                description: 'Interfaz moderna con glassmorphism, animaciones fluidas y una experiencia visual inmersiva.',
                gradient: 'from-teal-500/20 to-emerald-500/10',
                border: 'border-teal-500/20',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`relative rounded-2xl p-6 border ${feature.border} bg-gradient-to-br ${feature.gradient} backdrop-blur-sm group cursor-default`}
              >
                <div className="absolute inset-0 bg-card/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-primary mb-4 backdrop-blur-sm border border-white/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '72', label: 'Partidos', suffix: '' },
              { value: '48', label: 'Equipos', suffix: '' },
              { value: '12', label: 'Grupos', suffix: '' },
              { value: '∞', label: 'Diversión', suffix: '' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl p-6 border border-white/5 bg-card/40 backdrop-blur-sm text-center overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-emerald-400 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
