const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StoryContext = sequelize.define('StoryContext', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  novel_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  character_statuses: { type: DataTypes.JSON, defaultValue: {} },
  key_events: { type: DataTypes.JSON, defaultValue: [] },
  chapter_summaries: { type: DataTypes.JSON, defaultValue: [] },
}, {
  tableName: 'story_contexts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = StoryContext;
