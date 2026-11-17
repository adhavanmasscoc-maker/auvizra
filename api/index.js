import express from 'express';
import cors from 'cors';
import topicsRouter from '../server/routes/topics.js';
import imagesRouter, { handleImageProxy } from '../server/routes/images.js';
import transcriptionRouter from '../server/routes/transcription.js';
import sessionsRouter from '../server/routes/sessions.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// API Routes
app.use('/api/topics', topicsRouter);
app.use('/api/images', imagesRouter);
app.get('/api/image-proxy', handleImageProxy);
app.use('/api/transcribe', transcriptionRouter);
app.use('/api/sessions', sessionsRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'Auvizra API',
    version: '1.2.0',
    deployment: 'vercel-serverless',
    modes: ['study', 'all'],
    services: {
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
      whisperConfigured: Boolean(process.env.OPENAI_API_KEY),
      wikimediaCommons: 'online'
    }
  });
});

export default app;
