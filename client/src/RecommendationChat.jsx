import { useState } from 'react';

const starterPrompts = [
  'I have chicken and rice',
  'Give me a vegetarian dinner',
  'I want something sweet'
];

export default function RecommendationChat({ onSelect }) {
  const [message, setMessage] = useState('');
  const [dietary, setDietary] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [conversation, setConversation] = useState([
    { role: 'assistant', text: 'Hi! I’m your free kitchen helper. Tell me what you have or what you’re craving, and I’ll find the best matches. ✨' }
  ]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const recommend = async (prompt = message) => {
    const text = prompt.trim();
    if (!text && !cuisine && !dietary) return;

    setLoading(true);
    setConversation((items) => [...items, { role: 'user', text: text || `Find a ${dietary || ''} ${cuisine || ''} recipe`.trim() }]);
    try {
      const ingredients = text
        .replace(/\b(i have|i want|give me|something|a|an|recipe|for)\b/gi, '')
        .trim();
      const query = new URLSearchParams({ ingredients, cuisine, dietary });
      const response = await fetch(`/api/recommendations?${query}`);
      const data = await response.json();
      const matches = data.recipes || [];
      setRecipes(matches);
      setConversation((items) => [...items, {
        role: 'assistant',
        text: matches.length
          ? `I found ${matches.length} tasty match${matches.length === 1 ? '' : 'es'} for you. Tap one to see the full recipe! 💗`
          : 'I couldn’t find an exact match yet. Try adding an ingredient like pasta, berries, or garlic.'
      }]);
      setMessage('');
    } catch (error) {
      setConversation((items) => [...items, { role: 'assistant', text: 'My recipe shelf is taking a little nap. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="recommendation-card panel" aria-label="Recipe recommendation assistant">
      <div className="assistant-heading">
        <div className="assistant-avatar">✨</div>
        <div>
          <p className="eyebrow">free kitchen helper</p>
          <h2>Ask the recipe fairy</h2>
          <span className="online-dot">● ready to help</span>
        </div>
      </div>

      <div className="chat-history" aria-live="polite">
        {conversation.slice(-4).map((item, index) => (
          <div className={`chat-bubble ${item.role}`} key={`${item.role}-${index}`}>
            {item.text}
          </div>
        ))}
        {loading && <div className="chat-bubble assistant typing">Thinking of something delicious… <span>•••</span></div>}
      </div>

      <div className="prompt-list">
        {starterPrompts.map((prompt) => (
          <button type="button" className="prompt-chip" key={prompt} onClick={() => { setMessage(prompt); recommend(prompt); }}>
            {prompt}
          </button>
        ))}
      </div>

      <div className="assistant-options">
        <select value={cuisine} onChange={(event) => setCuisine(event.target.value)} aria-label="Preferred cuisine">
          <option value="">Any cuisine</option>
          <option>Indian</option><option>Italian</option><option>Mexican</option><option>French</option><option>Asian</option><option>Greek</option>
        </select>
        <select value={dietary} onChange={(event) => setDietary(event.target.value)} aria-label="Dietary preference">
          <option value="">Any diet</option><option>vegetarian</option><option>vegan</option><option>gluten-free</option>
        </select>
      </div>

      <form className="assistant-input" onSubmit={(event) => { event.preventDefault(); recommend(); }}>
        <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell me what you’re craving…" aria-label="Ask for a recipe recommendation" />
        <button className="send-button" type="submit" disabled={loading || (!message.trim() && !cuisine && !dietary)} aria-label="Get recommendations">➤</button>
      </form>

      {recipes.length > 0 && (
        <div className="recommendation-results">
          <p className="results-label">Your little menu</p>
          {recipes.slice(0, 3).map((recipe) => (
            <button className="recommendation-item" type="button" key={recipe.id} onClick={() => onSelect(recipe)}>
              <span>{recipe.name}</span>
              <small>{recipe.cuisine} · {recipe.mealType} · {recipe.prepTime + recipe.cookTime} min</small>
            </button>
          ))}
        </div>
      )}
      <p className="assistant-note">Runs locally with no API key or paid AI service.</p>
    </aside>
  );
}
