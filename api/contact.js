import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

let dbPromise;
async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: './messages.db',
      driver: sqlite3.Database
    });
    await dbPromise.then(db => db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL
    )`));
  }
  return dbPromise;
}

export default async function handler(req, res) {
  const db = await getDb();

  if (req.method === 'POST') {
    const { name = '', email = '', message = '' } = req.body;
    if (!name.trim() || !email.trim() || !message.trim()) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
      await db.run(
        'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
        name.trim(), email.trim(), message.trim()
      );
      return res.status(201).json({ message: 'Message saved successfully!' });
    } catch (e) {
      return res.status(500).json({ message: 'Database error', error: e.message });
    }
  } else if (req.method === 'GET') {
    try {
      const rows = await db.all('SELECT * FROM contact_messages');
      const messages = rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        message: row.message
      }));
      return res.json(messages);
    } catch (e) {
      return res.status(500).json({ message: 'Database error', error: e.message });
    }
  } else {
    res.status(405).end();
  }
}
