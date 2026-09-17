# Recipe App

Full-stack recipe discovery app built with React, Express, and PostgreSQL support.

## New features

- Recipe categories: Breakfast, Lunch, Dinner, Dessert, Snack, and Other
- Category filtering and category badges on recipe cards
- Favorites saved per browser/user identifier
- Favorites view and save/unsave controls
- Favorites REST endpoints

## API additions

- `GET /api/recipes?category=Dinner`
- `GET /api/favorites` with the `x-user-id` header
- `POST /api/favorites/:id/toggle` with the `x-user-id` header

The current local fallback stores favorites in memory. For a multi-user production deployment, connect the favorites table in `server/database/schema.sql` to authenticated user accounts.
