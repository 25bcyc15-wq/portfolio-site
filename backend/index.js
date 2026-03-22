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

console.log('=== SERVER STARTUP ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', PORT);
console.log('Is Production:', isProduction);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('====================');

app.use(cors());
app.use(express.json());

// Serve frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Database abstraction layer
let db;
let dbReady = false;

if (process.env.DATABASE_URL && isProduction) {
  // Production: Use PostgreSQL with retry logic
  console.log('Attempting PostgreSQL connection...');
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  // Connection retry logic
  let retries = 0;
  const maxRetries = 5;
  
  async function initializeDatabase() {
    try {
      console.log(`PostgreSQL connection attempt ${retries + 1}/${maxRetries}...`);
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✓ PostgreSQL table created/verified');
      dbReady = true;
      return true;
    } catch (err) {
      console.error(`PostgreSQL error (attempt ${retries + 1}):`, err.message);
      retries++;
      
      if (retries < maxRetries) {
        console.log(`Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return initializeDatabase();
      } else {
        console.error('Max retries reached. Database may not be available.');
        return false;
      }
    }
  }
  
  // Start initialization
  initializeDatabase();

  db = {
    async save(name, email, message) {
      if (!dbReady) throw new Error('Database not ready');
      try {
        await pool.query(
          'INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)',
          [name, email, message]
        );
      } catch (err) {
        console.error('PostgreSQL save error:', err.message);
        throw err;
      }
    },
    async getAll() {
      if (!dbReady) throw new Error('Database not ready');
      try {
        const result = await pool.query('SELECT * FROM contact_messages ORDER BY id DESC');
        return result.rows;
      } catch (err) {
        console.error('PostgreSQL getAll error:', err.message);
        throw err;
      }
    },
    async deleteAll() {
      if (!dbReady) throw new Error('Database not ready');
      try {
        await pool.query('DELETE FROM contact_messages');
      } catch (err) {
        console.error('PostgreSQL deleteAll error:', err.message);
        throw err;
      }
    }
  };
  console.log('PostgreSQL configuration loaded');
} else {
  // Development: Use SQLite
  console.log('Using SQLite database (local development)');
  const dbPath = path.join(__dirname, 'messages.db');
  const sqlite = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('SQLite connection error:', err.message);
    } else {
      console.log('✓ SQLite database connected');
      dbReady = true;
    }
  });

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
    if (err) {
      console.error('SQLite table creation error:', err.message);
    } else {
      console.log('✓ SQLite table created/verified');
    }
  });

  db = {
    async save(name, email, message) {
      return new Promise((resolve, reject) => {
        sqlite.run(
          'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
          [name, email, message],
          (err) => {
            if (err) {
              console.error('SQLite save error:', err.message);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    },
    async getAll() {
      return new Promise((resolve, reject) => {
        sqlite.all(
          'SELECT * FROM contact_messages ORDER BY id DESC',
          (err, rows) => {
            if (err) {
              console.error('SQLite getAll error:', err.message);
              reject(err);
            } else {
              resolve(rows || []);
            }
          }
        );
      });
    },
    async deleteAll() {
      return new Promise((resolve, reject) => {
        sqlite.run(
          'DELETE FROM contact_messages',
          (err) => {
            if (err) {
              console.error('SQLite deleteAll error:', err.message);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    }
  };
}

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: dbReady ? 'ready' : 'initializing',
    environment: isProduction ? 'production' : 'development'
  });
});

// Contact form endpoint
app.post('/contact', async (req, res) => {
  if (!db || !dbReady) {
    return res.status(503).json({ message: "Database initializing, please try again in a moment" });
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
  if (!db || !dbReady) {
    return res.status(503).json({ message: "Database initializing, please try again in a moment" });
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
  if (!db || !dbReady) {
    return res.status(503).json({ message: "Database initializing, please try again in a moment" });
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
  console.log('');
  console.log('╔════════════════════════════════════╗');
  console.log(`║  Server running on port ${PORT}      ║`);
  console.log('║  Frontend: http://localhost:5000   ║');
  console.log('║  Ready to accept requests          ║');
  console.log('╚════════════════════════════════════╝');
  console.log('');
});
