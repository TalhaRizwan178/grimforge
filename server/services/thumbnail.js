const https = require('https');

const PEXELS_KEY = process.env.PEXELS_API_KEY;

const GENRE_QUERIES = {
  'Fantasy':    'epic fantasy magical castle forest',
  'Horror':     'horror dark ominous haunted night',
  'Romance':    'romantic dramatic cinematic couple',
  'Thriller':   'thriller suspense dark city night',
  'Mystery':    'mystery foggy dark noir detective',
  'Sci-Fi':     'science fiction futuristic space city',
  'Historical': 'historical period dramatic epic ancient',
  'Dark':       'dark gothic atmospheric moody',
  'Crime':      'crime noir dark urban gritty',
  'Adventure':  'adventure epic dramatic landscape',
};

function titleSeed(title, genre) {
  return Math.abs(
    (title + genre).split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0)
  ) % 99999;
}

function pexelsSearch(query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`,
      method: 'GET',
      headers: { 'Authorization': PEXELS_KEY },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch (e) { reject(e); }
      });
    });
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Pexels timeout')); });
    req.on('error', reject);
    req.end();
  });
}

async function generateThumbnail(genre, title, plot, tone = '') {
  const seed = titleSeed(title, genre);
  const query = GENRE_QUERIES[genre] || `${genre} dramatic atmospheric cinematic`;

  try {
    const result = await pexelsSearch(query);
    if (result.status === 200 && result.data.photos?.length) {
      const photos = result.data.photos;
      const photo = photos[seed % photos.length];
      return photo.src.landscape || photo.src.large2x || photo.src.large;
    }
    throw new Error('No photos found');
  } catch (err) {
    console.error('[thumbnail] Pexels failed:', err.message);
    return `https://picsum.photos/seed/${seed}/800/450`;
  }
}

module.exports = { generateThumbnail };
