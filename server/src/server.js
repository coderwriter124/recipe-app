import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, listRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, getAvailableFilters } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req, res) => {
  res.json({ status: 'ok', message: 'Recipe API is running' });
});

app.get('/api/recipes', async (req, res) => {
  try {
    const { search, cuisine, mealType, dietary, page = 1, limit = 12 } = req.query;
    const result = await listRecipes({
      search: search || '',
      cuisine: cuisine || '',
      mealType: mealType || '',
      dietary: dietary || '',
      page: Number(page),
      limit: Number(limit)
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Failed to fetch recipes.' });
  }
});

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    return res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    return res.status(500).json({ message: 'Failed to fetch recipe details.' });
  }
});

app.get('/api/filters', async (_req, res) => {
  try {
    res.json(getAvailableFilters());
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ message: 'Failed to fetch filter options.' });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.name || !Array.isArray(payload.ingredients) || !Array.isArray(payload.instructions)) {
      return res.status(400).json({ message: 'Recipe name, ingredients, and instructions are required.' });
    }

    const recipe = await createRecipe(payload);
    return res.status(201).json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    return res.status(500).json({ message: 'Failed to create recipe.' });
  }
});

app.put('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await updateRecipe(req.params.id, req.body);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    return res.json(recipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    return res.status(500).json({ message: 'Failed to update recipe.' });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const deleted = await deleteRecipe(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    return res.json({ message: 'Recipe deleted successfully.' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return res.status(500).json({ message: 'Failed to delete recipe.' });
  }
});

async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Recipe API running on http://localhost:${PORT}`);
  });
}

startServer();
