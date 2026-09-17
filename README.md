# Recipe App

A cute full-stack recipe discovery app built with React, Express, and PostgreSQL support.

## Recipe discovery

- Filter by cuisine, category, meal type, dietary tags, and search text.
- Popular cuisine buttons include Indian, Italian, Mexican, Asian, Mediterranean, American, Greek, French, Thai, and Japanese.
- Click a recipe card to see its full ingredients and step-by-step instructions.
- Use **Search Google** or **Find this recipe on Google** to open live Google recipe results in a new tab.
- The app creates a Google Search link instead of scraping Google. Google does not allow arbitrary apps to embed its result page directly.
- Save favorites, create recipes, edit recipes, and delete recipes.

## Run on Windows

```cmd
cd /d C:\Users\priya\recipe-app
git pull
npm install
npm run dev
```

Open http://localhost:5173.

## Google results

The app opens searches such as `https://www.google.com/search?q=Italian+pasta+recipe`. To use Google's structured recipe data inside the app instead, configure an approved Google Programmable Search/API integration and keep its credentials on the server; do not scrape Google from the browser.
