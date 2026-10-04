CREATE TABLE IF NOT EXISTS business_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO business_settings(key,value) VALUES
  ('currency','CAD'),
  ('tax_rate','0.05'),
  ('delivery_fee_cents','500'),
  ('lead_hours','24'),
  ('min_delivery_order_cents','3500'),
  ('payment_note','Payment is arranged after we confirm your order. We accept Interac e-Transfer. Details are sent when Zee confirms.'),
  ('etransfer_email',''),
  ('pickup_note','Pickup location is confirmed by WhatsApp when your order is accepted.'),
  ('delivery_cities','Winnipeg')
ON CONFLICT(key) DO NOTHING;
