-- ==========================================
-- QUINIELA MUNDIAL 2026 — SCHEMA REAL CON 48 EQUIPOS
-- ==========================================

CREATE TYPE match_status AS ENUM ('upcoming', 'live', 'finished');
CREATE TYPE prediction_result AS ENUM ('home_win', 'draw', 'away_win');
CREATE TYPE league_role AS ENUM ('admin', 'member');

-- ==========================================
-- TABLE: teams (48 equipos oficiales)
-- ==========================================
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    iso_code VARCHAR(10) NOT NULL,
    flag VARCHAR(20) NOT NULL,
    group_letter CHAR(1) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLE: matches
-- ==========================================
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    group_letter CHAR(1) DEFAULT NULL,
    round_name VARCHAR(50) NOT NULL DEFAULT 'group_stage',
    status match_status NOT NULL DEFAULT 'upcoming',
    home_score INT DEFAULT NULL,
    away_score INT DEFAULT NULL,
    venue VARCHAR(100) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    match_order INT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_order ON matches(match_order);

-- ==========================================
-- TABLE: users (synced from Clerk)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLE: predictions
-- ==========================================
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    predicted_result prediction_result NOT NULL,
    home_score INT DEFAULT NULL,
    away_score INT DEFAULT NULL,
    points INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, match_id)
);

-- ==========================================
-- TABLE: leagues (private groups)
-- ==========================================
CREATE TABLE IF NOT EXISTS leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLE: league_members
-- ==========================================
CREATE TABLE IF NOT EXISTS league_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role league_role NOT NULL DEFAULT 'member',
    total_points INT NOT NULL DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(league_id, user_id)
);

-- ==========================================
-- TABLE: user_stats (materialized view cache)
-- ==========================================
CREATE TABLE IF NOT EXISTS user_stats (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_points INT NOT NULL DEFAULT 0,
    exact_predictions INT NOT NULL DEFAULT 0,
    correct_predictions INT NOT NULL DEFAULT 0,
    total_predictions INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_group ON matches(group_letter);
CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);
CREATE INDEX idx_league_members_league ON league_members(league_id);
CREATE INDEX idx_league_members_user ON league_members(user_id);
CREATE INDEX idx_league_members_points ON league_members(total_points DESC);

-- ==========================================
-- RLS (Row Level Security)
-- ==========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_public_read" ON users
    FOR SELECT USING (true);

CREATE POLICY "predictions_select_own" ON predictions
    FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "predictions_insert_own" ON predictions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "predictions_update_own" ON predictions
    FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "predictions_delete_own" ON predictions
    FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "leagues_public_read" ON leagues
    FOR SELECT USING (true);
CREATE POLICY "leagues_insert" ON leagues
    FOR INSERT WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "leagues_admin_update" ON leagues
    FOR UPDATE USING (auth.uid()::text = created_by);
CREATE POLICY "leagues_admin_delete" ON leagues
    FOR DELETE USING (auth.uid()::text = created_by);

CREATE POLICY "league_members_select" ON league_members
    FOR SELECT USING (
        auth.uid()::text = user_id OR
        EXISTS (
            SELECT 1 FROM league_members lm
            WHERE lm.league_id = league_members.league_id
            AND lm.user_id = auth.uid()::text
        )
    );
CREATE POLICY "league_members_insert_own" ON league_members
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "league_members_delete_own" ON league_members
    FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "user_stats_public_read" ON user_stats
    FOR SELECT USING (true);

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON predictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Calculate prediction points automatically
CREATE OR REPLACE FUNCTION calculate_prediction_points()
RETURNS TRIGGER AS $$
DECLARE
    match_home_score INT;
    match_away_score INT;
    pred_result prediction_result;
    actual_result prediction_result;
    points_earned INT := 0;
BEGIN
    SELECT home_score, away_score INTO match_home_score, match_away_score
    FROM matches WHERE id = NEW.match_id;
    
    IF match_home_score IS NULL OR match_away_score IS NULL THEN
        NEW.points := 0;
        RETURN NEW;
    END IF;
    
    IF NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
        IF NEW.home_score > NEW.away_score THEN pred_result := 'home_win';
        ELSIF NEW.home_score < NEW.away_score THEN pred_result := 'away_win';
        ELSE pred_result := 'draw';
        END IF;
    ELSE
        pred_result := NEW.predicted_result;
    END IF;
    
    IF match_home_score > match_away_score THEN actual_result := 'home_win';
    ELSIF match_home_score < match_away_score THEN actual_result := 'away_win';
    ELSE actual_result := 'draw';
    END IF;
    
    IF pred_result = actual_result THEN
        IF NEW.home_score = match_home_score AND NEW.away_score = match_away_score THEN
            points_earned := 3;
        ELSE
            points_earned := 1;
        END IF;
    END IF;
    
    NEW.points := points_earned;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_points BEFORE INSERT OR UPDATE ON predictions
    FOR EACH ROW EXECUTE FUNCTION calculate_prediction_points();

-- Update user stats after prediction
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

CREATE TRIGGER update_stats_after_prediction AFTER INSERT OR UPDATE ON predictions
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- ==========================================
-- SEED: 48 Teams oficiales del Mundial 2026
-- ==========================================
INSERT INTO teams (name, code, iso_code, flag, group_letter) VALUES
('México', 'MEX', 'MX', '🇲🇽', 'A'),
('Sudáfrica', 'RSA', 'ZA', '🇿🇦', 'A'),
('República de Corea', 'KOR', 'KR', '🇰🇷', 'A'),
('Chequia', 'CZE', 'CZ', '🇨🇿', 'A'),
('Canadá', 'CAN', 'CA', '🇨🇦', 'B'),
('Bosnia y Herzegovina', 'BIH', 'BA', '🇧🇦', 'B'),
('Catar', 'QAT', 'QA', '🇶🇦', 'B'),
('Suiza', 'SUI', 'CH', '🇨🇭', 'B'),
('Brasil', 'BRA', 'BR', '🇧🇷', 'C'),
('Marruecos', 'MAR', 'MA', '🇲🇦', 'C'),
('Haití', 'HAI', 'HT', '🇭🇹', 'C'),
('Escocia', 'SCO', 'GB-SCT', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'C'),
('Estados Unidos', 'USA', 'US', '🇺🇸', 'D'),
('Paraguay', 'PAR', 'PY', '🇵🇾', 'D'),
('Australia', 'AUS', 'AU', '🇦🇺', 'D'),
('Turquía', 'TUR', 'TR', '🇹🇷', 'D'),
('Alemania', 'GER', 'DE', '🇩🇪', 'E'),
('Curazao', 'CUW', 'CW', '🇨🇼', 'E'),
('Costa de Marfil', 'CIV', 'CI', '🇨🇮', 'E'),
('Ecuador', 'ECU', 'EC', '🇪🇨', 'E'),
('Países Bajos', 'NED', 'NL', '🇳🇱', 'F'),
('Japón', 'JPN', 'JP', '🇯🇵', 'F'),
('Suecia', 'SWE', 'SE', '🇸🇪', 'F'),
('Túnez', 'TUN', 'TN', '🇹🇳', 'F'),
('Bélgica', 'BEL', 'BE', '🇧🇪', 'G'),
('Egipto', 'EGY', 'EG', '🇪🇬', 'G'),
('Irán', 'IRN', 'IR', '🇮🇷', 'G'),
('Nueva Zelanda', 'NZL', 'NZ', '🇳🇿', 'G'),
('España', 'ESP', 'ES', '🇪🇸', 'H'),
('Cabo Verde', 'CPV', 'CV', '🇨🇻', 'H'),
('Arabia Saudita', 'KSA', 'SA', '🇸🇦', 'H'),
('Uruguay', 'URU', 'UY', '🇺🇾', 'H'),
('Francia', 'FRA', 'FR', '🇫🇷', 'I'),
('Senegal', 'SEN', 'SN', '🇸🇳', 'I'),
('Irak', 'IRQ', 'IQ', '🇮🇶', 'I'),
('Noruega', 'NOR', 'NO', '🇳🇴', 'I'),
('Argentina', 'ARG', 'AR', '🇦🇷', 'J'),
('Argelia', 'ALG', 'DZ', '🇩🇿', 'J'),
('Austria', 'AUT', 'AT', '🇦🇹', 'J'),
('Jordania', 'JOR', 'JO', '🇯🇴', 'J'),
('Portugal', 'POR', 'PT', '🇵🇹', 'K'),
('RD Congo', 'COD', 'CD', '🇨🇩', 'K'),
('Uzbekistán', 'UZB', 'UZ', '🇺🇿', 'K'),
('Colombia', 'COL', 'CO', '🇨🇴', 'K'),
('Inglaterra', 'ENG', 'GB-ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'L'),
('Croacia', 'CRO', 'HR', '🇭🇷', 'L'),
('Ghana', 'GHA', 'GH', '🇬🇭', 'L'),
('Panamá', 'PAN', 'PA', '🇵🇦', 'L')
ON CONFLICT (code) DO NOTHING;
