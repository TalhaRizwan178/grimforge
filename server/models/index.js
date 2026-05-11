const sequelize = require('../config/database');
const User = require('./User');
const Novel = require('./Novel');
const Chapter = require('./Chapter');
const StoryContext = require('./StoryContext');
const NovelRead = require('./NovelRead');

// Associations
User.hasMany(Novel, { foreignKey: 'creator_id', as: 'created_novels' });
Novel.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });

Novel.hasMany(Chapter, { foreignKey: 'novel_id', as: 'chapters' });
Chapter.belongsTo(Novel, { foreignKey: 'novel_id', as: 'novel' });

User.hasMany(Chapter, { foreignKey: 'user_id', as: 'chapters' });
Chapter.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

Novel.hasMany(StoryContext, { foreignKey: 'novel_id' });
StoryContext.belongsTo(Novel, { foreignKey: 'novel_id' });

User.hasMany(StoryContext, { foreignKey: 'user_id' });
StoryContext.belongsTo(User, { foreignKey: 'user_id' });

Novel.hasMany(NovelRead, { foreignKey: 'novel_id' });
NovelRead.belongsTo(Novel, { foreignKey: 'novel_id' });

User.hasMany(NovelRead, { foreignKey: 'user_id' });
NovelRead.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { sequelize, User, Novel, Chapter, StoryContext, NovelRead };
