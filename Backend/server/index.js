const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');
const cors = require("cors");

const app = express();
const PORT = 3000;

// Parse JSON bodies
app.use(express.json());
app.use(cors());

// Determine project root (two levels up from this file: Backend/server -> project root)
const projectRoot = path.join(__dirname, '..', '..');

// Serve static frontend from actual /src folder at project root
const staticDir = path.join(projectRoot, 'src');
app.use(express.static(staticDir));

// Serve the main index.html
app.get('/', (_req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Serve checkout page from src (moved HTMLs live in /src)
app.get('/checkout.html', (_req, res) => {
  res.sendFile(path.join(staticDir, 'checkout.html'));
});

// Serve login pages from src
app.get('/login', (_req, res) => {
  res.sendFile(path.join(staticDir, 'login.html'));
});
app.get('/login.html', (_req, res) => {
  res.sendFile(path.join(staticDir, 'login.html'));
});

// Serve admin page from src
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(staticDir, 'admin.html'));
});
app.get('/admin.html', (_req, res) => {
  res.sendFile(path.join(staticDir, 'admin.html'));
});

// Connect to SQLite database (creates file if it doesn't exist)
const dbPath = path.join(__dirname, '..', 'webshop.db');
const db = new Database(dbPath);
console.log('Connected to SQLite database at', dbPath);

// Create products table if it doesn't exist
db.prepare(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '',
  spin TEXT NOT NULL DEFAULT ''
)`).run();

// Create users table if it doesn't exist
db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0
)`).run();

// Seed default users if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  db.prepare('INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)').run('admin@mail.com', 'adminpassword', 1);
  db.prepare('INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)').run('user@mail.com', 'userpassword', 0);
}

// Auth: simple demo login (no sessions, no hashing — for demo only)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const safeUser = { id: user.id, email: user.email, is_admin: !!user.is_admin };
  res.json({ message: 'Login successful', user: safeUser });
});

// Products APIs
app.get('/api/products', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM products').all();
    console.log(`Sending ${rows.length} products`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

app.post('/api/products', (req, res) => {
  const { name, description, price, image = '', color = '', spin = '' } = req.body || {};
  try {
    const priceNum = Number(price);
    if (!name || !Number.isFinite(priceNum)) {
      return res.status(400).json({ error: 'Missing or invalid fields: name, price' });
    }
    const info = db
      .prepare('INSERT INTO products (name, description, price, image, color, spin) VALUES (?, ?, ?, ?, ?, ?)')
      .run(name.trim(), description ?? null, priceNum, image || '', color, spin);
    res.status(201).json({ id: info.lastInsertRowid, name, description, price: priceNum, image, color, spin });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const info = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

// Fallback delete via POST (useful if DELETE is blocked or server not reloaded)
app.post('/api/products/:id/delete', (req, res) => {
  try {
    const { id } = req.params;
    const info = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ deleted: true, id: Number(id) });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

// Dev-only helpers: list and reset users (do NOT enable in production)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/dev/users', (_req, res) => {
    try {
      const rows = db.prepare('SELECT id, email, is_admin FROM users ORDER BY id').all();
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: String(err.message || err) });
    }
  });

  app.post('/api/dev/reset-users', (_req, res) => {
    try {
      db.prepare('DELETE FROM users').run();
      db.prepare('INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)').run('admin@mail.com', 'adminpassword', 1);
      db.prepare('INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)').run('user@mail.com', 'userpassword', 0);
      const rows = db.prepare('SELECT id, email, is_admin FROM users ORDER BY id').all();
      console.warn('DEV: Users table reset and reseeded');
      res.json({ message: 'Users reset', users: rows });
    } catch (err) {
      res.status(500).json({ error: String(err.message || err) });
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
