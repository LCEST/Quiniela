# Manual de Pruebas - Quiniela Mundial 2026

## 1. Autenticación (Clerk)

### Prueba 1.1: Registro de usuario
1. Ve a `http://localhost:3000`
2. Haz clic en **"Crear Cuenta Gratis"**
3. Completa el registro con email/contraseña o Google
4. **Resultado esperado:** Te redirige automáticamente a `/partidos`

### Prueba 1.2: Inicio de sesión
1. Ve a `http://localhost:3000`
2. Haz clic en **"Iniciar Sesión"**
3. Ingresa tus credenciales
4. **Resultado esperado:** Te redirige a `/partidos`

### Prueba 1.3: Cierre de sesión
1. En la navegación inferior, haz clic en **"Salir"**
2. **Resultado esperado:** Te redirige a la página de inicio y no puedes acceder a `/partidos`

### Prueba 1.4: Acceso sin autenticación
1. Cierra sesión
2. Intenta acceder a `http://localhost:3000/partidos`
3. **Resultado esperado:** Te redirige a `/` (login)

---

## 2. Partidos (72 partidos de fase de grupos)

### Prueba 2.1: Ver partidos
1. Ve a `http://localhost:3000/partidos`
2. **Resultado esperado:** Debes ver 72 partidos con:
   - Banderas de cada país
   - Nombres de equipos
   - Fecha y hora (hora de Guatemala)
   - Estadio y ciudad
   - Badge "Grupo X"

### Prueba 2.2: Filtros
1. Haz clic en el filtro **"Todos"** (desplegable)
   - Selecciona "Hoy" → Debe mostrar solo partidos del día actual
   - Selecciona "Próximos" → Solo partidos futuros
   - Selecciona "Finalizados" → Solo partidos con resultado
2. Haz clic en el filtro **"Todos los grupos"**
   - Selecciona "Grupo A" → Solo partidos del grupo A
   - Selecciona "Grupo B" → Solo partidos del grupo B
3. **Resultado esperado:** Los filtros funcionan correctamente

### Prueba 2.3: Predicción (seleccionar resultado)
1. Busca un partido no finalizado
2. Haz clic en **"Selecciona un resultado"** para expandir
3. Haz clic en **"Gana [equipo]"** o **"Empate"**
4. **Resultado esperado:** El botón se resalta con color verde

### Prueba 2.4: Predicción con marcador exacto
1. Expande un partido
2. Selecciona un resultado (ej: Gana MEX)
3. Ingresa marcador en los campos (ej: 2 - 0)
4. Haz clic en **"Guardar Predicción"**
5. **Resultado esperado:** Aparece badge "Predicho" en la parte superior

### Prueba 2.5: Bloqueo de predicciones
1. Espera a que un partido esté por iniciar (o modifica la fecha del sistema)
2. **Resultado esperado:** El botón dice "Predicciones cerradas" y no se puede interactuar

---

## 3. Ranking Global

### Prueba 3.1: Ver ranking
1. Ve a `http://localhost:3000/ranking`
2. **Resultado esperado:** 
   - Lista de usuarios ordenados por puntos
   - Tu nombre y posición
   - Columnas: Posición, Usuario, Puntos, Exactos, Correctos

### Prueba 3.2: Puntos después de predicción
1. Haz una predicción en un partido
2. Ve a `/ranking`
3. **Resultado esperado:** Tus puntos deben reflejarse (si ya tienes partidos finalizados)

---

## 4. Admin (Ingresar resultados)

### Prueba 4.1: Acceso de admin
1. Configura tu email en `lib/admin.ts`:
   ```typescript
   export const ADMIN_EMAILS = ['tuemail@ejemplo.com']
   ```
2. Inicia sesión con ese email
3. Ve a `http://localhost:3000/admin/resultados`
4. **Resultado esperado:** Ves el panel de administración

### Prueba 4.2: Acceso denegado (no admin)
1. Inicia sesión con un email que NO esté en ADMIN_EMAILS
2. Intenta acceder a `/admin/resultados`
3. **Resultado esperado:** Te redirige a `/partidos`

### Prueba 4.3: Ingresar resultado
1. Como admin, ve a `/admin/resultados`
2. Busca un partido con la barra de búsqueda
3. Haz clic en el partido para expandir
4. Ingresa marcador: Ej. 2 - 1
5. Haz clic en **"Guardar Resultado"**
6. **Resultado esperado:**
   - Partido marcado como "Completado"
   - El partido aparece en `/partidos` con el resultado
   - Los puntos de los usuarios se calculan automáticamente

### Prueba 4.4: Cálculo de puntos automático
1. Ingresa un resultado donde un usuario acertó el marcador exacto
2. Ve a `/ranking`
3. **Resultado esperado:** El usuario recibe +3 puntos
4. Ingresa un resultado donde un usuario acertó solo el resultado (ganador/empate)
5. **Resultado esperado:** El usuario recibe +1 punto

---

## 5. Sistema de Puntos

### Reglas:
- **3 puntos:** Marcador exacto (ej: predijiste 2-1 y el resultado fue 2-1)
- **1 punto:** Resultado correcto pero no el marcador exacto (ej: predijiste 2-0 y fue 1-0)
- **0 puntos:** Resultado incorrecto (ej: predijiste Gana Local y ganó Visitante)

### Prueba 5.1: Verificar cálculo de puntos
1. Como admin, ingresa un resultado
2. Ve a `/partidos` y busca ese partido
3. Si hiciste predicción, deberías ver:
   - Badge "+3 pts" (si acertaste marcador)
   - Badge "+1 pt" (si acertaste resultado)
   - Badge "0 pts" (si no acertaste)

---

## 6. Verificación de Datos

### Prueba 6.1: Total de partidos
1. Ve a `/partidos`
2. En el filtro de estado, selecciona "Todos"
3. En el filtro de grupo, selecciona "Todos los grupos"
4. **Resultado esperado:** Deben aparecer 72 partidos

### Prueba 6.2: Partidos por equipo
1. Cada equipo debe aparecer exactamente 3 veces:
   - Busca "México" → Debe aparecer 3 veces (MEX vs RSA, MEX vs KOR, CZE vs MEX)
   - Busca "Brasil" → Debe aparecer 3 veces (BRA vs MAR, BRA vs HAI, SCO vs BRA)

### Prueba 6.3: Partidos por grupo
1. Filtra por "Grupo A" → Deben aparecer 6 partidos
2. Filtra por "Grupo B" → Deben aparecer 6 partidos
3. Repite para todos los grupos (A-L)

---

## 7. Responsive / Móvil

### Prueba 7.1: Vista móvil
1. Abre las herramientas de desarrollador (F12)
2. Cambia a vista móvil (iPhone 12 Pro o similar)
3. **Resultado esperado:**
   - Todo se ve bien en pantalla pequeña
   - Navegación inferior visible
   - Partidos se ven en formato vertical
   - Dropdowns funcionan correctamente

---

## 8. PWA (Opcional)

### Prueba 8.1: Instalar app
1. En Chrome/Edge, busca el icono de "Instalar" en la barra de direcciones
2. Haz clic en "Instalar Quiniela Mundial 2026"
3. **Resultado esperado:** Se crea un icono en tu escritorio/inicio

---

## 9. Flujo Completo de Prueba

1. **Regístrate** como usuario
2. **Haz 5 predicciones** en diferentes partidos
3. **Ve al ranking** → Debes estar en la lista con 0 puntos
4. **Ingresa como admin** y guarda resultados de esos 5 partidos
5. **Ve al ranking** → Tus puntos deben haberse actualizado
6. **Verifica** en `/partidos` que los partidos ahora aparecen como "Finalizados" con marcador

---

## Errores Comunes

- **"No se ven las banderas"**: Windows no soporta emojis de banderas. Ya se cambió a SVG.
- **"No puedo acceder a admin"**: Verifica que tu email esté en `lib/admin.ts`
- **"Los partidos no se guardan"**: Verifica que `.env.local` tenga las claves de Supabase
- **"TypeError: fetch failed"**: El servidor de Supabase no está accesible o las claves son incorrectas

---

## Notas
- Las predicciones se bloquean automáticamente cuando el partido inicia
- El sistema calcula puntos automáticamente cuando el admin ingresa un resultado
- El ranking se actualiza en tiempo real
