CREATE TABLE IF NOT EXISTS menu_item_options (
  id TEXT PRIMARY KEY,
  menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  option_type TEXT NOT NULL DEFAULT 'choice' CHECK (option_type IN ('choice','quantity')),
  required BOOLEAN NOT NULL DEFAULT FALSE,
  min_quantity INTEGER NOT NULL DEFAULT 0 CHECK (min_quantity >= 0),
  max_quantity INTEGER NOT NULL DEFAULT 1 CHECK (max_quantity >= min_quantity),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS menu_item_option_values (
  id TEXT PRIMARY KEY,
  option_id TEXT NOT NULL REFERENCES menu_item_options(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  price_delta_cents INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS menu_item_options_item_idx ON menu_item_options(menu_item_id, sort_order);
CREATE INDEX IF NOT EXISTS menu_item_option_values_option_idx ON menu_item_option_values(option_id, sort_order);
