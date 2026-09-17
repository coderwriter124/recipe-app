CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  ingredients TEXT[] NOT NULL,
  instructions TEXT[] NOT NULL,
  cuisine VARCHAR(100),
  meal_type VARCHAR(100),
  category VARCHAR(100) DEFAULT 'Other',
  dietary_tags TEXT[],
  image_url TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Other';
CREATE TABLE IF NOT EXISTS favorites (
  user_id VARCHAR(255) NOT NULL,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);
CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes USING gin (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine ON recipes (cuisine);
CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON recipes (meal_type);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes (category);
