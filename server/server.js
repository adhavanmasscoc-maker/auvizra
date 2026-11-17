import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import topicsRouter from './routes/topics.js';
import imagesRouter, { handleImageProxy } from './routes/images.js';
import transcriptionRouter from './routes/transcription.js';
import sessionsRouter from './routes/sessions.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// API Routes
app.use('/api/topics', topicsRouter);
app.use('/api/images', imagesRouter);
app.get('/api/image-proxy', handleImageProxy); // Alias for image proxy
app.use('/api/transcribe', transcriptionRouter);
app.use('/api/sessions', sessionsRouter);

// Health check & status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.2.0',
    modes: ['study', 'all'],
    services: {
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
      whisperConfigured: Boolean(process.env.OPENAI_API_KEY),
      wikimediaCommons: 'online'
    }
  });
});

// Serve frontend in production build if present
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.json({
        message: 'Vizora Backend API Server is running. Client available via Vite dev server.'
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Auvizra Backend running on http://localhost:${PORT}`);
});
