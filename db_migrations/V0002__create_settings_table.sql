CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO settings (key, value) VALUES ('challonge_tournament_id', NULL) ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('challonge_iframe_mode', 'false') ON CONFLICT (key) DO NOTHING;
