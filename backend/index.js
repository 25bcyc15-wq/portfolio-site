import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
app.use(cors());
app.use(express.json());

let db;
(async () => {
  db = await open({
    filename: './messages.db',
    driver: sqlite3.Database
  });
  await db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL
  )`);
})();

app.post('/contact', async (req, res) => {
  const { name = '', email = '', message = '' } = req.body;
  if (!name.trim() || !email.trim() || !message.trim()) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    await db.run(
      'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
      name.trim(), email.trim(), message.trim()
    );
    res.status(201).json({ message: 'Message saved successfully!' });
  } catch (e) {
    res.status(500).json({ message: 'Database error', error: e.message });
  }
});

app.get('/messages', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM contact_messages');
    const messages = rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message
    }));
    res.json(messages);
  } catch (e) {
    res.status(500).json({ message: 'Database error', error: e.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
