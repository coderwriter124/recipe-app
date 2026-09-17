# Recipe App

Full-stack recipe discovery app built with React, Express, and PostgreSQL support.

## Features

- Search recipes by name or ingredient
- Filter by cuisine, meal type, dietary preference, and category
- Add, edit, and delete recipes
- Save and unsave favorites
- Favorites-only view
- PostgreSQL schema with an in-memory fallback for local development

## Windows setup

From the repository root (`C:\Users\priya\recipe-app`), run:

```cmd
npm install
npm run dev
```

The app opens at http://localhost:5173. The API runs at http://localhost:5000.

The development server uses Node's built-in `--watch` mode, so a separate `nodemon` package is not required. Use Node.js 18.11 or newer; Node.js 20 LTS or newer is recommended.

To verify your Node version:

```cmd
node --version
```

If the version is too old, install the current LTS release from https://nodejs.org/.

## If npm install previously failed

After pulling the latest files, run these commands from the repository root:

```cmd
git pull
rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm cache verify
npm install
npm run dev
```

If `rmdir` says the folder does not exist, continue with the next command.

## API

- `GET /api/health`
- `GET /api/recipes`
- `GET /api/recipes/:id`
- `GET /api/filters`
- `POST /api/recipes`
- `PUT /api/recipes/:id`
- `DELETE /api/recipes/:id`
- `GET /api/favorites`
- `POST /api/favorites/:id/toggle`

Favorites use the browser's generated `x-user-id` for the local demo. Connect this to authenticated accounts before production deployment.
