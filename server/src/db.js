import * as database from './seed.js';

const categories = new Map([
  [1, 'Dinner'],
  [2, 'Lunch'],
  [3, 'Dinner'],
  [4, 'Breakfast'],
  [5, 'Lunch'],
  [6, 'Breakfast']
]);
const favorites = new Map();

function decorate(recipe) {
  return recipe ? { ...recipe, category: recipe.category || categories.get(Number(recipe.id)) || 'Other' } : recipe;
}

export async function initializeDatabase() {
  await database.initializeDatabase();
}

export async function listRecipes(filters = {}) {
  const { category, ...recipeFilters } = filters;
  const result = await database.listRecipes(recipeFilters);
  const items = result.items.map(decorate).filter((recipe) => !category || recipe.category.toLowerCase() === category.toLowerCase());
  return { ...result, items, total: items.length, totalPages: Math.max(1, Math.ceil(items.length / result.limit)) };
}

export async function getRecipeById(id) {
  return decorate(await database.getRecipeById(id));
}

export async function createRecipe(payload) {
  const recipe = await database.createRecipe(payload);
  categories.set(Number(recipe.id), payload.category || 'Other');
  return decorate(recipe);
}

export async function updateRecipe(id, updates) {
  const recipe = await database.updateRecipe(id, updates);
  if (recipe && updates.category) categories.set(Number(id), updates.category);
  return decorate(recipe);
}

export async function deleteRecipe(id) {
  categories.delete(Number(id));
  for (const ids of favorites.values()) ids.delete(Number(id));
  return database.deleteRecipe(id);
}

export function getAvailableFilters() {
  const filters = database.getAvailableFilters();
  return { ...filters, categories: [...new Set([...categories.values()])].sort() };
}

export function getFavoriteIds(userId) {
  return [...(favorites.get(userId) || new Set())];
}

export async function listFavorites(userId) {
  const ids = getFavoriteIds(userId);
  const recipes = await Promise.all(ids.map((id) => getRecipeById(id)));
  return recipes.filter(Boolean);
}

export async function toggleFavorite(userId, id) {
  const recipe = await getRecipeById(id);
  if (!recipe) return null;
  const userFavorites = favorites.get(userId) || new Set();
  const numericId = Number(id);
  const isFavorite = userFavorites.has(numericId);
  if (isFavorite) userFavorites.delete(numericId);
  else userFavorites.add(numericId);
  favorites.set(userId, userFavorites);
  return { recipe, isFavorite: !isFavorite };
}
