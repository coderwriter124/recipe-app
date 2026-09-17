import { useEffect, useState } from 'react';

const emptyRecipe = {
  name: '', description: '', ingredients: '', instructions: '', cuisine: '',
  category: 'Dinner', mealType: 'dinner', dietaryTags: '', imageUrl: '',
  prepTime: 15, cookTime: 20, servings: 2
};

const userId = localStorage.getItem('recipe-user-id') || crypto.randomUUID();
localStorage.setItem('recipe-user-id', userId);
const defaultImage = 'https://images.unsplash.com/photo-1495521821757-a1efb90b62d6?auto=format&fit=crop&w=900&q=80';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [selectedDietary, setSelectedDietary] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filters, setFilters] = useState({ cuisines: [], mealTypes: [], dietaryTags: [], categories: [] });
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [form, setForm] = useState(emptyRecipe);
  const [editingId, setEditingId] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const headers = { 'x-user-id': userId };

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, cuisine: selectedCuisine, mealType: selectedMealType, dietary: selectedDietary, category: selectedCategory });
      const response = await fetch(`/api/recipes?${query}`);
      const data = await response.json();
      setRecipes(data.items || []);
    } catch (error) {
      console.error('Could not load recipes', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    const response = await fetch('/api/filters');
    if (response.ok) setFilters(await response.json());
  };

  const fetchFavorites = async () => {
    const response = await fetch('/api/favorites', { headers });
    if (response.ok) setFavoriteIds((await response.json()).ids || []);
  };

  useEffect(() => { fetchRecipes(); }, [search, selectedCuisine, selectedMealType, selectedDietary, selectedCategory]);
  useEffect(() => { fetchFilters(); fetchFavorites(); }, []);

  const visibleRecipes = showFavorites ? recipes.filter((recipe) => favoriteIds.includes(Number(recipe.id))) : recipes;

  const googleSearch = (recipe) => {
    const query = encodeURIComponent(`${recipe.name} recipe ${recipe.cuisine || ''}`.trim());
    window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
  };

  const toggleFavorite = async (id) => {
    const response = await fetch(`/api/favorites/${id}/toggle`, { method: 'POST', headers });
    if (!response.ok) return;
    const data = await response.json();
    setFavoriteIds((ids) => data.isFavorite ? [...new Set([...ids, Number(id)])] : ids.filter((value) => value !== Number(id)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      ingredients: form.ingredients.split(',').map((item) => item.trim()).filter(Boolean),
      instructions: form.instructions.split('\n').map((item) => item.trim()).filter(Boolean),
      dietaryTags: form.dietaryTags.split(',').map((item) => item.trim()).filter(Boolean),
      imageUrl: form.imageUrl || defaultImage
    };
    const response = await fetch(`/api/recipes${editingId ? `/${editingId}` : ''}`, {
      method: editingId ? 'PUT' : 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      setForm(emptyRecipe); setEditingId(null); await fetchRecipes(); await fetchFilters();
    }
  };

  const handleEdit = (recipe) => {
    setSelectedRecipe(null);
    setEditingId(recipe.id);
    setForm({ ...recipe, ingredients: recipe.ingredients.join(', '), instructions: recipe.instructions.join('\n'), dietaryTags: (recipe.dietaryTags || []).join(', ') });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recipe?')) return;
    await fetch(`/api/recipes/${id}`, { method: 'DELETE', headers });
    setSelectedRecipe(null); await fetchRecipes(); await fetchFavorites();
  };

  const resetFilters = () => { setSearch(''); setSelectedCuisine(''); setSelectedMealType(''); setSelectedDietary(''); setSelectedCategory(''); };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div><p className="eyebrow">Healthy & tasty</p><h1>Recipe Finder</h1><p className="subtitle">Search, discover, and cook something great.</p></div>
        <div className="top-actions">
          <button className={`secondary-button ${showFavorites ? 'active' : ''}`} onClick={() => setShowFavorites(!showFavorites)}>♥ Favorites ({favoriteIds.length})</button>
          <button className="primary-button" onClick={() => { setEditingId(null); setForm(emptyRecipe); }}>＋ New Recipe</button>
        </div>
      </header>

      <section className="controls panel">
        <div className="search-box"><label htmlFor="search">Find a recipe</label><div className="search-row"><input id="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try chicken, pasta, curry..." /><button className="google-button" onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(`${search} recipe`)}`, '_blank', 'noopener,noreferrer')} disabled={!search.trim()}>Search Google</button></div></div>
        <div className="filters-grid">
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}><option value="">Category</option>{filters.categories.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={selectedCuisine} onChange={(event) => setSelectedCuisine(event.target.value)}><option value="">Cuisine</option>{filters.cuisines.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={selectedMealType} onChange={(event) => setSelectedMealType(event.target.value)}><option value="">Meal type</option>{filters.mealTypes.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={selectedDietary} onChange={(event) => setSelectedDietary(event.target.value)}><option value="">Dietary</option>{filters.dietaryTags.map((item) => <option key={item}>{item}</option>)}</select>
          <button className="secondary-button" onClick={resetFilters}>Reset</button>
        </div>
      </section>

      <main className="content-grid">
        <section className="recipes-panel">
          <div className="section-head"><div><h2>{showFavorites ? 'Favorite Recipes' : 'Recipes'}</h2><p className="hint">Click any recipe card to see full ingredients and instructions.</p></div><span>{visibleRecipes.length} found</span></div>
          {loading ? <p>Loading recipes...</p> : visibleRecipes.length === 0 ? <p className="empty-state">{showFavorites ? 'No favorites yet.' : 'No recipes match your search.'}</p> : <div className="recipe-grid">
            {visibleRecipes.map((recipe) => <article key={recipe.id} className="recipe-card" onClick={() => setSelectedRecipe(recipe)} tabIndex="0" onKeyDown={(event) => { if (event.key === 'Enter') setSelectedRecipe(recipe); }}>
              <img src={recipe.imageUrl || defaultImage} alt={recipe.name} /><div className="recipe-body"><div className="chip-row"><span className="chip">{recipe.category}</span><span className="chip">{recipe.cuisine}</span><span className="chip">{recipe.mealType}</span></div><h3>{recipe.name}</h3><p>{recipe.description}</p><p className="card-meta">⏱ {Number(recipe.prepTime || 0) + Number(recipe.cookTime || 0)} min · 👥 {recipe.servings || 2} servings</p><button className="view-link" onClick={(event) => { event.stopPropagation(); setSelectedRecipe(recipe); }}>View recipe →</button><div className="recipe-actions"><button className={`small-button favorite ${favoriteIds.includes(Number(recipe.id)) ? 'saved' : ''}`} onClick={(event) => { event.stopPropagation(); toggleFavorite(recipe.id); }}>{favoriteIds.includes(Number(recipe.id)) ? '♥ Saved' : '♡ Save'}</button><button className="small-button" onClick={(event) => { event.stopPropagation(); handleEdit(recipe); }}>Edit</button><button className="small-button danger" onClick={(event) => { event.stopPropagation(); handleDelete(recipe.id); }}>Delete</button></div></div>
            </article>)}
          </div>}
        </section>

        <aside className="form-panel panel"><h2>{editingId ? 'Edit recipe' : 'Add a recipe'}</h2><form onSubmit={handleSubmit} className="recipe-form"><label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="3" /></label><label>Ingredients (comma separated)<textarea value={form.ingredients} onChange={(event) => setForm({ ...form, ingredients: event.target.value })} rows="3" required /></label><label>Instructions (one step per line)<textarea value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} rows="4" required /></label><div className="two-column"><label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Other'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Cuisine<input value={form.cuisine} onChange={(event) => setForm({ ...form, cuisine: event.target.value })} /></label></div><div className="two-column"><label>Meal Type<select value={form.mealType} onChange={(event) => setForm({ ...form, mealType: event.target.value })}><option>breakfast</option><option>lunch</option><option>dinner</option><option>dessert</option></select></label><label>Dietary Tags<input value={form.dietaryTags} onChange={(event) => setForm({ ...form, dietaryTags: event.target.value })} /></label></div><div className="two-column"><label>Prep Time<input type="number" min="0" value={form.prepTime} onChange={(event) => setForm({ ...form, prepTime: Number(event.target.value) })} /></label><label>Cook Time<input type="number" min="0" value={form.cookTime} onChange={(event) => setForm({ ...form, cookTime: Number(event.target.value) })} /></label></div><label>Image URL<input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} /></label><div className="form-actions"><button className="primary-button">{editingId ? 'Save Changes' : 'Add Recipe'}</button>{editingId && <button type="button" className="secondary-button" onClick={() => { setEditingId(null); setForm(emptyRecipe); }}>Cancel</button>}</div></form></aside>
      </main>

      {selectedRecipe && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedRecipe(null)}><article className="recipe-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-title" onClick={(event) => event.stopPropagation()}><button className="close-button" onClick={() => setSelectedRecipe(null)} aria-label="Close">×</button><img className="modal-image" src={selectedRecipe.imageUrl || defaultImage} alt={selectedRecipe.name} /><div className="modal-content"><div className="chip-row"><span className="chip">{selectedRecipe.category}</span><span className="chip">{selectedRecipe.cuisine}</span></div><h2 id="recipe-title">{selectedRecipe.name}</h2><p>{selectedRecipe.description}</p><div className="recipe-stats"><span>Prep: {selectedRecipe.prepTime || 0} min</span><span>Cook: {selectedRecipe.cookTime || 0} min</span><span>Serves: {selectedRecipe.servings || 2}</span></div><h3>Ingredients</h3><ul className="detail-list">{selectedRecipe.ingredients.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul><h3>Instructions</h3><ol className="instructions-list">{selectedRecipe.instructions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ol><div className="modal-actions"><button className="google-button" onClick={() => googleSearch(selectedRecipe)}>Find similar recipes on Google</button><button className={`small-button favorite ${favoriteIds.includes(Number(selectedRecipe.id)) ? 'saved' : ''}`} onClick={() => toggleFavorite(selectedRecipe.id)}>{favoriteIds.includes(Number(selectedRecipe.id)) ? '♥ Saved' : '♡ Save favorite'}</button></div></div></article></div>}
    </div>
  );
}

export default App;
