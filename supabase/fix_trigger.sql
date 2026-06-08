-- FIX: Trigger update_user_stats con GROUP BY explícito
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Eliminar el trigger antiguo (si existe)
DROP TRIGGER IF EXISTS update_stats_after_prediction ON predictions;

-- 2. Eliminar la función antigua (si existe)
DROP FUNCTION IF EXISTS update_user_stats();

-- 3. Crear la función corregida con GROUP BY explícito
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_stats (user_id, total_points, exact_predictions, correct_predictions, total_predictions)
    SELECT 
        p.user_id,
        COALESCE(SUM(p.points), 0),
        COUNT(*) FILTER (WHERE p.points = 3),
        COUNT(*) FILTER (WHERE p.points >= 1),
        COUNT(*)
    FROM predictions p
    WHERE p.user_id = NEW.user_id
    GROUP BY p.user_id
    ON CONFLICT (user_id) DO UPDATE SET
        total_points = EXCLUDED.total_points,
        exact_predictions = EXCLUDED.exact_predictions,
        correct_predictions = EXCLUDED.correct_predictions,
        total_predictions = EXCLUDED.total_predictions,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Recrear el trigger
CREATE TRIGGER update_stats_after_prediction
    AFTER INSERT OR UPDATE ON predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- 5. Verificar que el trigger se creó correctamente
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing
FROM information_schema.triggers
WHERE trigger_name = 'update_stats_after_prediction';

-- 6. Mensaje de confirmación
SELECT 'Trigger corregido exitosamente' as status;
