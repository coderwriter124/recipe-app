# Recipe App

Full-stack recipe discovery app built with React, Express, and PostgreSQL support.

## Recipe discovery improvements

- Recipe cards are clickable and open a full recipe detail dialog.
- Full ingredients and step-by-step instructions are displayed in the detail view.
- Search results can be sent immediately to Google with the **Search Google** button.
- Each recipe detail view includes a Google link for similar recipes.
- Cards support keyboard activation with Enter and have visible hover/focus states.

The app links to Google Search rather than scraping Google results. This avoids unreliable scraping and lets users see Google's current results directly.

## Run on Windows

From `C:\Users\priya\recipe-app`:

```cmd
npm install
npm run dev
```

Open http://localhost:5173.
