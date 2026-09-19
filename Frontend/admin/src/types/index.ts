export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
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

export interface EventItem {
  id: string;
  title: string;
  description: string;
  image_path?: string;
  location: string;
  start_at: string;
  end_at?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  level: string;
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
