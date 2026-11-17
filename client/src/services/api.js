/**
 * Frontend API client and local caching service
 */

const API_BASE = '/api';

export async function analyzeSpeechTopic({ chunk, history = [], currentTopic = null, apiKey = null, mode = 'study' }) {
  try {
    const res = await fetch(`${API_BASE}/topics/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-gemini-key': apiKey } : {})
      },
      body: JSON.stringify({ chunk, history, currentTopic, apiKey, mode })
    });

    if (!res.ok) {
      throw new Error(`Topic analysis error (${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.error('API analyzeSpeechTopic error:', err);
    throw err;
  }
}

export async function fetchVisualsForQueries(queries, limit = 8, mode = 'study') {
  try {
    const res = await fetch(`${API_BASE}/images/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queries, limit, mode })
    });

    if (!res.ok) {
      throw new Error(`Image search error (${res.status})`);
    }

    const data = await res.json();
    return data.images || [];
  } catch (err) {
    console.error('API fetchVisualsForQueries error:', err);
    return [];
  }
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend not responding to healthcheck:', err);
  }
  return { status: 'offline', services: {} };
}

// Session Persistence
export async function saveStudySession(session) {
  try {
    const existing = JSON.parse(localStorage.getItem('vizora_saved_sessions') || '[]');
    const filtered = existing.filter(s => s.id !== session.id);
    filtered.unshift(session);
    localStorage.setItem('vizora_saved_sessions', JSON.stringify(filtered.slice(0, 30)));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }

  try {
    const res = await fetch(`${API_BASE}/sessions/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend session save skipped:', err);
  }

  return { success: true, session };
}

export async function loadSavedSessions() {
  let localSessions = [];
  try {
    localSessions = JSON.parse(localStorage.getItem('vizora_saved_sessions') || '[]');
  } catch (e) {
    localSessions = [];
  }

  try {
    const res = await fetch(`${API_BASE}/sessions`);
    if (res.ok) {
      const data = await res.json();
      if (data.sessions && data.sessions.length > 0) {
        const map = new Map();
        [...localSessions, ...data.sessions].forEach(s => map.set(s.id, s));
        return Array.from(map.values()).sort((a, b) => (b.updatedAt || b.timestamp) - (a.updatedAt || a.timestamp));
      }
    }
  } catch (e) {}

  return localSessions;
}

export async function deleteSavedSession(id) {
  try {
    const existing = JSON.parse(localStorage.getItem('vizora_saved_sessions') || '[]');
    const updated = existing.filter(s => s.id !== id);
    localStorage.setItem('vizora_saved_sessions', JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }

  try {
    await fetch(`${API_BASE}/sessions/${id}`, { method: 'DELETE' });
  } catch (e) {}
}
