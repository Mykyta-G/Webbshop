# Webbshop (Merged)

This folder now contains both the frontend (static files in `src/`) and a simple backend API (in `server/`).

## Run locally

1. Install dependencies:

```
npm install
```

2. Start the server:

```
npm start
```

Open http://localhost:3000 in your browser. The server serves the static site from `src/` and exposes APIs under `/api/*`.

## API endpoints

- `POST /api/login` — Body: `{ "username": string, "password": string }`
- `GET /api/products` — List products
- `GET /api/products/:id` — Get product by id
- `POST /api/products` — Body: `{ name, description, price, color?, spin? }`

SQLite database file `webshop.db` is created in this folder on first run.
