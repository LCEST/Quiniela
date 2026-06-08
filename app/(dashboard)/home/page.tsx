import { Trophy, Target, Star, Users, Clock, Shield, Check, Zap, Medal, AlertCircle } from 'lucide-react'
import { GlassCard, Badge } from '@/components/ui/modern'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg shadow-primary/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">Bienvenido</h1>
              <p className="text-xs text-muted">Quiniela Mundial 2026</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-32 space-y-6">
        {/* Welcome Message */}
        <GlassCard className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Quiniela Mundial 2026
          </h2>
          <p className="text-muted max-w-lg mx-auto">
            Predice los resultados de los 72 partidos de la fase de grupos y compite por el primer lugar.
          </p>
        </GlassCard>

        {/* How to Play */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Como Jugar
          </h2>
          
          <div className="grid gap-3">
            <StepCard
              number={1}
              title="Ve a Partidos"
              description="Navega a la seccion de partidos para ver los 72 encuentros de la fase de grupos."
              icon={<Zap className="w-5 h-5" />}
            />
            <StepCard
              number={2}
              title="Haz tu Prediccion"
              description="Selecciona quien ganara o si sera empate. Puedes ingresar el marcador exacto opcional."
              icon={<Target className="w-5 h-5" />}
            />
            <StepCard
              number={3}
              title="Guarda tu Prediccion"
              description="Presiona Guardar antes de que inicie el partido. Las predicciones se bloquean automaticamente."
              icon={<Check className="w-5 h-5" />}
            />
            <StepCard
              number={4}
              title="Gana Puntos"
              description="Cuando el partido termine, el sistema calcula tus puntos automaticamente."
              icon={<Star className="w-5 h-5" />}
            />
          </div>
        </div>

        {/* Scoring System */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Medal className="w-5 h-5 text-primary" />
            Sistema de Puntos
          </h2>
          
          <div className="grid gap-3">
            <GlassCard className="p-4 border-l-4 border-l-primary">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">+3 Puntos - Marcador Exacto</h3>
                  <p className="text-sm text-muted mt-1">
                    Acertaste el resultado exacto. Ejemplo: Predijiste 2-1 y el resultado fue 2-1.
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 border-l-4 border-l-amber-400">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">+1 Punto - Resultado Correcto</h3>
                  <p className="text-sm text-muted mt-1">
                    Acertaste quien gana o el empate, pero no el marcador exacto. Ejemplo: Predijiste 2-0 y fue 1-0.
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 border-l-4 border-l-red-400">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-400/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">0 Puntos - Incorrecto</h3>
                  <p className="text-sm text-muted mt-1">
                    No acertaste el resultado. Ejemplo: Predijiste Gana Local y gano el Visitante.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Rules */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Reglas Importantes
          </h2>
          
          <div className="grid gap-2">
            <RuleItem icon={<Clock className="w-4 h-4" />} text="Las predicciones se bloquean automaticamente cuando el partido inicia." />
            <RuleItem icon={<Users className="w-4 h-4" />} text="Puedes actualizar tu prediccion mientras el partido este abierto." />
            <RuleItem icon={<Trophy className="w-4 h-4" />} text="El ranking se actualiza automaticamente cuando los partidos finalizan." />
            <RuleItem icon={<Check className="w-4 h-4" />} text="El marcador exacto es opcional, pero te da +3 puntos." />
          </div>
        </div>

        {/* CTA */}
        <Link href="/partidos">
          <div className="w-full py-4 bg-gradient-to-r from-primary to-emerald-500 text-white rounded-xl font-bold text-center shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95">
            Comenzar a Predecir
          </div>
        </Link>
      </main>
    </div>
  )
}

function StepCard({ number, title, description, icon }: { number: number; title: string; description: string; icon: React.ReactNode }) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-primary font-bold text-sm">{number}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            {icon}
            {title}
          </h3>
          <p className="text-sm text-muted mt-1">{description}</p>
        </div>
      </div>
    </GlassCard>
  )
}

function RuleItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
      <div className="text-primary">{icon}</div>
      <p className="text-sm text-muted">{text}</p>
    </div>
  )
}
