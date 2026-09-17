import { useState } from 'react';

export default function RecommendationChat({ onSelect }) {
  const [ingredients, setIngredients] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [dietary, setDietary] = useState('');
  const [message, setMessage] = useState('Tell me what you have and I will find a tasty match.');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const recommend = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ ingredients, cuisine, dietary });
      const response = await fetch(`/api/recommendations?${query}`);
      const data = await response.json();
      setRecipes(data.recipes || []);
      setMessage(data.message);
    } finally { setLoading(false); }
  };

  return <section className="recommendation-card panel"><div><p className="eyebrow">✨ free kitchen helper</p><h2>What should I cook?</h2><p className="hint">This is a free local recommendation helper—no AI API key required.</p></div><div className="chat-row"><input value={ingredients} onChange={(e) => setIngredients(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && recommend()} placeholder="e.g. chicken, rice, garlic" /><select value={cuisine} onChange={(e) => setCuisine(e.target.value)}><option value="">Any cuisine</option><option>Indian</option><option>Italian</option><option>Mexican</option><option>French</option><option>Asian</option><option>Greek</option></select><select value={dietary} onChange={(e) => setDietary(e.target.value)}><option value="">Any diet</option><option>vegetarian</option><option>vegan</option><option>gluten-free</option></select><button className="primary-button" onClick={recommend}>{loading ? 'Thinking...' : 'Recommend ✨'}</button></div><p className="helper-message">{message}</p>{recipes.length > 0 && <div className="recommendation-list">{recipes.map((recipe) => <button className="recommendation-item" key={recipe.id} onClick={() => onSelect(recipe)}><span>{recipe.name}</span><small>{recipe.cuisine} · {recipe.mealType}</small></button>)}</div>}</section>;
}
