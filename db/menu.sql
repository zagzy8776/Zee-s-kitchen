CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  category TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  available BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS menu_items_available_idx ON menu_items(available, sort_order);

INSERT INTO menu_items (id,name,description,price_cents,category,image,sort_order) VALUES
('jollof-bowl','Signature Jollof Bowl','Smoky jollof rice, tender chicken and fresh sides.',1800,'Rice & Bowls','https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85',1),
('fried-rice-bowl','Fried Rice Bowl','Seasoned fried rice with tender chicken and fresh vegetables.',1800,'Rice & Bowls','https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85',2),
('chicken-box','Comfort Chicken Box','Golden chicken, seasoned rice and house-made sauce.',2100,'Chicken','https://images.unsplash.com/photo-1598514982901-ae6275a9a8b9?auto=format&fit=crop&w=900&q=85',3),
('peppered-chicken','Peppered Chicken','Juicy chicken finished with a bold pepper sauce.',1900,'Chicken','https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=900&q=85',4),
('plantain','Sweet Plantain','Golden, caramelized and made fresh.',700,'Sides','https://images.unsplash.com/photo-1603833797130-0a7e5a5c4a08?auto=format&fit=crop&w=900&q=85',5),
('weekend-special','Weekend Special','A rotating comfort-food plate made for sharing.',2400,'Specials','https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85',6)
ON CONFLICT (id) DO NOTHING;
