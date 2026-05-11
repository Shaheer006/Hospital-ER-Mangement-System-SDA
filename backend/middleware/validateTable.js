const allowedTables = ['beds', 'patients', 'inventory', 'archive'];

const validateTable = (req, res, next) => {
  const { table } = req.body;

  if (!allowedTables.includes(table)) {
    return res.status(400).json({
      error: 'Invalid table name'
    });
  }

  next();
};

module.exports = validateTable;