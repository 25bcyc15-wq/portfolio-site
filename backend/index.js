import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ✅ Serve frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// ✅ Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ✅ Your contact API
const dbPath = path.join(__dirname, 'messages.db');
const db = new sqlite3.Database(dbPath);

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL
  )
`);

app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields required" });
  }

  db.run(
    "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
    [name, email, message],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Error saving message" });
      }
      res.json({ message: "Message saved successfully" });
    }
  );
});

// ✅ Get all messages
app.get('/messages', (req, res) => {
  db.all("SELECT * FROM contact_messages ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching messages" });
    }
    res.json(rows || []);
  });
});

// ✅ Delete all messages
app.delete('/messages', (req, res) => {
  db.run("DELETE FROM contact_messages", function (err) {
    if (err) {
      return res.status(500).json({ message: "Error deleting messages" });
    }
    res.json({ message: "All messages deleted successfully" });
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
