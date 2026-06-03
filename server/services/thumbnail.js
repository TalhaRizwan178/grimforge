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

async function generateThumbnail(genre, title, plot, tone = '') {
  const seed = titleSeed(title, genre);

  let prompt;
  try {
    prompt = await generateThumbnailPrompt(title, plot, genre, tone);
  } catch {
    prompt = `${title}, ${genre} novel cover, cinematic digital painting, dramatic, no text`;
  }

  // Call HuggingFace FLUX.1-schnell — retry up to 3x if model is loading (503)
  let response;
  for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: 800,
          height: 448,
          num_inference_steps: 4,
          seed,
        },
      }),
    });

    if (response.status === 503) {
      // Model is loading, wait and retry
      await new Promise(r => setTimeout(r, 20000));
      continue;
    }
    break;
  }

  if (!response.ok) {
    const err = await response.text().catch(() => String(response.status));
    throw new Error(`HuggingFace API error ${response.status}: ${err}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const url = await uploadToCloudinary(buffer, `novel_${seed}`);
  return url;
}

module.exports = { generateThumbnail };
