import express from 'express';
import { analyzeTopicWithSlidingWindow } from '../services/geminiService.js';

const router = express.Router();

async function handleAnalyze(req, res) {
  try {
    const chunk = req.body?.chunk || req.query?.chunk || req.query?.q;
    const history = req.body?.history || [];
    const currentTopic = req.body?.currentTopic || null;
    const mode = req.body?.mode || req.query?.mode || 'study';
    const apiKey = req.headers['x-gemini-key'] || req.body?.apiKey;

    if (!chunk || !String(chunk).trim()) {
      return res.status(400).json({ error: 'Chunk text is required' });
    }

    const analysis = await analyzeTopicWithSlidingWindow({
      chunk: String(chunk).trim(),
      history,
      currentTopic,
      apiKey,
      mode
    });

    res.json(analysis);
  } catch (error) {
    console.error('Topic analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze topic', details: error.message });
  }
}

router.post('/analyze', handleAnalyze);
router.get('/analyze', handleAnalyze);

export default router;
