-- Tournament teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournament matches table
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    round VARCHAR(50) NOT NULL,
    match_number INTEGER NOT NULL,
    team1_id INTEGER REFERENCES teams(id),
    team2_id INTEGER REFERENCES teams(id),
    team1_score INTEGER DEFAULT 0,
    team2_score INTEGER DEFAULT 0,
    winner_id INTEGER REFERENCES teams(id),
    status VARCHAR(20) DEFAULT 'pending',
    played_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample teams for tournament
INSERT INTO teams (name, logo_url) VALUES
('Team Alpha', NULL),
('Team Bravo', NULL),
('Team Charlie', NULL),
('Team Delta', NULL),
('Team Echo', NULL),
('Team Foxtrot', NULL),
('Team Golf', NULL),
('Team Hotel', NULL)
ON CONFLICT DO NOTHING;
