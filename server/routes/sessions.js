import express from 'express';

const router = express.Router();

// In-memory study session storage
const studySessions = new Map();

// Get all saved sessions
router.get('/', (req, res) => {
  const list = Array.from(studySessions.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  res.json({ sessions: list });
});

// Save or update session
router.post('/save', (req, res) => {
  try {
    const session = req.body;
    if (!session || !session.id) {
      return res.status(400).json({ error: 'Session object with id required' });
    }

    const payload = {
      ...session,
      updatedAt: Date.now()
    };

    studySessions.set(session.id, payload);
    res.json({ success: true, session: payload });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save session', details: err.message });
  }
});

// Get session by id
router.get('/:id', (req, res) => {
  const session = studySessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

// Delete session
router.delete('/:id', (req, res) => {
  const existed = studySessions.delete(req.params.id);
  res.json({ success: existed });
});

export default router;
