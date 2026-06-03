require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const novelRoutes = require('./routes/novels');
const chapterRoutes = require('./routes/chapters');

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/novels', novelRoutes);
app.use('/api/novels/:id/chapters', chapterRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'GrimForge is alive' }));

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.sync({ alter: false });
    console.log('Tables synced successfully');
  } catch (err) {
    console.error('Table sync failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`GrimForge server running on http://localhost:${PORT}`);
  });
}

start();
