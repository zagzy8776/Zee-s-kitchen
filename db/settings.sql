CREATE TABLE IF NOT EXISTS business_settings (key TEXT PRIMARY KEY,value TEXT NOT NULL,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
INSERT INTO business_settings(key,value) VALUES ('currency','CAD'),('tax_rate','0.05'),('delivery_fee_cents','500') ON CONFLICT(key) DO NOTHING;
