import express from 'express';
import multer from 'multer';
import { transcribeAudioChunk } from '../services/speechService.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

const router = express.Router();

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    const audioBuffer = req.file?.buffer;
    const mimeType = req.file?.mimetype || 'audio/webm';
    const apiKey = req.headers['x-openai-key'] || req.body.apiKey;

    const result = await transcribeAudioChunk({
      buffer: audioBuffer,
      mimeType,
      apiKey
    });

    res.json(result);
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Audio transcription failed', details: error.message });
  }
});

export default router;
