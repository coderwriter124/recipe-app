import { useEffect, useState } from 'react';

const emptyRecipe = {
  name: '',
  description: '',
  ingredients: '',
  instructions: '',
  cuisine: '',
  mealType: 'dinner',
  dietaryTags: '',
  imageUrl: '',
  prepTime: 15,
  cookTime: 20,
  servings: 2
};

function App() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [selectedDietary, setSelectedDietary] = useState('');
  const [filters, setFilters] = useState({ cuisines: [], mealTypes: [], dietaryTags: [] });
  const [form, setForm] = useState(emptyRecipe);
  const [editingId, setEditingId] = useState(null);

  const fetchRecipes = async () => {
    try {
      const query = new URLSearchParams({
        search,
        cuisine: selectedCuisine,
        mealType: selectedMealType,
        dietary: selectedDietary
      }).toString();

      const response = await fetch(`/api/recipes?${query}`);
      const data = await response.json();
      setRecipes(data.items || []);
      setFilteredRecipes(data.items || []);
    } catch (error) {
      console.error('Failed to fetch recipes', error);
      setRecipes([]);
      setFilteredRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/filters');
      const data = await response.json();
      setFilters(data);
    } catch (error) {
      console.error('Failed to load filters', error);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [search, selectedCuisine, selectedMealType, selectedDietary]);

  useEffect(() => {
    fetchFilters();
    fetchRecipes();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      ingredients: form.ingredients
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      instructions: form.instructions
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      dietaryTags: form.dietaryTags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      imageUrl: form.imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb90b62d6?auto=format&fit=crop&w=900&q=80'
    };

    const requestOptions = {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    };

    const response = await fetch(`/api/recipes${editingId ? `/${editingId}` : ''}`, requestOptions);
    if (response.ok) {
      setForm(emptyRecipe);
      setEditingId(null);
      fetchRecipes();
      fetchFilters();
    }
  };

  const handleEdit = (recipe) => {
    setEditingId(recipe.id);
    setForm({
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients.join(', '),
      instructions: recipe.instructions.join('\n'),
      cuisine: recipe.cuisine,
      mealType: recipe.mealType,
      dietaryTags: (recipe.dietaryTags || []).join(', '),
      imageUrl: recipe.imageUrl,
      prepTime: recipe.prepTime || 15,
      cookTime: recipe.cookTime || 20,
      servings: recipe.servings || 2
    });
  };

  const handleDelete = async (id) => {
    const response = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
    if (response.ok) {
      fetchRecipes();
      fetchFilters();
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCuisine('');
    setSelectedMealType('');
    setSelectedDietary('');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Healthy & tasty</p>
          <h1>Recipe Finder</h1>
        </div>
        <button className="primary-button" type="button" onClick={() => setEditingId(null)}>
          New Recipe
        </button>
      </header>

      <section className="controls panel">
        <div className="search-box">
          <label htmlFor="search">Search recipes</label>
          <input
            id="search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or ingredient"
          />
        </div>

        <div className="filters-grid">
          <select value={selectedCuisine} onChange={(event) => setSelectedCuisine(event.target.value)}>
            <option value="">Cuisine</option>
            {filters.cuisines.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select value={selectedMealType} onChange={(event) => setSelectedMealType(event.target.value)}>
            <option value="">Meal type</option>
            {filters.mealTypes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select value={selectedDietary} onChange={(event) => setSelectedDietary(event.target.value)}>
            <option value="">Dietary</option>
            {filters.dietaryTags.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <button className="secondary-button" type="button" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </section>

      <main className="content-grid">
        <section className="recipes-panel">
          <div className="section-head">
            <h2>Recipes</h2>
            <span>{recipes.length} found</span>
          </div>

          {loading ? (
            <p>Loading recipes...</p>
          ) : recipes.length === 0 ? (
            <p className="empty-state">No recipes match your search.</p>
          ) : (
            <div className="recipe-grid">
              {recipes.map((recipe) => (
                <article key={recipe.id} className="recipe-card">
                  <img src={recipe.imageUrl} alt={recipe.name} />
                  <div className="recipe-body">
                    <div className="chip-row">
                      <span className="chip">{recipe.cuisine}</span>
                      <span className="chip">{recipe.mealType}</span>
                    </div>
                    <h3>{recipe.name}</h3>
                    <p>{recipe.description}</p>
                    <ul>
                      {recipe.ingredients.slice(0, 3).map((ingredient) => (
                        <li key={`${recipe.id}-${ingredient}`}>{ingredient}</li>
                      ))}
                    </ul>
                    <div className="recipe-actions">
                      <button className="small-button" type="button" onClick={() => handleEdit(recipe)}>
                        Edit
                      </button>
                      <button className="small-button danger" type="button" onClick={() => handleDelete(recipe.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="form-panel panel">
          <h2>{editingId ? 'Edit recipe' : 'Add a recipe'}</h2>
          <form onSubmit={handleSubmit} className="recipe-form">
            <label>
              Name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>

            <label>
              Description
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="3" />
            </label>

            <label>
              Ingredients (comma separated)
              <textarea value={form.ingredients} onChange={(event) => setForm({ ...form, ingredients: event.target.value })} rows="3" required />
            </label>

            <label>
              Instructions (one per line)
              <textarea value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} rows="4" required />
            </label>

            <div className="two-column">
              <label>
                Cuisine
                <input value={form.cuisine} onChange={(event) => setForm({ ...form, cuisine: event.target.value })} />
              </label>

              <label>
                Meal Type
                <select value={form.mealType} onChange={(event) => setForm({ ...form, mealType: event.target.value })}>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="dessert">Dessert</option>
                </select>
              </label>
            </div>

            <div className="two-column">
              <label>
                Prep Time (min)
                <input type="number" value={form.prepTime} onChange={(event) => setForm({ ...form, prepTime: Number(event.target.value) })} />
              </label>

              <label>
                Cook Time (min)
                <input type="number" value={form.cookTime} onChange={(event) => setForm({ ...form, cookTime: Number(event.target.value) })} />
              </label>
            </div>

            <div className="two-column">
              <label>
                Servings
                <input type="number" value={form.servings} onChange={(event) => setForm({ ...form, servings: Number(event.target.value) })} />
              </label>

              <label>
                Dietary Tags
                <input value={form.dietaryTags} onChange={(event) => setForm({ ...form, dietaryTags: event.target.value })} />
              </label>
            </div>

            <label>
              Image URL
              <input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
            </label>

            <div className="form-actions">
              <button className="primary-button" type="submit">
                {editingId ? 'Save Changes' : 'Add Recipe'}
              </button>
              {editingId && (
                <button className="secondary-button" type="button" onClick={() => { setEditingId(null); setForm(emptyRecipe); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </aside>
      </main>
    </div>
  );
}

export default App;
