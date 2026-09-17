# Recipe App

A cute full-stack recipe discovery app built with React, Express, and PostgreSQL support.

## New recipes

The local starter catalog now includes cheesecake, parfait, French onion soup, pizza bowl, and rainbow veggie tacos in addition to the original recipes.

## Free recommendations

The app includes a free local recommendation helper. Enter ingredients and optionally select a cuisine or dietary preference. It scores recipes already in the local catalog and returns matching suggestions. This is intentionally not an LLM, so it requires no API key, has no usage fees, and works offline once the app is running.

Endpoints:

- `GET /api/recommendations?ingredients=rice,garlic&cuisine=Indian&dietary=vegan`
- `GET /api/recipes`
- `GET /api/filters`

The Google button opens a live Google recipe search in a new tab. The app does not scrape Google or embed Google results. A real AI chat assistant would require a model provider or a locally installed model; the current helper is a free deterministic alternative.

## Run on Windows

```cmd
cd /d C:\Users\priya\recipe-app
git pull
npm install
npm run dev
```

Open http://localhost:5173.
