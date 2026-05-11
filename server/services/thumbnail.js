const https = require('https');
const { generateThumbnailPrompt } = require('./groq');

// Pollinations.AI — free, no API key, generates actual AI art via Flux model

function titleSeed(title, genre) {
  return Math.abs(
    (title + genre).split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0)
  ) % 99999;
}

function pollinationsUrl(prompt, seed) {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=800&height=450&nologo=true&seed=${seed}&model=flux&enhance=false`;
}

function fetchWithTimeout(url, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error('timeout'));
    });
    req.on('error', reject);
  });
}

async function generateThumbnail(genre, title, plot, tone = '') {
  const seed = titleSeed(title, genre);

  // Use Groq to generate a plot-specific image prompt
  let prompt;
  try {
    prompt = await generateThumbnailPrompt(title, plot, genre, tone);
  } catch {
    // Fallback to a basic prompt if Groq fails
    prompt = `${title}, ${genre} novel cover, cinematic digital painting, dramatic, no text`;
  }

  const url = pollinationsUrl(prompt, seed);

  // Pre-warm the image so it's cached by the time the browser requests it
  try {
    await fetchWithTimeout(url, 25000);
  } catch {
    // If Pollinations is slow or down, still return the URL — browser will try
  }

  return url;
}

module.exports = { generateThumbnail };
