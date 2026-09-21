import { apiFetch } from './apiClient';

export interface OrientationTopic {
  slug: string;
  category: 'filieres' | 'infos';
  title: string;
  content: string;
  keywords: string;
  updated_at: string;
}

export const orientationService = {
  async getTopics(category?: 'filieres' | 'infos'): Promise<OrientationTopic[]> {
    const q = category ? `?category=${category}` : '';
    const remote = await apiFetch<OrientationTopic[]>(`/orientation/topics${q}`);
    return Array.isArray(remote) ? remote : [];
  },

  // Journalise une question sans réponse (silencieux : jamais bloquant).
  async logUnanswered(question: string, source: 'assistant' | 'quiz' = 'assistant'): Promise<void> {
    try {
      await apiFetch('/orientation/unanswered', {
        method: 'POST',
        body: JSON.stringify({ question: question.slice(0, 500), source }),
      });
    } catch {
      // silencieux
    }
  },
};

// Recherche plein-texte simple : titre x3, mots-clés x2, contenu x1. Insensible accents/casse.
export function searchTopics(topics: OrientationTopic[], query: string): OrientationTopic[] {
  const norm = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const words = norm(query).split(/[^a-z0-9]+/).filter((w) => w.length > 1);
  if (words.length === 0) return [];
  return topics
    .map((t) => {
      const title = norm(t.title);
      const keys = norm(t.keywords);
      const body = norm(t.content);
      let score = 0;
      for (const w of words) {
        if (title.includes(w)) score += 3;
        if (keys.includes(w)) score += 2;
        if (body.includes(w)) score += 1;
      }
      return { t, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.t);
}
