const express = require('express');
const { Op } = require('sequelize');
const { Novel, Chapter, StoryContext, NovelRead, User } = require('../models');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { generateTitle, generateChapter1, extractStoryContext } = require('../services/groq');
const { generateThumbnail } = require('../services/thumbnail');

const router = express.Router();

// GET /api/novels/user/library — must be before /:id
router.get('/user/library', authenticate, async (req, res) => {
  try {
    const chapters = await Chapter.findAll({
      where: { user_id: req.user.id },
      attributes: ['novel_id', 'chapter_number'],
      include: [{
        model: Novel,
        as: 'novel',
        include: [{ model: User, as: 'creator', attributes: ['username'] }],
      }],
    });

    const novelMap = {};
    chapters.forEach(ch => {
      if (!ch.novel) return;
      if (!novelMap[ch.novel_id]) {
        novelMap[ch.novel_id] = {
          novel: ch.novel,
          latest_chapter: ch.chapter_number,
        };
      } else if (ch.chapter_number > novelMap[ch.novel_id].latest_chapter) {
        novelMap[ch.novel_id].latest_chapter = ch.chapter_number;
      }
    });

    res.json(Object.values(novelMap));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/novels — browse all public novels
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { genre, search, page = 1, limit = 12 } = req.query;
    const where = {};

    if (genre) where.genre = { [Op.like]: `%${genre}%` };
    if (search) where.title = { [Op.like]: `%${search}%` };

    const novels = await Novel.findAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    const novelsWithStats = await Promise.all(novels.map(async (novel) => {
      const reader_count = await NovelRead.count({ where: { novel_id: novel.id } });
      return { ...novel.toJSON(), reader_count };
    }));

    res.json(novelsWithStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/novels/:id — novel detail + chapter 1
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const novel = await Novel.findByPk(req.params.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
    });

    if (!novel) return res.status(404).json({ error: 'Novel not found' });

    const chapter1 = await Chapter.findOne({
      where: { novel_id: novel.id, chapter_number: 1 },
    });

    const reader_count = await NovelRead.count({ where: { novel_id: novel.id } });

    if (req.user) {
      await NovelRead.findOrCreate({
        where: { novel_id: novel.id, user_id: req.user.id },
      });
    }

    res.json({ ...novel.toJSON(), chapter1, reader_count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/novels — create novel (generates title if missing, generates chapter 1)
router.post('/', authenticate, async (req, res) => {
  try {
    let { title, plot, genre, tone, chapter_length = 1500 } = req.body;

    if (!plot || !genre || !tone) {
      return res.status(400).json({ error: 'plot, genre, and tone are required' });
    }

    if (!title || title.trim() === '') {
      title = await generateTitle(plot, genre, tone);
    }

    // Thumbnail: Groq generates a plot-specific prompt → Pollinations renders it
    const thumbnail_url = await generateThumbnail(genre, title, plot, tone);

    const novel = await Novel.create({
      title: title.trim(),
      plot,
      genre,
      tone,
      chapter_length: parseInt(chapter_length),
      thumbnail_url,
      creator_id: req.user.id,
    });

    const chapter1Content = await generateChapter1(novel);

    const chapter1 = await Chapter.create({
      novel_id: novel.id,
      user_id: req.user.id,
      chapter_number: 1,
      content: chapter1Content,
    });

    const contextData = await extractStoryContext(chapter1Content, 1, {
      character_statuses: {},
      key_events: [],
      chapter_summaries: [],
    });

    await StoryContext.create({
      novel_id: novel.id,
      user_id: req.user.id,
      character_statuses: contextData.character_statuses,
      key_events: contextData.key_events,
      chapter_summaries: [contextData.summary],
    });

    await NovelRead.create({ novel_id: novel.id, user_id: req.user.id });

    res.status(201).json({ novel: novel.toJSON(), chapter1: chapter1.toJSON() });
  } catch (err) {
    console.error('[POST /api/novels] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/novels/:id — only the creator can delete
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const novel = await Novel.findByPk(req.params.id);
    if (!novel) return res.status(404).json({ error: 'Novel not found' });
    if (novel.creator_id !== req.user.id) return res.status(403).json({ error: 'Only the creator can delete this novel' });

    // Cascade delete associated records
    await Chapter.destroy({ where: { novel_id: novel.id } });
    await StoryContext.destroy({ where: { novel_id: novel.id } });
    await NovelRead.destroy({ where: { novel_id: novel.id } });
    await novel.destroy();

    res.json({ message: 'Novel deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/novels/:id/my-progress — user's chapters for a novel
router.get('/:id/my-progress', authenticate, async (req, res) => {
  try {
    const chapters = await Chapter.findAll({
      where: { novel_id: req.params.id, user_id: req.user.id },
      order: [['chapter_number', 'ASC']],
    });

    const context = await StoryContext.findOne({
      where: { novel_id: req.params.id, user_id: req.user.id },
    });

    res.json({ chapters, context });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
