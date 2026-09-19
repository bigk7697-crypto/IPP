import { NewsItem, EventItem, SchoolClass, ResultItem, DocumentItem, GalleryAlbum } from '../types';

export const adminInitialNews: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Rentrée Scolaire 2025-2026 : Cérémonie d’Ouverture et Accueil des Nouveaux Élèves',
    slug: 'rentree-scolaire-2025-2026',
    content: 'La rentrée solennelle de l’année académique 2025-2026 s’est déroulée ce lundi dans une ambiance studieuse et chaleureuse.',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    published_at: '2025-09-02T08:00:00Z',
    created_at: '2025-09-01T15:00:00Z',
    created_by: 'adm-1',
    author_name: 'Direction des Études'
  },
  {
    id: 'news-2',
    title: 'Succès éclatant de nos élèves aux Olympiades Nationales de Mathématiques',
    slug: 'olympiades-mathematiques-succes',
    content: 'Nos élèves de Terminale C ont brillamment représenté l’établissement.',
    image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    published_at: '2025-10-15T10:30:00Z',
    created_at: '2025-10-14T09:00:00Z',
    created_by: 'adm-1',
    author_name: 'Département Scientifique'
  },
  {
    id: 'news-3',
    title: 'Brouillon : Rapport d’orientation post-bac 2026',
    slug: 'brouillon-orientation-2026',
    content: 'En cours de rédaction par le conseiller d’orientation.',
    image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    status: 'draft',
    created_at: '2026-03-01T10:00:00Z',
    created_by: 'adm-1',
    author_name: 'Conseil d’Orientation'
  }
];

export const adminInitialEvents: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Journée Portes Ouvertes & Exposition Scientifique',
    description: 'Venez découvrir nos laboratoires de physique-chimie rénovés.',
    image_path: 'https://images.unsplash.com/photo-1564979291807-0209c1c045dd?auto=format&fit=crop&w=1000&q=80',
    location: 'Campus Principal',
    start_at: '2026-04-15T09:00:00Z',
    status: 'upcoming',
    created_at: '2025-09-10T11:00:00Z'
  }
];

export const adminInitialClasses: SchoolClass[] = [
  { id: 'cls-1', name: 'Terminale D1', level: 'Terminale', series: 'Scientifique (D)', academic_year: '2025-2026', is_active: true, created_at: '2025-09-01T00:00:00Z' },
  { id: 'cls-2', name: 'Terminale C', level: 'Terminale', series: 'Mathématiques & Physique (C)', academic_year: '2025-2026', is_active: true, created_at: '2025-09-01T00:00:00Z' },
  { id: 'cls-3', name: 'Première A4', level: 'Première', series: 'Littéraire (A4)', academic_year: '2025-2026', is_active: true, created_at: '2025-09-01T00:00:00Z' },
];

export const adminInitialResults: ResultItem[] = [
  {
    id: 'res-1',
    class_id: 'cls-1',
    class_name: 'Terminale D1',
    academic_year: '2025-2026',
    result_type: 'Trimestre 1',
    file_path: '/secure/results/terminale-d1-trimestre-1.pdf',
    file_name: 'resultats-terminale-d1-trimestre-1.pdf',
    status: 'published',
    published_at: '2025-12-20T10:00:00Z',
    created_at: '2025-12-19T15:00:00Z'
  }
];

export const adminInitialDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Règlement Intérieur de l’Établissement',
    description: 'Document officiel régissant la vie en communauté.',
    file_path: '/docs/reglement-interieur-2025.pdf',
    file_name: 'reglement-interieur-2025.pdf',
    category: 'Règlement',
    is_public: true,
    created_at: '2025-09-01T00:00:00Z'
  }
];

export const adminInitialGallery: GalleryAlbum[] = [
  {
    id: 'alb-1',
    title: 'Rentrée Scolaire 2025',
    description: 'Moments forts de l’accueil des élèves.',
    cover_image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    photos: [
      { id: 'p-1', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80', caption: 'Cour principale' }
    ],
    created_at: '2025-09-02T00:00:00Z'
  }
];
