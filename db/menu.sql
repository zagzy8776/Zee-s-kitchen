CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  category TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  available BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  allergens TEXT NOT NULL DEFAULT '',
  spice_level TEXT NOT NULL DEFAULT 'mild',
  serves TEXT NOT NULL DEFAULT '',
  prep_hours INTEGER NOT NULL DEFAULT 24,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS allergens TEXT NOT NULL DEFAULT '';
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS spice_level TEXT NOT NULL DEFAULT 'mild';
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS serves TEXT NOT NULL DEFAULT '';
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS prep_hours INTEGER NOT NULL DEFAULT 24;

CREATE INDEX IF NOT EXISTS menu_items_available_idx ON menu_items(available, sort_order);

INSERT INTO menu_items (id,name,description,price_cents,category,image,sort_order,allergens,spice_level,serves,prep_hours) VALUES
('jollof-bowl','Signature Jollof Bowl','Smoky party-style jollof rice with tender chicken and fresh sides.',1800,'Rice & Bowls','https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85',1,'May contain gluten, soy','medium','Feeds 1–2',24),
('fried-rice-bowl','Fried Rice Bowl','Seasoned fried rice with chicken and vegetables.',1800,'Rice & Bowls','https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85',2,'May contain soy, egg','mild','Feeds 1–2',24),
('chicken-box','Comfort Chicken Box','Golden chicken, seasoned rice and house sauce.',2100,'Chicken','https://images.unsplash.com/photo-1598514982901-ae6275a9a8b9?auto=format&fit=crop&w=900&q=85',3,'May contain gluten, soy','mild','Feeds 1–2',24),
('peppered-chicken','Peppered Chicken','Juicy chicken finished in a bold pepper sauce.',1900,'Chicken','https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=900&q=85',4,'May contain soy','hot','Feeds 1–2',24),
('plantain','Sweet Plantain','Golden caramelized plantain, made fresh.',700,'Sides','https://images.unsplash.com/photo-1603833797130-0a7e5a5c4a08?auto=format&fit=crop&w=900&q=85',5,'','mild','Side for 1–2',24),
('weekend-special','Weekend Special','Rotating comfort plate made for sharing.',2400,'Specials','https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85',6,'Ask about allergens','medium','Feeds 2–3',48)
ON CONFLICT (id) DO NOTHING;
