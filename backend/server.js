const express = require('express');
const cors = require('cors');

const stateRoutes = require('./routes/stateRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', stateRoutes);

app.listen(3001, () => {
  console.log('Dynamic SQLite Backend running on port 3001');
});