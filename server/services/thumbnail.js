const https = require('https');
const cloudinary = require('cloudinary').v2;
const { generateThumbnailPrompt } = require('./groq');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = 'black-forest-labs/FLUX.1-schnell';

function titleSeed(title, genre) {
  return Math.abs(
    (title + genre).split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0)
  ) % 99999;
}

function uploadToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { public_id: publicId, folder: 'grimforge', resource_type: 'image', overwrite: true },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
}

function hfRequest(prompt, seed) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      inputs: prompt,
      parameters: { width: 800, height: 448, num_inference_steps: 4, seed },
    });

    const options = {
      hostname: 'api-inference.huggingface.co',
      path: `/models/${HF_MODEL}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, buffer: Buffer.concat(chunks) }));
    });

    req.setTimeout(60000, () => { req.destroy(); reject(new Error('HF request timed out')); });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function generateThumbnail(genre, title, plot, tone = '') {
  const seed = titleSeed(title, genre);

  let prompt;
  try {
    prompt = await generateThumbnailPrompt(title, plot, genre, tone);
  } catch {
    prompt = `${title}, ${genre} novel cover, cinematic digital painting, dramatic, no text`;
  }

  // Retry up to 3x if model is loading (503)
  let result;
  for (let attempt = 0; attempt < 3; attempt++) {
    result = await hfRequest(prompt, seed);
    if (result.status === 503) {
      await new Promise(r => setTimeout(r, 20000));
      continue;
    }
    break;
  }

  if (result.status !== 200) {
    throw new Error(`HuggingFace API error ${result.status}: ${result.buffer.toString().slice(0, 200)}`);
  }

  const url = await uploadToCloudinary(result.buffer, `novel_${seed}`);
  return url;
}

module.exports = { generateThumbnail };
