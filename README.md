# 🏆 Quiniela Mundial 2026 — Arquitectura Moderna

Quiniela PWA ultra-moderna para el Mundial 2026 (USA · Canadá · México) construida con **Next.js 15 App Router**, **Clerk**, **Supabase**, **Tailwind CSS**, **TanStack Query** y **Framer Motion**.

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Estilos** | Tailwind CSS 3.4 + Modo oscuro |
| **UI** | Componentes custom + Lucide icons |
| **Animaciones** | Framer Motion |
| **Autenticación** | Clerk (Social Login) |
| **Base de datos** | Supabase (PostgreSQL) |
| **Estado/Caché** | TanStack Query (React Query) |
| **PWA** | Web App Manifest + Service Worker |

## 📁 Estructura de Archivos

```
quiniela-mundial-2026/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Route group (requiere auth)
│   │   ├── partidos/page.tsx     # Partidos del día + Optimistic Updates
│   │   ├── ranking/page.tsx      # Leaderboard global
│   │   ├── ligas/page.tsx        # Ligas privadas
│   │   └── page.tsx              # Redirect → /partidos
│   ├── api/
│   │   ├── matches/route.ts      # GET /api/matches
│   │   ├── predictions/route.ts  # POST/GET /api/predictions
│   │   └── leaderboard/route.ts  # GET /api/leaderboard
│   ├── layout.tsx                # Root layout (Clerk + TanStack Query)
│   ├── page.tsx                  # Landing page (marketing)
│   └── globals.css               # Tailwind + CSS variables
├── components/
│   ├── providers/QueryProvider.tsx # TanStack Query client
│   ├── matches/MatchCard.tsx     # Card de partido + predicción
│   └── ui/                       # Componentes reutilizables
├── hooks/
│   ├── useMatches.ts             # Hook para partidos
│   └── usePredictions.ts         # Hook para predicciones (con mutate)
├── lib/
│   ├── utils.ts                  # cn(), formatDate(), isMatchLocked()
│   └── supabase/client.ts        # Cliente Supabase
├── types/
│   └── index.ts                  # Tipos TypeScript
├── supabase/
│   └── schema.sql                # Schema completo + RLS + triggers
├── public/
│   └── manifest.json             # PWA manifest
├── middleware.ts                 # Clerk middleware
├── tailwind.config.js            # Config Tailwind
├── postcss.config.js             # PostCSS
└── next.config.js                # Next.js config
```

## 🗄️ Schema de Base de Datos (Supabase)

### Tablas principales:

- **teams** — 48 equipos del Mundial
- **matches** — 104 partidos con status, scores, grupos
- **users** — Synced desde Clerk (id, email, display_name, avatar)
- **predictions** — Predicciones de usuarios con cálculo automático de puntos
- **leagues** — Ligas privadas con código de invitación
- **league_members** — Miembros de ligas con puntos
- **user_stats** — Materialized view de estadísticas por usuario

### Features del Schema:

- **Enum types**: `match_status`, `prediction_result`, `league_role`
- **Triggers**:
  - `calculate_prediction_points()` — calcula automáticamente 3pts (exacto) o 1pt (resultado)
  - `update_user_stats()` — actualiza stats agregados después de cada predicción
  - `update_updated_at_column()` — timestamps automáticos
- **RLS policies** — cada usuario solo ve/manipula sus propios datos

## 🎯 PWA Features

- **Web App Manifest** (`/manifest.json`) — iconos, tema, modo standalone
- **Responsive** — Mobile-first con Tailwind
- **Offline** — TanStack Query cachea datos localmente
- **Instalable** — Add to Home Screen en iOS/Android

## 🛠️ Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.local.example .env.local
# Edita .env.local con tus keys
```

### 3. Configurar Supabase
1. Crea proyecto en [supabase.com](https://supabase.com)
2. Ejecuta `supabase/schema.sql` en el SQL Editor
3. Copia URL y anon key a `.env.local`

### 4. Configurar Clerk
1. Crea aplicación en [clerk.com](https://clerk.com)
2. Activa Google/Apple OAuth
3. Copia publishable key y secret key a `.env.local`

### 5. Ejecutar
```bash
npm run dev
```

## 📱 Flujo de Usuario

1. **Landing** → Ve la info del Mundial y botones de Login/Register
2. **Login** → Clerk modal con social login
3. **Dashboard** → Lista de partidos filtrados por fecha/grupo
4. **Predicción** → Toca el resultado (Gana L / Empate / Gana V) + marcador exacto
5. **Guardar** → Optimistic update (UI se actualiza instantáneamente)
6. **Ranking** → Tabla global de puntos
7. **Ligas** → Crear unirse a ligas privadas con código

## 🎨 Design System

- **Modo oscuro por defecto** (`#0f172a` background)
- **Color primario**: Verde (`#22c55e` — césped)
- **Color secundario**: Dorado (`#facc15` — trofeo)
- **Bordes redondeados**: `rounded-2xl` en cards
- **Animaciones**: Framer Motion en entrada de elementos y transiciones

## 📄 Licencia

MIT — ¡Suerte en el Mundial! 🏆⚽
