import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

export const seedRecipes = [
  {
    id: 1,
    name: 'Spicy Coconut Chickpea Curry',
    description: 'A rich and warming curry packed with chickpeas, spinach, and aromatic spices.',
    ingredients: ['chickpeas', 'coconut milk', 'onion', 'garlic', 'ginger', 'spinach', 'curry powder', 'salt'],
    instructions: [
      'Sauté onion, garlic, and ginger until fragrant.',
      'Add curry powder and cook for 30 seconds.',
      'Stir in coconut milk and chickpeas, then simmer for 10 minutes.',
      'Fold in spinach and season to taste before serving.'
    ],
    cuisine: 'Indian',
    mealType: 'dinner',
    dietaryTags: ['vegetarian', 'high-protein'],
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
    prepTime: 15,
    cookTime: 25,
    servings: 4
  },
  {
    id: 2,
    name: 'Lemon Herb Salmon Bowl',
    description: 'Fresh salmon, fluffy rice, and crunchy vegetables with a bright citrus dressing.',
    ingredients: ['salmon', 'rice', 'cucumber', 'avocado', 'lemon', 'parsley', 'olive oil'],
    instructions: [
      'Roast or pan-sear salmon until flaky.',
      'Prepare rice and arrange into bowls.',
      'Top with cucumber, avocado, and salmon.',
      'Finish with lemon-herb dressing and parsley.'
    ],
    cuisine: 'Mediterranean',
    mealType: 'lunch',
    dietaryTags: ['gluten-free', 'high-protein'],
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80',
    prepTime: 20,
    cookTime: 15,
    servings: 2
  },
  {
    id: 3,
    name: 'Garden Veggie Pasta Primavera',
    description: 'A colorful pasta loaded with seasonal vegetables and a light garlic olive oil sauce.',
    ingredients: ['pasta', 'zucchini', 'bell pepper', 'peas', 'garlic', 'olive oil', 'parmesan'],
    instructions: [
      'Cook pasta according to package directions.',
      'Sauté vegetables and garlic in olive oil.',
      'Combine with pasta and toss with parmesan.',
      'Serve immediately with black pepper.'
    ],
    cuisine: 'Italian',
    mealType: 'dinner',
    dietaryTags: ['vegetarian'],
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80',
    prepTime: 15,
    cookTime: 20,
    servings: 4
  },
  {
    id: 4,
    name: 'Greek Yogurt Berry Parfait',
    description: 'A quick breakfast or snack layered with yogurt, berries, granola, and honey.',
    ingredients: ['greek yogurt', 'mixed berries', 'granola', 'honey', 'almonds'],
    instructions: [
      'Add yogurt to a glass or bowl.',
      'Layer with berries and granola.',
      'Repeat the layers until full.',
      'Top with honey and almonds before serving.'
    ],
    cuisine: 'Greek',
    mealType: 'breakfast',
    dietaryTags: ['vegetarian', 'high-protein'],
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80',
    prepTime: 10,
    cookTime: 0,
    servings: 2
  },
  {
    id: 5,
    name: 'Crispy Tofu Buddha Bowl',
    description: 'Crispy tofu, quinoa, and colorful vegetables with a savory sesame dressing.',
    ingredients: ['tofu', 'quinoa', 'spinach', 'carrot', 'edamame', 'sesame', 'soy sauce'],
    instructions: [
      'Crisp tofu in a hot skillet until golden.',
      'Cook quinoa and prep the vegetables.',
      'Assemble bowls with quinoa, veggies, and tofu.',
      'Drizzle with sesame-soy dressing and serve.'
    ],
    cuisine: 'Asian',
    mealType: 'lunch',
    dietaryTags: ['vegan', 'gluten-free'],
    imageUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=900&q=80',
    prepTime: 20,
    cookTime: 20,
    servings: 2
  },
  {
    id: 6,
    name: 'Chocolate Banana Oat Pancakes',
    description: 'Fluffy pancakes with banana flavor, cocoa, and a wholesome oat base.',
    ingredients: ['oats', 'banana', 'eggs', 'cocoa powder', 'milk', 'vanilla'],
    instructions: [
      'Blend oats into a flour-like texture.',
      'Mix with banana, eggs, milk, and cocoa.',
      'Cook pancakes on a lightly greased pan.',
      'Serve warm with fruit or yogurt.'
    ],
    cuisine: 'American',
    mealType: 'breakfast',
    dietaryTags: ['vegetarian'],
    imageUrl: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=80',
    prepTime: 10,
    cookTime: 15,
    servings: 3
  }
];

const databaseUrl = process.env.DATABASE_URL;
export let pool = null;

export function getDatabaseMode() {
  return databaseUrl ? 'postgres' : 'memory';
}

export async function initializeDatabase() {
  if (!databaseUrl) {
    return;
  }

  try {
    pool = new pg.Pool({ connectionString: databaseUrl });
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        ingredients TEXT[] NOT NULL,
        instructions TEXT[] NOT NULL,
        cuisine VARCHAR(100),
        meal_type VARCHAR(100),
        dietary_tags TEXT[],
        image_url TEXT,
        prep_time INTEGER,
        cook_time INTEGER,
        servings INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const result = await pool.query('SELECT COUNT(*) FROM recipes');
    if (Number(result.rows[0].count) === 0) {
      const insertValues = seedRecipes.map((recipe) => [
        recipe.name,
        recipe.description,
        recipe.ingredients,
        recipe.instructions,
        recipe.cuisine,
        recipe.mealType,
        recipe.dietaryTags,
        recipe.imageUrl,
        recipe.prepTime,
        recipe.cookTime,
        recipe.servings
      ]);

      for (const values of insertValues) {
        await pool.query(
          `INSERT INTO recipes (name, description, ingredients, instructions, cuisine, meal_type, dietary_tags, image_url, prep_time, cook_time, servings)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          values
        );
      }
    }
  } catch (error) {
    console.warn('PostgreSQL not available, falling back to in-memory storage.');
    pool = null;
  }
}

function normalizeRecipe(recipe) {
  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description || '',
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    cuisine: recipe.cuisine || 'Unknown',
    mealType: recipe.meal_type || recipe.mealType || 'dinner',
    dietaryTags: recipe.dietary_tags || recipe.dietaryTags || [],
    imageUrl: recipe.image_url || recipe.imageUrl || '',
    prepTime: recipe.prep_time ?? recipe.prepTime ?? 0,
    cookTime: recipe.cook_time ?? recipe.cookTime ?? 0,
    servings: recipe.servings ?? 2
  };
}

function applyFilters(items, { search, cuisine, mealType, dietary }) {
  const normalizedSearch = search?.trim().toLowerCase() || '';
  const normalizedCuisine = cuisine?.trim();
  const normalizedMealType = mealType?.trim();
  const normalizedDietary = dietary?.trim();

  return items.filter((recipe) => {
    const matchesSearch =
      !normalizedSearch ||
      recipe.name.toLowerCase().includes(normalizedSearch) ||
      recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(normalizedSearch)) ||
      recipe.description.toLowerCase().includes(normalizedSearch);

    const matchesCuisine = !normalizedCuisine || recipe.cuisine === normalizedCuisine;
    const matchesMealType = !normalizedMealType || recipe.mealType === normalizedMealType;
    const matchesDietary = !normalizedDietary || (recipe.dietaryTags || []).includes(normalizedDietary);

    return matchesSearch && matchesCuisine && matchesMealType && matchesDietary;
  });
}

const memoryRecipes = seedRecipes.map((recipe) => ({ ...recipe, mealType: recipe.mealType || 'dinner' }));

export async function listRecipes(filters = {}) {
  const { search, cuisine, mealType, dietary, page = 1, limit = 12 } = filters;

  if (pool) {
    try {
      let query = 'SELECT * FROM recipes';
      const values = [];
      const conditions = [];

      if (search) {
        conditions.push('(LOWER(name) LIKE $1 OR LOWER(description) LIKE $1 OR EXISTS (SELECT 1 FROM unnest(ingredients) AS ingredient WHERE LOWER(ingredient) LIKE $1))');
        values.push(`%${search.toLowerCase()}%`);
      }

      if (cuisine) {
        conditions.push('LOWER(cuisine) = LOWER($' + (values.length + 1) + ')');
        values.push(cuisine);
      }

      if (mealType) {
        conditions.push('LOWER(meal_type) = LOWER($' + (values.length + 1) + ')');
        values.push(mealType);
      }

      if (dietary) {
        conditions.push('EXISTS (SELECT 1 FROM unnest(dietary_tags) AS tag WHERE LOWER(tag) = LOWER($' + (values.length + 1) + '))');
        values.push(dietary);
      }

      if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY id DESC';
      query += ' LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
      values.push(Number(limit), (Number(page) - 1) * Number(limit));

      const result = await pool.query(query, values);
      const rows = result.rows.map(normalizeRecipe);

      return {
        items: rows,
        page: Number(page),
        limit: Number(limit),
        total: rows.length,
        totalPages: Math.max(1, Math.ceil(rows.length / Number(limit)))
      };
    } catch (error) {
      console.error('PostgreSQL query failed, falling back to memory store.', error);
    }
  }

  const filtered = applyFilters(memoryRecipes, { search, cuisine, mealType, dietary });
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);

  return {
    items: filtered.slice(startIndex, endIndex),
    page: Number(page),
    limit: Number(limit),
    total: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / Number(limit)))
  };
}

export async function getRecipeById(id) {
  if (pool) {
    try {
      const result = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);
      if (!result.rows[0]) return null;
      return normalizeRecipe(result.rows[0]);
    } catch {
      // fallback to memory store below
    }
  }

  return memoryRecipes.find((recipe) => Number(recipe.id) === Number(id)) || null;
}

export async function createRecipe(payload) {
  const nextId = Math.max(...memoryRecipes.map((recipe) => Number(recipe.id))) + 1;
  const recipe = {
    id: nextId,
    name: payload.name,
    description: payload.description || '',
    ingredients: payload.ingredients || [],
    instructions: payload.instructions || [],
    cuisine: payload.cuisine || 'Unknown',
    mealType: payload.mealType || 'dinner',
    dietaryTags: payload.dietaryTags || [],
    imageUrl: payload.imageUrl || '',
    prepTime: payload.prepTime || 0,
    cookTime: payload.cookTime || 0,
    servings: payload.servings || 2
  };

  if (pool) {
    try {
      const result = await pool.query(
        `INSERT INTO recipes (name, description, ingredients, instructions, cuisine, meal_type, dietary_tags, image_url, prep_time, cook_time, servings)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          recipe.name,
          recipe.description,
          recipe.ingredients,
          recipe.instructions,
          recipe.cuisine,
          recipe.mealType,
          recipe.dietaryTags,
          recipe.imageUrl,
          recipe.prepTime,
          recipe.cookTime,
          recipe.servings
        ]
      );

      return normalizeRecipe(result.rows[0]);
    } catch (error) {
      console.error('Unable to write recipe to PostgreSQL. Falling back to memory.', error);
    }
  }

  memoryRecipes.unshift(recipe);
  return recipe;
}

export async function updateRecipe(id, updates) {
  if (pool) {
    try {
      const existing = await getRecipeById(id);
      if (!existing) return null;

      const nextRecipe = {
        ...existing,
        ...updates,
        mealType: updates.mealType || existing.mealType,
        dietaryTags: updates.dietaryTags || existing.dietaryTags,
        ingredients: updates.ingredients || existing.ingredients,
        instructions: updates.instructions || existing.instructions
      };

      const result = await pool.query(
        `UPDATE recipes
        SET name = $1,
            description = $2,
            ingredients = $3,
            instructions = $4,
            cuisine = $5,
            meal_type = $6,
            dietary_tags = $7,
            image_url = $8,
            prep_time = $9,
            cook_time = $10,
            servings = $11,
            updated_at = NOW()
        WHERE id = $12
        RETURNING *`,
        [
          nextRecipe.name,
          nextRecipe.description,
          nextRecipe.ingredients,
          nextRecipe.instructions,
          nextRecipe.cuisine,
          nextRecipe.mealType,
          nextRecipe.dietaryTags,
          nextRecipe.imageUrl,
          nextRecipe.prepTime,
          nextRecipe.cookTime,
          nextRecipe.servings,
          id
        ]
      );

      return normalizeRecipe(result.rows[0]);
    } catch (error) {
      console.error('Unable to update recipe in PostgreSQL. Falling back to memory.', error);
    }
  }

  const index = memoryRecipes.findIndex((recipe) => Number(recipe.id) === Number(id));
  if (index === -1) return null;

  memoryRecipes[index] = {
    ...memoryRecipes[index],
    ...updates,
    mealType: updates.mealType || memoryRecipes[index].mealType,
    dietaryTags: updates.dietaryTags || memoryRecipes[index].dietaryTags,
    ingredients: updates.ingredients || memoryRecipes[index].ingredients,
    instructions: updates.instructions || memoryRecipes[index].instructions
  };

  return memoryRecipes[index];
}

export async function deleteRecipe(id) {
  if (pool) {
    try {
      const result = await pool.query('DELETE FROM recipes WHERE id = $1 RETURNING *', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Unable to delete recipe in PostgreSQL. Falling back to memory.', error);
    }
  }

  const index = memoryRecipes.findIndex((recipe) => Number(recipe.id) === Number(id));
  if (index === -1) return false;
  memoryRecipes.splice(index, 1);
  return true;
}

export function getAvailableFilters() {
  const allRecipes = memoryRecipes;

  return {
    cuisines: [...new Set(allRecipes.map((recipe) => recipe.cuisine))].sort(),
    mealTypes: [...new Set(allRecipes.map((recipe) => recipe.mealType))].sort(),
    dietaryTags: [...new Set(allRecipes.flatMap((recipe) => recipe.dietaryTags || []))].sort()
  };
}
