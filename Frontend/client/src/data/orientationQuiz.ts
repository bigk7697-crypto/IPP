// Quiz d'orientation — 100 % local, anonyme, sans compte.
// Chaque option distribue des points aux slugs de filières ; le top 2 est
// affiché avec la fiche correspondante (lue depuis la base, donc modifiable
// par l'admin sans toucher au code).

export type SerieSlug =
  | 'a4' | 'd' | 'f2' | 'f3' | 'f4' | 'g1' | 'g2' | 'g3'
  | 'cap-maconnerie' | 'cap-electricite';

export interface QuizOption {
  label: string;
  weights: Partial<Record<SerieSlug, number>>;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

const CAP: Partial<Record<SerieSlug, number>> = { 'cap-maconnerie': 2, 'cap-electricite': 2 };
const CAP3: Partial<Record<SerieSlug, number>> = { 'cap-maconnerie': 3, 'cap-electricite': 3 };

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'matiere',
    text: 'Ta matière préférée, c’est…',
    options: [
      { label: 'Les mathématiques', weights: { d: 3, f2: 2, f3: 2, f4: 2, g2: 2 } },
      { label: 'Le français / la littérature', weights: { a4: 3, g1: 1 } },
      { label: 'La SVT / la biologie', weights: { d: 3 } },
      { label: 'La physique-chimie', weights: { d: 2, f2: 2, f3: 2 } },
      { label: 'La compta / l’éco', weights: { g2: 3, g1: 2, g3: 2 } },
      { label: 'La technique / le bricolage', weights: { f2: 2, f3: 2, f4: 2, ...CAP } },
      { label: 'Le dessin', weights: { f4: 3 } },
      { label: 'Les langues', weights: { a4: 2, g3: 1 } },
    ],
  },
  {
    id: 'activite',
    text: 'Tu préfères…',
    options: [
      { label: 'Résoudre des problèmes', weights: { d: 3, f2: 2, f3: 1 } },
      { label: 'Écrire et débattre', weights: { a4: 3 } },
      { label: 'Fabriquer et réparer', weights: { f2: 2, f3: 2, f4: 2, ...CAP } },
      { label: 'Organiser et gérer un bureau', weights: { g1: 3, g2: 2 } },
      { label: 'Vendre et convaincre', weights: { g3: 3 } },
    ],
  },
  {
    id: 'maths',
    text: 'Les maths, pour toi, c’est…',
    options: [
      { label: 'Ma matière forte', weights: { d: 3, f2: 2, f3: 2, f4: 2, g2: 2 } },
      { label: 'Ça va, sans plus', weights: { g1: 2, g3: 2, a4: 1, d: 1 } },
      { label: 'Ma bête noire', weights: { a4: 2, g1: 1, g3: 1, ...CAP } },
    ],
  },
  {
    id: 'rythme',
    text: 'Ton rythme idéal…',
    options: [
      { label: 'Longues études, théorie à fond', weights: { a4: 2, d: 2 } },
      { label: 'Pratique vite, métier rapidement', weights: { f2: 2, f3: 2, f4: 2, g1: 1, g2: 1, g3: 1, ...CAP3 } },
      { label: 'Un mix des deux', weights: { a4: 1, d: 1, f2: 1, f3: 1, f4: 1, g1: 1, g2: 1, g3: 1, 'cap-maconnerie': 1, 'cap-electricite': 1 } },
    ],
  },
  {
    id: 'manuel',
    text: 'Le travail manuel (câbles, chantier, machines)…',
    options: [
      { label: 'J’adore ça', weights: { f2: 2, f3: 2, f4: 2, ...CAP3 } },
      { label: 'Très peu pour moi', weights: { a4: 2, d: 2, g1: 2, g2: 2, g3: 2 } },
    ],
  },
  {
    id: 'chiffres',
    text: 'Les chiffres et l’argent (comptes, commerce)…',
    options: [
      { label: 'J’adore ça', weights: { g2: 3, g1: 2, g3: 2 } },
      { label: 'Pas mon truc', weights: { a4: 1, d: 1 } },
    ],
  },
  {
    id: 'objectif',
    text: 'Après le BAC, tu vises…',
    options: [
      { label: 'L’université (longues études)', weights: { a4: 3, d: 3 } },
      { label: 'Un BTS puis un emploi', weights: { f2: 2, f3: 2, f4: 2, g1: 2, g2: 2, g3: 2 } },
      { label: 'Travailler tout de suite', weights: { ...CAP3, f4: 1 } },
      { label: 'Créer mon entreprise', weights: { g2: 2, g3: 2, 'cap-maconnerie': 1, 'cap-electricite': 1 } },
    ],
  },
  {
    id: 'niveau',
    text: 'Ton niveau actuel…',
    options: [
      { label: '3ème / BEPC en préparation', weights: {} },
      { label: 'Seconde', weights: {} },
      { label: 'Première ou Terminale', weights: {} },
    ],
  },
];

const ORDER: SerieSlug[] = ['d', 'a4', 'f2', 'f3', 'f4', 'g1', 'g2', 'g3', 'cap-maconnerie', 'cap-electricite'];

export interface QuizResult {
  slug: SerieSlug;
  score: number;
}

/** Calcule le top 2 des filières à partir des réponses {questionId: optionIndex}. */
export function scoreQuiz(answers: Record<string, number>): QuizResult[] {
  const totals: Record<string, number> = {};
  for (const q of QUIZ_QUESTIONS) {
    const idx = answers[q.id];
    if (idx === undefined || !q.options[idx]) continue;
    for (const [slug, pts] of Object.entries(q.options[idx].weights)) {
      totals[slug] = (totals[slug] || 0) + (pts || 0);
    }
  }
  return ORDER.map((slug) => ({ slug, score: totals[slug] || 0 }))
    .sort((a, b) => b.score - a.score || ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug))
    .slice(0, 2);
}
