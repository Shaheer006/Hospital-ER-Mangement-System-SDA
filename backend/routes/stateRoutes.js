const express = require('express');
const router = express.Router();

const stateController = require('../controllers/stateController');
const validateTable = require('../middleware/validateTable');

// GET all data
router.get('/sync', stateController.syncData);

// SAVE state
router.post(
  '/save-state',
  validateTable,
  stateController.saveState
);

module.exports = router;