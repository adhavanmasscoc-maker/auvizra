/**
 * Speech Service
 * Handles server-side audio transcription via OpenAI Whisper if configured,
 * or acts as an ingestion pipeline for browser-transcribed audio payloads.
 */

export async function transcribeAudioChunk({ buffer, mimeType = 'audio/webm', apiKey = null }) {
  const effectiveKey = apiKey || process.env.OPENAI_API_KEY;

  if (effectiveKey && buffer) {
    try {
      const formData = new FormData();
      const blob = new Blob([buffer], { type: mimeType });
      formData.append('file', blob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${effectiveKey}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return {
          text: data.text,
          source: 'whisper'
        };
      }
    } catch (err) {
      console.warn('Whisper API error:', err.message);
    }
  }

  // If no whisper key is available, the frontend Web Speech API provides free, instant, real-time client-side transcription
  return {
    text: '',
    source: 'client-speech-api',
    message: 'Using client Web Speech Recognition'
  };
}
