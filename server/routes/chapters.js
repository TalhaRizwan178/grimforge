const express = require('express');
const { Op } = require('sequelize');
const { Novel, Chapter, StoryContext, NovelRead } = require('../models');
const { authenticate } = require('../middleware/auth');
const { generateNextChapter, extractStoryContext, generateBranchSuggestions } = require('../services/groq');

const router = express.Router({ mergeParams: true });

// GET /api/novels/:id/chapters/branches — generate 3 story branch suggestions
// Must be defined BEFORE /:num to avoid conflict
router.get('/branches', authenticate, async (req, res) => {
  try {
    const novel_id = req.params.id;
    const user_id = req.user.id;

    const novel = await Novel.findByPk(novel_id);
    if (!novel) return res.status(404).json({ error: 'Novel not found' });

    let userChapters = await Chapter.findAll({
      where: { novel_id, user_id },
      order: [['chapter_number', 'ASC']],
    });

    if (userChapters.length === 0) {
      const ch1 = await Chapter.findOne({ where: { novel_id, chapter_number: 1 } });
      if (!ch1) return res.status(400).json({ error: 'No chapters yet' });
      userChapters = [ch1];
    }

    let storyContext = await StoryContext.findOne({ where: { novel_id, user_id } });
    if (!storyContext) {
      const creatorContext = await StoryContext.findOne({ where: { novel_id, user_id: novel.creator_id } });
      storyContext = { character_statuses: creatorContext?.character_statuses || {}, key_events: creatorContext?.key_events || [], chapter_summaries: creatorContext?.chapter_summaries || [] };
    }

    const branches = await generateBranchSuggestions(novel, storyContext, userChapters);
    res.json({ branches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/novels/:id/chapters — generate the user's next chapter
router.post('/', authenticate, async (req, res) => {
  try {
    const novel_id = req.params.id;
    const user_id = req.user.id;
    const { userDirection } = req.body; // optional: custom direction or chosen branch description

    const novel = await Novel.findByPk(novel_id);
    if (!novel) return res.status(404).json({ error: 'Novel not found' });

    let userChapters = await Chapter.findAll({
      where: { novel_id, user_id },
      order: [['chapter_number', 'ASC']],
    });

    if (userChapters.length === 0) {
      const ch1 = await Chapter.findOne({ where: { novel_id, chapter_number: 1 } });
      if (!ch1) return res.status(400).json({ error: 'Chapter 1 has not been generated yet' });
      userChapters = [ch1];
    }

    const nextChapterNumber = userChapters[userChapters.length - 1].chapter_number + 1;

    let storyContext = await StoryContext.findOne({ where: { novel_id, user_id } });
    if (!storyContext) {
      const creatorContext = await StoryContext.findOne({ where: { novel_id, user_id: novel.creator_id } });
      storyContext = await StoryContext.create({
        novel_id,
        user_id,
        character_statuses: creatorContext?.character_statuses || {},
        key_events: creatorContext?.key_events || [],
        chapter_summaries: creatorContext?.chapter_summaries || [],
      });
    }

    const newContent = await generateNextChapter(
      novel,
      storyContext,
      userChapters,
      nextChapterNumber,
      userDirection || null
    );

    const newChapter = await Chapter.create({
      novel_id,
      user_id,
      chapter_number: nextChapterNumber,
      content: newContent,
    });

    const contextUpdate = await extractStoryContext(newContent, nextChapterNumber, {
      character_statuses: storyContext.character_statuses,
      key_events: storyContext.key_events,
      chapter_summaries: storyContext.chapter_summaries,
    });

    await storyContext.update({
      character_statuses: contextUpdate.character_statuses,
      key_events: contextUpdate.key_events,
      chapter_summaries: [...storyContext.chapter_summaries, contextUpdate.summary],
    });

    await NovelRead.findOrCreate({ where: { novel_id, user_id } });
    res.status(201).json(newChapter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/novels/:id/chapters/from/:num — delete chapter :num and all after (user's own)
router.delete('/from/:num', authenticate, async (req, res) => {
  try {
    const novel_id = req.params.id;
    const user_id = req.user.id;
    const fromNum = parseInt(req.params.num);

    if (fromNum <= 1) return res.status(400).json({ error: 'Cannot delete chapter 1' });

    await Chapter.destroy({
      where: {
        novel_id,
        user_id,
        chapter_number: { [Op.gte]: fromNum },
      },
    });

    // Trim story context: keep only summaries for chapters before fromNum
    const storyContext = await StoryContext.findOne({ where: { novel_id, user_id } });
    if (storyContext) {
      await storyContext.update({
        chapter_summaries: storyContext.chapter_summaries.slice(0, fromNum - 1),
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/novels/:id/chapters/:num — get a specific chapter
router.get('/:num', authenticate, async (req, res) => {
  try {
    const novel_id = req.params.id;
    const chapterNumber = parseInt(req.params.num);

    if (chapterNumber === 1) {
      const chapter = await Chapter.findOne({ where: { novel_id, chapter_number: 1 } });
      if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
      return res.json(chapter);
    }

    const chapter = await Chapter.findOne({
      where: { novel_id, user_id: req.user.id, chapter_number: chapterNumber },
    });
    if (!chapter) return res.status(404).json({ error: 'Chapter not found or not yours' });
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
