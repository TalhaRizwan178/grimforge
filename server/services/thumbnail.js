const { generateThumbnailPrompt } = require('./groq');

function titleSeed(title, genre) {
  return Math.abs(
    (title + genre).split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0)
  ) % 99999;
}

function pollinationsUrl(prompt, seed) {
  const encoded = encodeURIComponent(prompt.trim().replace(/\.$/, ''));
  return `https://image.pollinations.ai/prompt/${encoded}?width=800&height=450&seed=${seed}&model=turbo`;
}

async function generateThumbnail(genre, title, plot, tone = '') {
  const seed = titleSeed(title, genre);

  let prompt;
  try {
    prompt = await generateThumbnailPrompt(title, plot, genre, tone);
  } catch {
    prompt = `${title}, ${genre} novel cover, cinematic digital painting, dramatic, no text`;
  }

  return pollinationsUrl(prompt, seed);
}

module.exports = { generateThumbnail };
