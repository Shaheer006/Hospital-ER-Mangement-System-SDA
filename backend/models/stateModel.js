const db = require('../database/db');

// Safely fetch tables
const getTable = (tableName) => {
  return new Promise((resolve) => {
    db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
      if (err) resolve(null);
      else resolve(rows);
    });
  });
};

// Fetch all app data
const getAllData = async () => {
  return {
    beds: await getTable('beds'),
    patients: await getTable('patients'),
    inventory: await getTable('inventory'),
    archive: await getTable('archive')
  };
};

// Save table state
const saveState = (table, data) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      const keys = Object.keys(data[0]);
      const columnDefs = keys.map(k => `"${k}" TEXT`).join(', ');

      db.run(
        `CREATE TABLE IF NOT EXISTS ${table} (${columnDefs})`
      );

      db.run(`DELETE FROM ${table}`);

      const placeholders = keys.map(() => '?').join(', ');

      const stmt = db.prepare(
        `INSERT INTO ${table} 
        (${keys.map(k => `"${k}"`).join(',')}) 
        VALUES (${placeholders})`
      );

      data.forEach(row => stmt.run(Object.values(row)));

      stmt.finalize();

      db.run('COMMIT', (err) => {
        if (err) {
          db.run('ROLLBACK');
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
};

module.exports = {
  getAllData,
  saveState
};