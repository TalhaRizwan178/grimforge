const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Novel = sequelize.define('Novel', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  plot: { type: DataTypes.TEXT, allowNull: false },
  genre: { type: DataTypes.STRING(50), allowNull: false },
  tone: { type: DataTypes.STRING(50), allowNull: false },
  chapter_length: { type: DataTypes.INTEGER, defaultValue: 1500 },
  thumbnail_url: { type: DataTypes.STRING(500), defaultValue: null },
  creator_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'novels',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Novel;
