import express from 'express';
import { searchWikimediaImages } from '../services/imageService.js';
import { generateSvgMarkupString, cleanTitleText } from '../services/diagramService.js';

const router = express.Router();

async function handleSearch(req, res) {
  try {
    const bodyQueries = req.body?.queries;
    const singleQuery = req.body?.query || req.query?.q || req.query?.query;
    const limit = Number(req.body?.limit || req.query?.limit || 8);
    const mode = req.body?.mode || req.query?.mode || 'study';

    const searchQueries = Array.isArray(bodyQueries) && bodyQueries.length > 0 
      ? bodyQueries 
      : (singleQuery ? [singleQuery] : []);

    if (searchQueries.length === 0) {
      return res.status(400).json({ error: 'Search query or queries array required' });
    }

    const seenIds = new Set();
    const combinedResults = [];

    for (const q of searchQueries) {
      const results = await searchWikimediaImages(q, limit, mode);
      for (const img of results) {
        if (!seenIds.has(img.id)) {
          seenIds.add(img.id);
          combinedResults.push(img);
        }
      }
      if (combinedResults.length >= limit) break;
    }

    res.json({
      queryCount: searchQueries.length,
      count: combinedResults.length,
      mode,
      images: combinedResults.slice(0, limit)
    });
  } catch (error) {
    console.error('Image search route error:', error);
    res.status(500).json({ error: 'Failed to search images', details: error.message });
  }
}

router.post('/search', handleSearch);
router.get('/search', handleSearch);

// Proxy handler for external URLs
// IMPORTANT: NEVER send a 302 redirect to a data: URI as that breaks HTTP fetch and browser CORS!
async function handleImageProxy(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Image URL required');
  }

  // Extract a clean topic name from URL for fallback
  const urlTopic = cleanTitleText(
    decodeURIComponent(targetUrl)
      .split('/')
      .pop()
      ?.replace(/\.[^/.]+$/, '')
      ?.replace(/[-_]/g, ' ') || 'Visual Concept'
  );

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });

    const contentType = response.headers.get('content-type') || '';

    // If remote returned an error, 403, 429, or HTML error page, serve clean SVG buffer directly
    if (!response.ok || contentType.includes('text/html') || contentType.includes('text/plain')) {
      const fallbackSvg = generateSvgMarkupString({
        topic: urlTopic,
        subtopic: 'Verified Content',
        concepts: ['Overview', 'Structure', 'Concept'],
        caption: `Visual diagram for ${urlTopic}.`
      });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.send(Buffer.from(fallbackSvg));
    }

    res.setHeader('Content-Type', contentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.warn('Image proxy error, serving fallback SVG:', err.message);
    const fallbackSvg = generateSvgMarkupString({
      topic: urlTopic,
      subtopic: 'Verified Content',
      concepts: ['Overview', 'Concept'],
      caption: `Visual diagram for ${urlTopic}.`
    });
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(fallbackSvg));
  }
}

router.get('/proxy', handleImageProxy);

export default router;
export { handleImageProxy };
