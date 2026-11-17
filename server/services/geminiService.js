import { GoogleGenerativeAI } from '@google/generative-ai';
import { cleanTitleText } from './diagramService.js';

/**
 * Universal NLP & Topic Intelligence Engine
 * Fixes:
 * 1. Directly respects any typed word or user utterance (never locks to "General Study Concept").
 * 2. Instant responsive classification for ANY domain (science, celebrities, machines, pop culture, daily life).
 * 3. Supports both 'study' mode and 'all' mode.
 */

// Speech filler words to strip out
const FILLERS = new Set([
  'um', 'uh', 'like', 'you know', 'i mean', 'basically', 'actually', 'sort of',
  'kind of', 'literally', 'so yeah', 'right', 'well', 'okay', 'so', 'just',
  'anyway', 'let me see', 'what i am saying is', 'i think', 'as i said'
]);

// Common English stopwords
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot', 'could',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself',
  'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'let', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on',
  'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
  'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your'
]);

function titleCase(str) {
  return String(str || '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export async function analyzeTopicWithSlidingWindow({
  chunk,
  history = [],
  currentTopic = null,
  apiKey = null,
  mode = 'study'
}) {
  const effectiveKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const recentHistory = Array.isArray(history) ? history.slice(-5) : [];

  // Try live Gemini API if key is available
  if (effectiveKey) {
    try {
      const genAI = new GoogleGenerativeAI(effectiveKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are the visual topic engine for Vizora (${mode === 'study' ? 'Study Mode' : 'All Topics Universal Mode'}).
User speech or typed text: "${chunk}"
Recent history: ${JSON.stringify(recentHistory)}
Current active topic: ${JSON.stringify(currentTopic)}

TASK:
1. Extract the primary subject. If the user typed or spoke a specific noun (e.g. "car", "apple", "rajini", "heart", "tcp"), make THAT the primaryTopic!
2. Extract 2-4 key concept tags.
3. Generate 3 targeted image search queries. In 'study' mode, prefer diagrams and schematics. In 'all' mode, prefer photos, illustrations, and overviews.
4. Write a 1-sentence descriptive caption.

Return ONLY a JSON object:
{
  "primaryTopic": "Main subject name",
  "subtopic": "Specific aspect",
  "searchQueries": ["query 1", "query 2"],
  "concepts": ["Tag 1", "Tag 2"],
  "caption": "1-sentence summary"
}`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(result.response.text());
      return {
        ...parsed,
        primaryTopic: cleanTitleText(parsed.primaryTopic),
        source: 'gemini'
      };
    } catch (err) {
      console.warn('Gemini API notice, using universal semantic engine:', err.message);
    }
  }

  // Universal Semantic Engine
  return universalSemanticInterpreter(chunk, recentHistory, currentTopic, mode);
}

function universalSemanticInterpreter(chunk, history, currentTopic, mode = 'study') {
  const rawInput = String(chunk || '').trim();
  const cleanChunk = rawInput
    .replace(/[^\w\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  if (!cleanChunk) {
    return {
      primaryTopic: currentTopic?.primaryTopic || 'Visual Concept',
      subtopic: 'Overview',
      searchQueries: ['Visual Concept diagram'],
      concepts: ['Visual', 'Concept'],
      caption: 'Visual overview.'
    };
  }

  const rawWords = cleanChunk.split(/\s+/).filter(Boolean);
  const meaningfulWords = rawWords.filter(w => !FILLERS.has(w.toLowerCase()));

  // DIRECT RECOGNITION: The user's input directly determines the topic!
  let primaryTopic = '';
  let subtopic = '';

  if (meaningfulWords.length <= 4) {
    // Exact short input (e.g., "car", "solar system", "rajini", "heart blood flow")
    primaryTopic = titleCase(meaningfulWords.join(' '));
    subtopic = mode === 'study' ? 'System Overview' : 'Visual Guide';
  } else {
    // Longer sentence: extract primary technical or proper nouns
    const nonStop = meaningfulWords.filter(w => !STOP_WORDS.has(w.toLowerCase()));
    if (nonStop.length > 0) {
      primaryTopic = titleCase(nonStop.slice(0, 3).join(' '));
      subtopic = titleCase(meaningfulWords.slice(3, 7).join(' ')) || 'Key Concepts';
    } else {
      primaryTopic = titleCase(meaningfulWords.slice(0, 3).join(' '));
      subtopic = 'Overview';
    }
  }

  primaryTopic = cleanTitleText(primaryTopic);

  // Generate 3-4 clean search queries WITHOUT duplicate suffixes
  const baseTerm = primaryTopic;
  let searchQueries = [];

  if (mode === 'study') {
    searchQueries = [
      `${baseTerm} diagram`,
      `${baseTerm} schematic`,
      baseTerm
    ];
  } else {
    searchQueries = [
      baseTerm,
      `${baseTerm} photo`,
      `${baseTerm} illustration`
    ];
  }

  // Clean all search queries
  searchQueries = Array.from(new Set(searchQueries.map(q => cleanTitleText(q))));

  // Extract concept badges
  const concepts = Array.from(
    new Set(meaningfulWords.filter(w => w.length > 2 && !STOP_WORDS.has(w.toLowerCase())).map(titleCase))
  ).slice(0, 5);

  if (concepts.length === 0) concepts.push(primaryTopic);

  return {
    primaryTopic,
    subtopic,
    isNewTopic: true,
    confidence: 0.95,
    searchQueries,
    concepts,
    caption: `Visual overview of ${primaryTopic}${subtopic ? ` representing ${subtopic}` : ''}.`,
    quizQuestion: {
      question: `What is a core characteristic of ${primaryTopic}?`,
      options: [concepts[0] || 'Core Architecture', 'Unrelated Factor', 'Static State'],
      correctIndex: 0
    },
    source: 'universal-nlp'
  };
}
