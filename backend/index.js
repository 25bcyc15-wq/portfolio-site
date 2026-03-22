import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

// Serve frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Database abstraction layer
let db;

if (process.env.DATABASE_URL && isProduction) {
  // Production: Use PostgreSQL
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  // Initialize PostgreSQL table
  pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).catch(err => console.error('Database initialization error:', err));

  db = {
    async save(name, email, message) {
      await pool.query(
        'INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)',
        [name, email, message]
      );
    },
    async getAll() {
      const result = await pool.query('SELECT * FROM contact_messages ORDER BY id DESC');
      return result.rows;
    },
    async deleteAll() {
      await pool.query('DELETE FROM contact_messages');
    }
  };
  console.log('✓ Connected to PostgreSQL database');
} else {
  // Development: Use SQLite
  const dbPath = path.join(__dirname, 'messages.db');
  const sqlite = new sqlite3.Database(dbPath);

  // Initialize SQLite table
  sqlite.run(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Database initialization error:', err);
  });

  db = {
    async save(name, email, message) {
      return new Promise((resolve, reject) => {
        sqlite.run(
          'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
          [name, email, message],
          (err) => err ? reject(err) : resolve()
        );
      });
    },
    async getAll() {
      return new Promise((resolve, reject) => {
        sqlite.all(
          'SELECT * FROM contact_messages ORDER BY id DESC',
          (err, rows) => err ? reject(err) : resolve(rows || [])
        );
      });
    },
    async deleteAll() {
      return new Promise((resolve, reject) => {
        sqlite.run(
          'DELETE FROM contact_messages',
          (err) => err ? reject(err) : resolve()
        );
      });
    }
  };
  console.log('✓ Connected to SQLite database');
}

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: db ? 'connected' : 'not initialized' });
});

// Contact form endpoint
app.post('/contact', async (req, res) => {
  if (!db) {
    return res.status(503).json({ message: "Database not initialized" });
  }
  
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    await db.save(name, email, message);
    res.json({ message: "Message saved successfully" });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ message: "Error saving message" });
  }
});

// Get all messages
app.get('/messages', async (req, res) => {
  if (!db) {
    return res.status(503).json({ message: "Database not initialized" });
  }
  
  try {
    const messages = await db.getAll();
    res.json(messages || []);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// Delete all messages
app.delete('/messages', async (req, res) => {
  if (!db) {
    return res.status(503).json({ message: "Database not initialized" });
  }
  
  try {
    await db.deleteAll();
    res.json({ message: "All messages deleted successfully" });
  } catch (err) {
    console.error('Error deleting messages:', err);
    res.status(500).json({ message: "Error deleting messages" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
