const stateModel = require('../models/stateModel');

// GET /api/sync
const syncData = async (req, res) => {
  try {
    const data = await stateModel.getAllData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/save-state
const saveState = async (req, res) => {
  try {
    const { table, data } = req.body;

    if (!data || data.length === 0) {
      return res.sendStatus(200);
    }

    await stateModel.saveState(table, data);

    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = {
  syncData,
  saveState
};