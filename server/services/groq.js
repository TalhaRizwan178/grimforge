const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

async function generateTitle(plot, genre, tone) {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a literary title creator. Generate a single compelling, evocative novel title. Output ONLY the title, nothing else. No quotes, no explanation, no punctuation at the end.',
      },
      {
        role: 'user',
        content: `Create a dark, memorable novel title for:\nGenre: ${genre}\nTone: ${tone}\nPlot: ${plot}`,
      },
    ],
    max_tokens: 50,
    temperature: 0.9,
  });
  return completion.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
}

async function generateChapter1(novel) {
  const { title, plot, genre, tone, chapter_length } = novel;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a master novelist specializing in ${genre} fiction. Write immersive, literary-quality prose with vivid descriptions, compelling characters, and a strong narrative voice that matches the tone: ${tone}.

Rules:
- Write ONLY the chapter content — no chapter headings, no "Chapter 1", no author notes, no meta-commentary
- Begin the story immediately with an evocative opening line
- Establish atmosphere, introduce key characters, and hook the reader
- End at a natural but suspenseful point that compels the reader forward`,
      },
      {
        role: 'user',
        content: `Write Chapter 1 of "${title}".

Genre: ${genre}
Tone: ${tone}
Core Plot: ${plot}
Target length: approximately ${chapter_length} words`,
      },
    ],
    max_tokens: Math.min(chapter_length * 2, 8000),
    temperature: 0.85,
  });

  return completion.choices[0].message.content.trim();
}

async function generateNextChapter(novel, storyContext, previousChapters, chapterNumber, userDirection = null) {
  const { title, plot, genre, tone, chapter_length } = novel;
  const { character_statuses, key_events, chapter_summaries } = storyContext;

  const summariesText = chapter_summaries
    .slice(0, -1)
    .map((s, i) => `Chapter ${i + 1} Summary: ${s}`)
    .join('\n');

  const lastChapter = previousChapters[previousChapters.length - 1];

  const characterStatusText = Object.keys(character_statuses).length
    ? Object.entries(character_statuses).map(([name, status]) => `- ${name}: ${status}`).join('\n')
    : 'No characters tracked yet.';

  const keyEventsText = key_events.length
    ? key_events.map((e, i) => `${i + 1}. ${e}`).join('\n')
    : 'None yet.';

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are continuing a ${genre} novel titled "${title}". These rules are ABSOLUTE and non-negotiable:

1. DEAD CHARACTERS STAY DEAD. If a character died, they cannot speak, act, or appear alive. Flashbacks/memories must be clearly framed as such.
2. All established facts from previous chapters remain permanently true.
3. Maintain tone: ${tone}
4. Follow the core plot arc faithfully: ${plot}
5. Write ONLY the chapter content — no headings, no "Chapter N", no meta-commentary.
6. Continue naturally from where the previous chapter ended.

STORY CONTINUITY FACTS (MUST be respected):
Character Statuses:
${characterStatusText}

Key Plot Events that HAVE occurred:
${keyEventsText}`,
      },
      {
        role: 'user',
        content: `${summariesText ? `PREVIOUS CHAPTERS SUMMARY:\n${summariesText}\n\n` : ''}CHAPTER ${chapterNumber - 1} (full text — continue directly from this):
${lastChapter.content}

---

Now write Chapter ${chapterNumber}. Target: approximately ${chapter_length} words. Build tension, develop characters, and advance the plot while maintaining absolute consistency with all established story facts.${userDirection ? `\n\nAUTHOR DIRECTION FOR THIS CHAPTER: ${userDirection}\nFollow this direction while respecting all story continuity rules above.` : ''}`,
      },
    ],
    max_tokens: Math.min(chapter_length * 2, 8000),
    temperature: 0.82,
  });

  return completion.choices[0].message.content.trim();
}

async function extractStoryContext(chapterContent, chapterNumber, existingContext) {
  const { character_statuses, key_events } = existingContext;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a story analyst. Extract key continuity data from a chapter. Return ONLY valid raw JSON — no markdown code blocks, no explanation, no extra text.',
      },
      {
        role: 'user',
        content: `Analyze Chapter ${chapterNumber} and extract story continuity data.

Existing character statuses: ${JSON.stringify(character_statuses)}
Existing key events: ${JSON.stringify(key_events)}

Chapter content (may be truncated):
${chapterContent.substring(0, 3500)}

Return JSON with EXACTLY this structure:
{
  "summary": "2-3 sentence summary of what happened in this chapter",
  "character_statuses": {"CharacterName": "alive/dead (killed by X in chapter N)/injured/missing/etc"},
  "new_key_events": ["concise event 1", "concise event 2"]
}

Merge updated statuses with existing ones. If a character dies, mark them dead. Include all named characters.`,
      },
    ],
    max_tokens: 800,
    temperature: 0.2,
  });

  let result;
  try {
    const text = completion.choices[0].message.content.trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    result = JSON.parse(cleaned);
  } catch (e) {
    result = {
      summary: `Events of chapter ${chapterNumber}.`,
      character_statuses: character_statuses,
      new_key_events: [],
    };
  }

  return {
    summary: result.summary || `Chapter ${chapterNumber} events.`,
    character_statuses: { ...character_statuses, ...(result.character_statuses || {}) },
    key_events: [...key_events, ...(result.new_key_events || [])],
  };
}

async function generateBranchSuggestions(novel, storyContext, previousChapters) {
  const { title, plot, genre, tone } = novel;
  const { character_statuses, key_events } = storyContext;
  const lastChapter = previousChapters[previousChapters.length - 1];

  const characterStatusText = Object.keys(character_statuses).length
    ? Object.entries(character_statuses).map(([n, s]) => `- ${n}: ${s}`).join('\n')
    : 'Not tracked yet.';

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a creative story consultant for a ${genre} novel titled "${title}". Generate 3 distinct, compelling directions the story could take next. Each branch must respect all established story facts (dead characters stay dead, etc.). Return ONLY valid raw JSON — no markdown, no explanation.`,
      },
      {
        role: 'user',
        content: `Core plot: ${plot}
Tone: ${tone}
Character statuses: ${characterStatusText}
Key events so far: ${key_events.slice(-5).join('; ') || 'None yet.'}

Last chapter ending (last 600 chars):
"${lastChapter.content.slice(-600)}"

Generate 3 very different possible directions for the next chapter. Make them distinct — e.g. one action-driven, one character-focused, one with a plot twist.

Return JSON: { "branches": [{ "title": "Short branch title", "description": "2-3 sentences describing what happens in this direction." }, { "title": "...", "description": "..." }, { "title": "...", "description": "..." }] }`,
      },
    ],
    max_tokens: 700,
    temperature: 0.95,
  });

  try {
    const text = completion.choices[0].message.content.trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);
    return result.branches || [];
  } catch {
    return [];
  }
}

async function generateThumbnailPrompt(title, plot, genre, tone) {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an AI art prompt engineer. Generate a single vivid image prompt for a novel cover. Output ONLY the prompt — no explanation, no quotes, no labels. Keep it under 180 characters. Focus on the specific characters, setting, mood, and conflict from the plot. Style: digital painting, cinematic, no text, no watermark.',
      },
      {
        role: 'user',
        content: `Novel: "${title}"\nGenre: ${genre}\nTone: ${tone}\nPlot: ${plot.substring(0, 400)}\n\nWrite one image generation prompt that captures this specific story visually.`,
      },
    ],
    max_tokens: 120,
    temperature: 0.8,
  });
  return completion.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
}

module.exports = { generateTitle, generateChapter1, generateNextChapter, extractStoryContext, generateBranchSuggestions, generateThumbnailPrompt };
