export type Role = 'visitor' | 'user' | 'admin';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string;
}

export type NewsStatus = 'draft' | 'published' | 'archived';

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url: string;
  status: NewsStatus;
  published_at?: string;
  created_at: string;
  created_by: string;
  author_name?: string;
}

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  image_path?: string;
  location: string;
  start_at: string;
  end_at?: string;
  status: EventStatus;
  created_at: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  level: 'Seconde' | 'Première' | 'Terminale' | '6eme' | '5eme' | '4eme' | '3eme';
  series: string;
  academic_year: string;
  is_active: boolean;
  created_at: string;
}

export interface ResultItem {
  id: string;
  class_id: string;
  class_name?: string;
  academic_year: string;
  result_type: 'Trimestre 1' | 'Trimestre 2' | 'Trimestre 3' | 'Résultats Annuels' | 'Examen Blanc';
  file_path: string;
  file_name: string;
  status: 'published' | 'draft';
  published_at: string;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  file_path: string;
  file_name: string;
  category: 'Règlement' | 'Administratif' | 'Pédagogique' | 'Communiqué' | 'Formulaire';
  is_public: boolean;
  created_at: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  photos: { id: string; url: string; caption: string }[];
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: 'news' | 'event' | 'result' | 'document' | 'calendar' | 'system';
  title: string;
  message: string;
  target_type: string;
  target_id: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  news_enabled: boolean;
  events_enabled: boolean;
  results_enabled: boolean;
  documents_enabled: boolean;
  calendar_enabled: boolean;
  system_enabled: boolean;
  updated_at: string;
}
