# Recipe App

A full-stack recipe application built with React, Express, and PostgreSQL support. It includes recipe search, filtering, CRUD actions, and a modern responsive UI.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL-ready with an in-memory fallback for local development
- Styling: Custom CSS

## Features

- Search recipes by name or ingredient
- Filter by cuisine, meal type, and dietary preferences
- Browse recipe cards with recipe details
- Add, edit, and delete recipes
- Responsive design for desktop and mobile
- PostgreSQL schema included for deployment

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app in development mode:
   ```bash
   npm run dev
   ```

   This starts:
   - Backend API at http://localhost:5000
   - Frontend app at http://localhost:5173

3. Build the frontend for production:
   ```bash
   npm run build
   ```

4. Start the backend only:
   ```bash
   npm run start
   ```

## Project Structure

```text
recipe-app/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
├── server/
│   ├── .env.example
│   ├── package.json
│   ├── src/
│   └── database/
├── package.json
├── README.md
└── .gitignore
```

## Environment

Create a `server/.env` file based on `server/.env.example`:

```bash
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/recipe_app
```

If `DATABASE_URL` is not set, the app falls back to an in-memory recipe store so the app can run immediately for local testing.

## PostgreSQL Setup

Use the SQL in `server/database/schema.sql` to create the table:

```bash
psql -d recipe_app -f server/database/schema.sql
```

## API Endpoints

- GET /api/health
- GET /api/recipes
- GET /api/recipes/:id
- POST /api/recipes
- PUT /api/recipes/:id
- DELETE /api/recipes/:id

## Example filters

```bash
GET /api/recipes?search=garlic
GET /api/recipes?cuisine=Indian
GET /api/recipes?mealType=dinner&dietary=vegetarian
```

## Deployment Notes

- The frontend can be deployed to Vercel, Netlify, or any static host.
- The backend can be deployed to Render, Railway, Fly.io, or a VPS.
- PostgreSQL should be configured using the `DATABASE_URL` environment variable.
