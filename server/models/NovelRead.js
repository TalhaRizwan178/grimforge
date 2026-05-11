const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NovelRead = sequelize.define('NovelRead', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  novel_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'novel_reads',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = NovelRead;
