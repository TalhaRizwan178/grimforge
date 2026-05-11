require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql2 = require('mysql2/promise');
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
  // Step 1: Create the database if not on Railway (Railway creates it automatically)
  if (!process.env.RAILWAY_ENVIRONMENT) {
    try {
      const conn = await mysql2.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await conn.end();
      console.log(`Database "${process.env.DB_NAME}" ready`);
    } catch (err) {
      console.error('Could not create database:', err.message);
      process.exit(1);
    }
  } else {
    console.log(`Using existing Railway database "${process.env.DB_NAME}"`);
  }

  // Step 2: Sync all Sequelize models (creates/alters tables)
  try {
    await sequelize.sync({ alter: true });
    console.log('Tables synced successfully');
  } catch (err) {
    console.error('Table sync failed:', err.message);
    process.exit(1);
  }

  // Step 3: Start the server
  app.listen(PORT, () => {
    console.log(`GrimForge server running on http://localhost:${PORT}`);
  });
}

start();
