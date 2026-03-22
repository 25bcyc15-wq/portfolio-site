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

console.log('Starting server...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Is Production:', isProduction);
console.log('DATABASE_URL available:', !!process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());

// Serve frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Database abstraction layer with lazy initialization
let db;
let tableInitialized = false;

async function initTable() {
  if (tableInitialized) return;
  
  let retries = 0;
  const maxRetries = 3;
  
  while (retries < maxRetries) {
    try {
      if (process.env.DATABASE_URL && isProduction) {
        // PostgreSQL
        await db.query(`
          CREATE TABLE IF NOT EXISTS contact_messages (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
      } else {
        // SQLite
        await new Promise((resolve, reject) => {
          db.sqlite.run(`
            CREATE TABLE IF NOT EXISTS contact_messages (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              email TEXT NOT NULL,
              message TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      tableInitialized = true;
      console.log('✓ Database table initialized on first use');
      return;
    } catch (err) {
      retries++;
      console.error(`Table initialization error (attempt ${retries}/${maxRetries}):`, err.message);
      
      if (retries < maxRetries) {
        console.log('Retrying in 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.error('Failed to initialize table after max retries');
        throw err;
      }
    }
  }
}

// Initialize database connection (non-blocking, non-crashing)
if (process.env.DATABASE_URL && isProduction) {
  // Production: PostgreSQL
  console.log('Configuring PostgreSQL...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'present' : 'MISSING');
  
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  // Test connection in background but don't block startup
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('⚠ PostgreSQL connection test failed:', err.message);
    } else {
      console.log('✓ PostgreSQL connection successful');
    }
  });

  db = {
    async query(sql, params = []) {
      return pool.query(sql, params);
    },
    async save(name, email, message) {
      await initTable();
      const result = await pool.query(
        'INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)',
        [name, email, message]
      );
      return result.rows;
    },
    async getAll() {
      await initTable();
      const result = await pool.query('SELECT * FROM contact_messages ORDER BY id DESC');
      return result.rows;
    },
    async deleteAll() {
      await initTable();
      await pool.query('DELETE FROM contact_messages');
    }
  };
  console.log('✓ PostgreSQL pool created');
} else {
  // Development: SQLite
  console.log('Using SQLite (local development)');
  const dbPath = path.join(__dirname, 'messages.db');
  const sqlite = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('⚠ SQLite connection error:', err.message);
    } else {
      console.log('✓ SQLite database connected');
    }
  });

  db = {
    sqlite,
    async save(name, email, message) {
      await initTable();
      return new Promise((resolve, reject) => {
        sqlite.run(
          'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
          [name, email, message],
          (err) => err ? reject(err) : resolve()
        );
      });
    },
    async getAll() {
      await initTable();
      return new Promise((resolve, reject) => {
        sqlite.all(
          'SELECT * FROM contact_messages ORDER BY id DESC',
          (err, rows) => err ? reject(err) : resolve(rows || [])
        );
      });
    },
    async deleteAll() {
      await initTable();
      return new Promise((resolve, reject) => {
        sqlite.run(
          'DELETE FROM contact_messages',
          (err) => err ? reject(err) : resolve()
        );
      });
    }
  };
  console.log('✓ SQLite configured');
}

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    environment: isProduction ? 'production' : 'development',
    database: process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite',
    timestamp: new Date().toISOString()
  });
});

// Contact form endpoint
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    await db.save(name, email, message);
    res.json({ message: "Message saved successfully" });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ message: "Error saving message: " + err.message });
  }
});

// Get all messages
app.get('/messages', async (req, res) => {
  try {
    const messages = await db.getAll();
    res.json(messages || []);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: "Error fetching messages: " + err.message });
  }
});

// Delete all messages
app.delete('/messages', async (req, res) => {
  try {
    await db.deleteAll();
    res.json({ message: "All messages deleted successfully" });
  } catch (err) {
    console.error('Error deleting messages:', err.message);
    res.status(500).json({ message: "Error deleting messages" });
  }
});

// Start server - non-blocking
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔════════════════════════════════════╗');
  console.log(`║  Server running on port ${PORT}      ║`);
  console.log('║  Frontend: http://localhost:5000   ║');
  console.log('║  Database: Lazy initialization     ║');
  console.log('╚════════════════════════════════════╝');
  console.log('');
});

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
