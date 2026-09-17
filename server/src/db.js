import * as database from './seed.js';
import { extraRecipes } from './extraRecipes.js';

const categories = new Map([[1, 'Dinner'], [2, 'Lunch'], [3, 'Dinner'], [4, 'Breakfast'], [5, 'Lunch'], [6, 'Breakfast'], ...extraRecipes.map((recipe) => [recipe.id, recipe.category])]);
const favorites = new Map();
const localExtras = new Map(extraRecipes.map((recipe) => [recipe.id, recipe]));

function decorate(recipe) {
  return recipe ? { ...recipe, category: recipe.category || categories.get(Number(recipe.id)) || 'Other' } : recipe;
}

function filterExtraRecipes(filters) {
  const { search = '', cuisine = '', mealType = '', dietary = '', category = '' } = filters;
  const term = search.trim().toLowerCase();
  return [...localExtras.values()].filter((recipe) => {
    const text = [recipe.name, recipe.description, ...recipe.ingredients].join(' ').toLowerCase();
    return (!term || text.includes(term)) && (!cuisine || recipe.cuisine.toLowerCase() === cuisine.toLowerCase()) && (!mealType || recipe.mealType.toLowerCase() === mealType.toLowerCase()) && (!category || recipe.category.toLowerCase() === category.toLowerCase()) && (!dietary || recipe.dietaryTags.includes(dietary.toLowerCase()));
  });
}

export async function initializeDatabase() { await database.initializeDatabase(); }

export async function listRecipes(filters = {}) {
  const { category, page = 1, limit = 12, ...recipeFilters } = filters;
  if (!database.pool) {
    const base = await database.listRecipes({ ...recipeFilters, page: 1, limit: 10000 });
    const combined = [...base.items.map(decorate), ...filterExtraRecipes({ ...recipeFilters, category })];
    const start = (Number(page) - 1) * Number(limit);
    return { items: combined.slice(start, start + Number(limit)), page: Number(page), limit: Number(limit), total: combined.length, totalPages: Math.max(1, Math.ceil(combined.length / Number(limit))) };
  }
  const result = await database.listRecipes({ ...recipeFilters, page, limit });
  const items = result.items.map(decorate).filter((recipe) => !category || recipe.category.toLowerCase() === category.toLowerCase());
  return { ...result, items, total: items.length, totalPages: Math.max(1, Math.ceil(items.length / result.limit)) };
}

export async function getRecipeById(id) { return decorate(localExtras.get(Number(id)) || await database.getRecipeById(id)); }
export async function createRecipe(payload) { const recipe = await database.createRecipe(payload); categories.set(Number(recipe.id), payload.category || 'Other'); return decorate(recipe); }
export async function updateRecipe(id, updates) { if (localExtras.has(Number(id))) { const updated = { ...localExtras.get(Number(id)), ...updates }; localExtras.set(Number(id), updated); return decorate(updated); } const recipe = await database.updateRecipe(id, updates); if (recipe && updates.category) categories.set(Number(id), updates.category); return decorate(recipe); }
export async function deleteRecipe(id) { if (localExtras.delete(Number(id))) return true; categories.delete(Number(id)); for (const ids of favorites.values()) ids.delete(Number(id)); return database.deleteRecipe(id); }
export function getAvailableFilters() { const filters = database.getAvailableFilters(); return { ...filters, cuisines: [...new Set([...filters.cuisines, ...extraRecipes.map((r) => r.cuisine)])].sort(), categories: [...new Set([...categories.values()])].sort() }; }
export function getFavoriteIds(userId) { return [...(favorites.get(userId) || new Set())]; }
export async function listFavorites(userId) { return (await Promise.all(getFavoriteIds(userId).map((id) => getRecipeById(id)))).filter(Boolean); }
export async function toggleFavorite(userId, id) { const recipe = await getRecipeById(id); if (!recipe) return null; const set = favorites.get(userId) || new Set(); const numericId = Number(id); const isFavorite = set.has(numericId); isFavorite ? set.delete(numericId) : set.add(numericId); favorites.set(userId, set); return { recipe, isFavorite: !isFavorite }; }

export async function recommendRecipes({ ingredients = '', cuisine = '', dietary = '', mealType = '' } = {}) {
  const result = await listRecipes({ search: ingredients, cuisine, dietary, mealType, page: 1, limit: 100 });
  const terms = ingredients.toLowerCase().split(',').map((term) => term.trim()).filter(Boolean);
  return result.items.map((recipe) => ({ recipe, score: terms.reduce((score, term) => score + recipe.ingredients.some((item) => item.toLowerCase().includes(term)) ? 3 : 0, 0) + (cuisine && recipe.cuisine.toLowerCase() === cuisine.toLowerCase() ? 2 : 0) + (dietary && recipe.dietaryTags.includes(dietary) ? 2 : 0) })).sort((a, b) => b.score - a.score).slice(0, 5).map(({ recipe }) => recipe);
}
