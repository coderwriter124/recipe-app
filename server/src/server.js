import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, listRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, getAvailableFilters, getFavoriteIds, listFavorites, toggleFavorite, recommendRecipes } from './db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const userId = (req) => req.header('x-user-id') || 'anonymous';
app.use(cors()); app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', message: 'Recipe API is running' }));
app.get('/api/recipes', async (req, res) => { try { const { search = '', cuisine = '', mealType = '', dietary = '', category = '', page = 1, limit = 12 } = req.query; res.json(await listRecipes({ search, cuisine, mealType, dietary, category, page: Number(page), limit: Number(limit) })); } catch (error) { console.error(error); res.status(500).json({ message: 'Failed to fetch recipes.' }); } });
app.get('/api/recipes/:id', async (req, res) => { try { const recipe = await getRecipeById(req.params.id); return recipe ? res.json(recipe) : res.status(404).json({ message: 'Recipe not found.' }); } catch (error) { console.error(error); return res.status(500).json({ message: 'Failed to fetch recipe details.' }); } });
app.get('/api/filters', (_req, res) => res.json(getAvailableFilters()));
app.get('/api/recommendations', async (req, res) => { try { const recipes = await recommendRecipes(req.query); res.json({ recipes, message: recipes.length ? 'Here are some tasty matches!' : 'Try adding an ingredient or choosing a cuisine.' }); } catch (error) { console.error(error); res.status(500).json({ message: 'Failed to recommend recipes.' }); } });
app.get('/api/favorites', async (req, res) => res.json({ items: await listFavorites(userId(req)), ids: getFavoriteIds(userId(req)) }));
app.post('/api/favorites/:id/toggle', async (req, res) => { const result = await toggleFavorite(userId(req), req.params.id); return result ? res.json(result) : res.status(404).json({ message: 'Recipe not found.' }); });
app.post('/api/recipes', async (req, res) => { try { const payload = req.body; if (!payload.name || !Array.isArray(payload.ingredients) || !Array.isArray(payload.instructions)) return res.status(400).json({ message: 'Recipe name, ingredients, and instructions are required.' }); return res.status(201).json(await createRecipe(payload)); } catch (error) { console.error(error); return res.status(500).json({ message: 'Failed to create recipe.' }); } });
app.put('/api/recipes/:id', async (req, res) => { try { const recipe = await updateRecipe(req.params.id, req.body); return recipe ? res.json(recipe) : res.status(404).json({ message: 'Recipe not found.' }); } catch (error) { console.error(error); return res.status(500).json({ message: 'Failed to update recipe.' }); } });
app.delete('/api/recipes/:id', async (req, res) => { try { return (await deleteRecipe(req.params.id)) ? res.json({ message: 'Recipe deleted successfully.' }) : res.status(404).json({ message: 'Recipe not found.' }); } catch (error) { console.error(error); return res.status(500).json({ message: 'Failed to delete recipe.' }); } });
async function startServer() { await initializeDatabase(); app.listen(PORT, () => console.log(`Recipe API running on http://localhost:${PORT}`)); }
startServer();
