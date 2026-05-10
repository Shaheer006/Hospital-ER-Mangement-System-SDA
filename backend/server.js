const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
// Increased limit just in case your database gets very large
app.use(express.json({ limit: '10mb' }));

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to Dynamic SQLite database.');
});

// Helper function: Safely fetch tables even if they haven't been created yet
const getTable = (tableName) => new Promise((resolve) => {
  db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
    if (err) resolve(null); // Table doesn't exist yet, return null
    else resolve(rows);
  });
});

// 1. Send all data to React on startup
app.get('/api/sync', async (req, res) => {
  const data = {
    beds: await getTable('beds'),
    patients: await getTable('patients'),
    inventory: await getTable('inventory'),
    archive: await getTable('archive')
  };
  res.json(data);
});

// 2. The Self-Healing Schema Generator
app.post('/api/save-state', (req, res) => {
  const { table, data } = req.body;
  const allowed = ['beds', 'patients', 'inventory', 'archive'];
  if (!allowed.includes(table) || !data || data.length === 0) return res.sendStatus(200);

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Ensure table exists with correct columns (only creates if missing)
    const keys = Object.keys(data[0]);
    const columnDefs = keys.map(k => `"${k}" TEXT`).join(', ');
    db.run(`CREATE TABLE IF NOT EXISTS ${table} (${columnDefs})`);

    // Clear and repopulate atomically
    db.run(`DELETE FROM ${table}`);
    const placeholders = keys.map(() => '?').join(', ');
    const stmt = db.prepare(
      `INSERT INTO ${table} (${keys.map(k => `"${k}"`).join(',')}) VALUES (${placeholders})`
    );
    data.forEach(row => stmt.run(Object.values(row)));
    stmt.finalize();

    db.run('COMMIT', (err) => {
      if (err) { db.run('ROLLBACK'); return res.status(500).send(err.message); }
      res.sendStatus(200);
    });
  });
});

app.listen(3001, () => console.log('Dynamic SQLite Backend running on port 3001'));