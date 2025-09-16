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

// Serve checkout page from project root
app.get('/checkout.html', (_req, res) => {
  res.sendFile(path.join(projectRoot, 'checkout.html'));
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
  db.prepare('INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)').run('admin', 'adminpassword', 1);
  db.prepare('INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)').run('user', 'userpassword', 0);
}

// Auth: simple demo login (no sessions, no hashing — for demo only)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ message: 'Login successful', user });
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
  const { name, description, price, color = '', spin = '' } = req.body || {};
  try {
    if (!name || typeof price !== 'number') {
      return res.status(400).json({ error: 'Missing required fields: name, price' });
    }
    const info = db
      .prepare('INSERT INTO products (name, description, price, color, spin) VALUES (?, ?, ?, ?, ?)')
      .run(name, description ?? null, price, color, spin);
    res.status(201).json({ id: info.lastInsertRowid, name, description, price, color, spin });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
