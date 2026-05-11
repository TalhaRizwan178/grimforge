const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Chapter = sequelize.define('Chapter', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  novel_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  chapter_number: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT('long'), allowNull: false },
}, {
  tableName: 'chapters',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Chapter;
