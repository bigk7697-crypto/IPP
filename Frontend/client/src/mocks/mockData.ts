import { NewsItem, EventItem, SchoolClass, ResultItem, DocumentItem, GalleryAlbum, NotificationItem, NotificationPreferences, UserProfile } from '../types';

export const mockUsers: UserProfile[] = [
  {
    id: 'usr-1',
    first_name: 'Jean',
    last_name: 'Dupont',
    email: 'jean.dupont@eleve.ipp.com',
    role: 'user',
    created_at: '2025-09-01T10:00:00Z',
  },
  {
    id: 'adm-1',
    first_name: 'Admin',
    last_name: 'Principal',
    email: 'admin@ecole.com',
    role: 'admin',
    created_at: '2025-08-15T08:00:00Z',
  }
];

export const mockClasses: SchoolClass[] = [
  { id: 'cls-1', name: 'Terminale F3', level: 'Terminale', series: 'Électrotechnique (F3)', academic_year: '2025-2026', is_active: true, created_at: '2025-09-01T00:00:00Z' },
  { id: 'cls-2', name: 'Terminale D', level: 'Terminale', series: 'Scientifique (D)', academic_year: '2025-2026', is_active: true, created_at: '2025-09-01T00:00:00Z' },
  { id: 'cls-3', name: 'Première F4', level: 'Première', series: 'Génie Civil / Bâtiment (F4)', academic_year: '2025-2026', is_active: true, created_at: '2025-09-01T00:00:00Z' },
  { id: 'cls-4', name: 'Terminale G2', level: 'Terminale', series: 'Comptabilité & Gestion (G2)', academic_year: '2025-2026', is_active: true, created_at: '2025-09-01T00:00:00Z' },
  { id: 'cls-5', name: 'CAP 2 Électricité', level: 'Terminale', series: 'CAP Électricité Bâtiment', academic_year: '2025-2026', is_active: true, created_at: '2025-09-01T00:00:00Z' },
];

export const mockNews: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Rentrée Académique 2025-2026 : Inauguration des nouveaux ateliers de génie civil et électrotechnique',
    slug: 'rentree-academique-2025-2026',
    content: 'La rentrée solennelle de l’Institut Polytechnique LA PAIX s’est déroulée sous le signe de l’innovation technique. Les nouveaux ateliers spécialisés F3, F4 et CAP sont désormais ouverts pour offrir une formation pratique de premier ordre.',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    published_at: '2025-09-02T08:00:00Z',
    created_at: '2025-09-01T15:00:00Z',
    created_by: 'adm-1',
    author_name: 'Direction Générale IPP'
  },
  {
    id: 'news-2',
    title: 'Succès éclatant de nos étudiants en filières industrielles F2 et F3 au concours national',
    slug: 'succes-concours-industriel',
    content: 'Nos étudiants des filières Électronique et Électrotechnique se sont distingués lors des Olympiades Techniques Nationales. Félicitations à tous les lauréats.',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    published_at: '2025-10-15T10:30:00Z',
    created_at: '2025-10-14T09:00:00Z',
    created_by: 'adm-1',
    author_name: 'Département Technique'
  },
  {
    id: 'news-3',
    title: 'Campagne de Visite Médicale et Sécurité en Ateliers',
    slug: 'visite-medicale-securite',
    content: 'La sécurité en atelier étant notre priorité, la formation aux normes ISO et la visite médicale débuteront le 10 novembre pour toutes les classes industrielles et tertiaires.',
    image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    status: 'published',
    published_at: '2025-11-01T09:00:00Z',
    created_at: '2025-10-31T16:20:00Z',
    created_by: 'adm-1',
    author_name: 'Infirmerie IPP'
  }
];

export const mockEvents: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Salon des Métiers et de la Technologie IPP 2026',
    description: 'Exposition des projets de fin d’études de nos techniciens et ingénieurs en herbe. Rencontres avec les entreprises partenaires.',
    image_path: 'https://images.unsplash.com/photo-1564979291807-0209c1c045dd?auto=format&fit=crop&w=1000&q=80',
    location: 'Campus Principal - Grand Hall Technologique',
    start_at: '2026-04-15T09:00:00Z',
    end_at: '2026-04-15T17:00:00Z',
    status: 'upcoming',
    created_at: '2025-09-10T11:00:00Z'
  },
  {
    id: 'evt-2',
    title: 'Soutenances de Stages & Projets CAP & Techniques',
    description: 'Présentation des travaux pratiques devant le jury professionnel.',
    location: 'Amphithéâtre A',
    start_at: '2026-06-10T08:00:00Z',
    end_at: '2026-06-12T18:00:00Z',
    status: 'upcoming',
    created_at: '2025-10-01T08:00:00Z'
  }
];

export const mockResults: ResultItem[] = [
  {
    id: 'res-1',
    class_id: 'cls-1',
    class_name: 'Terminale F3',
    academic_year: '2025-2026',
    result_type: 'Trimestre 1',
    file_path: '/secure/results/terminale-f3-trimestre-1.pdf',
    file_name: 'resultats-terminale-f3-trimestre-1.pdf',
    status: 'published',
    published_at: '2025-12-20T10:00:00Z',
    created_at: '2025-12-19T15:00:00Z'
  },
  {
    id: 'res-2',
    class_id: 'cls-2',
    class_name: 'Terminale D',
    academic_year: '2025-2026',
    result_type: 'Trimestre 1',
    file_path: '/secure/results/terminale-d-trimestre-1.xlsx',
    file_name: 'resultats-terminale-d-trimestre-1.xlsx',
    status: 'published',
    published_at: '2025-12-20T10:30:00Z',
    created_at: '2025-12-19T16:00:00Z'
  }
];

export const mockDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Règlement Intérieur et Sécurité en Ateliers IPP',
    description: 'Consignes de sécurité, port des EPI et règles de vie au sein de l’institut.',
    file_path: '/docs/reglement-interieur-ipp.pdf',
    file_name: 'reglement-interieur-ipp.pdf',
    category: 'Règlement',
    is_public: true,
    created_at: '2025-09-01T00:00:00Z'
  },
  {
    id: 'doc-2',
    title: 'Calendrier des Examens et Travaux Pratiques 2025-2026',
    description: 'Planning officiel des sessions de TP, examens blancs et contrôles continus.',
    file_path: '/docs/calendrier-examens-ipp.pdf',
    file_name: 'calendrier-examens-ipp.pdf',
    category: 'Administratif',
    is_public: true,
    created_at: '2025-09-01T00:00:00Z'
  }
];

export const mockGallery: GalleryAlbum[] = [
  {
    id: 'alb-1',
    title: 'Ateliers Techniques & Laboratoires',
    description: 'Immersion dans nos ateliers d’électrotechnique, génie civil et informatique.',
    cover_image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    photos: [
      { id: 'p-1', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80', caption: 'Travaux pratiques en Électrotechnique (F3)' },
      { id: 'p-2', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80', caption: 'Laboratoire de Contrôle Industriel' }
    ],
    created_at: '2025-09-02T00:00:00Z'
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    user_id: 'usr-1',
    type: 'result',
    title: 'Nouveau résultat disponible',
    message: 'Les résultats du Trimestre 1 pour la classe Terminale F3 ont été publiés.',
    target_type: 'result',
    target_id: 'res-1',
    is_read: false,
    created_at: '2025-12-20T10:05:00Z'
  }
];

export const mockPreferences: NotificationPreferences = {
  user_id: 'usr-1',
  news_enabled: true,
  events_enabled: true,
  results_enabled: true,
  documents_enabled: true,
  calendar_enabled: true,
  system_enabled: true,
  updated_at: '2025-09-01T10:00:00Z'
};
