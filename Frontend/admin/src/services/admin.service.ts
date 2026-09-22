const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Un token corrompu (non-JWT / non-ASCII) casserait fetch() avec
// "String contains non ISO-8859-1 code point" : on le purge et on
// continue sans Authorization (le backend répondra 401 + purge auto).
const JWT_RE = /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/;

function readAdminToken(): string | null {
  let token: string | null = null;
  try {
    token = localStorage.getItem('admin_token');
  } catch {
    return null;
  }
  if (!token) return null;
  if (!JWT_RE.test(token)) {
    try {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_logged');
    } catch {
      // ignore
    }
    return null;
  }
  return token;
}

async function adminFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = readAdminToken();
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  // Ne pas forcer Content-Type si FormData (laisser le navigateur le gérer)
  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (e: unknown) {
    throw new Error(e instanceof Error && e.message ? e.message : 'Erreur réseau. Vérifiez votre connexion.');
  }
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    // 401 = session morte : purger TOUT (token + flag) et renvoyer au login.
    // Note : 403 MFA_REQUIRED ne purge PAS (l'utilisateur est authentifié,
    // il doit juste compléter la 2e étape).
    if (response.status === 401 && token) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_logged');
      const base = import.meta.env.BASE_URL || '/';
      if (!window.location.pathname.endsWith('/login')) {
        window.location.assign(`${base}login`);
      }
    }
    const msg = json?.error?.message || json?.error || `Erreur ${response.status}`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  // Backend renvoie {success:true, data, pagination} -> on unwrap data
  if (json && typeof json === 'object' && 'data' in json) return json.data as T;
  return json as T;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'actualite';
}

export const adminService = {
  // News
  async getNews(): Promise<any[]> {
    const data = await adminFetch<any[]>('/admin/news?page=1&limit=100');
    return Array.isArray(data) ? data : [];
  },
  async createNews(data: { title: string; slug?: string; content: string; image_path?: string; status?: string }) {
    const payload = {
      title: data.title,
      slug: data.slug || slugify(data.title),
      content: data.content,
      image_path: data.image_path,
      status: data.status || 'published',
    };
    return adminFetch('/admin/news', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateNews(id: string, data: any) {
    return adminFetch(`/admin/news/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async deleteNews(id: string) {
    return adminFetch(`/admin/news/${id}`, { method: 'DELETE' });
  },

  // Events
  async getEvents() {
    const data = await adminFetch<any[]>('/admin/events?page=1&limit=100');
    return Array.isArray(data) ? data : [];
  },
  async createEvent(data: { title: string; description: string; location: string; start_at: string; status?: string }) {
    const payload = {
      title: data.title,
      description: data.description,
      location: data.location,
      start_at: new Date(data.start_at).toISOString(),
      status: data.status || 'published',
    };
    return adminFetch('/admin/events', { method: 'POST', body: JSON.stringify(payload) });
  },
  async deleteEvent(id: string) {
    return adminFetch(`/admin/events/${id}`, { method: 'DELETE' });
  },

  // Classes
  async getClasses() {
    const data = await adminFetch<any[]>('/admin/classes?page=1&limit=100');
    return Array.isArray(data) ? data : [];
  },
  async createClass(data: any) {
    return adminFetch('/admin/classes', { method: 'POST', body: JSON.stringify(data) });
  },
  async deleteClass(id: string) {
    return adminFetch(`/admin/classes/${id}`, { method: 'DELETE' });
  },

  // Results - upload via FormData
  async getResults() {
    const data = await adminFetch<any[]>('/admin/results?page=1&limit=100');
    return Array.isArray(data) ? data : [];
  },
  async createResult(data: { class_id: string; academic_year: string; result_type: string; file: File; status?: string }) {
    const fd = new FormData();
    fd.append('file', data.file);
    fd.append('class_id', data.class_id);
    fd.append('academic_year', data.academic_year);
    fd.append('result_type', data.result_type);
    fd.append('status', data.status || 'published');
    return adminFetch('/admin/results', { method: 'POST', body: fd });
  },
  async deleteResult(id: string) {
    return adminFetch(`/admin/results/${id}`, { method: 'DELETE' });
  },

  // Documents - via FormData si fichier, sinon JSON (pour compat)
  async getDocuments() {
    const data = await adminFetch<any[]>('/admin/documents?page=1&limit=100');
    return Array.isArray(data) ? data : [];
  },
  async createDocument(data: { title: string; description?: string; category?: string; visibility?: string; status?: string; file?: File }) {
    if (data.file) {
      const fd = new FormData();
      fd.append('file', data.file);
      fd.append('title', data.title);
      if (data.description) fd.append('description', data.description);
      if (data.category) fd.append('category', data.category);
      fd.append('visibility', data.visibility || 'public');
      fd.append('status', data.status || 'published');
      return adminFetch('/admin/documents', { method: 'POST', body: fd });
    }
    // fallback JSON (sans fichier) - backend va refuser mais on tente
    return adminFetch('/admin/documents', { method: 'POST', body: JSON.stringify(data) });
  },
  async deleteDocument(id: string) {
    return adminFetch(`/admin/documents/${id}`, { method: 'DELETE' });
  },

  // Gallery
  async getAlbums() {
    // backend public route, mais on passe par admin token si dispo
    const data = await adminFetch<any[]>('/gallery/albums?page=1&limit=100');
    return Array.isArray(data) ? data : [];
  },
  async getAlbumDetail(id: string) {
    return adminFetch(`/gallery/albums/${id}`);
  },
  async createAlbum(data: { title: string; description: string; cover_image_path?: string }) {
    const payload = {
      title: data.title,
      description: data.description,
      cover_image_path: data.cover_image_path,
    };
    return adminFetch('/admin/gallery/albums', { method: 'POST', body: JSON.stringify(payload) });
  },
  async deleteAlbum(id: string) {
    return adminFetch(`/admin/gallery/albums/${id}`, { method: 'DELETE' });
  },
  async uploadAlbumImage(albumId: string, file: File, caption?: string) {
    const fd = new FormData();
    fd.append('image', file);
    if (caption) fd.append('caption', caption);
    return adminFetch(`/admin/gallery/albums/${albumId}/images`, { method: 'POST', body: fd });
  },

  // Orientation — base de connaissances (visible côté client après modif)
  async getOrientationTopics() {
    const data = await adminFetch<any[]>('/admin/orientation/topics');
    return Array.isArray(data) ? data : [];
  },
  async createOrientationTopic(data: any) {
    return adminFetch('/admin/orientation/topics', { method: 'POST', body: JSON.stringify(data) });
  },
  async updateOrientationTopic(id: string, data: any) {
    return adminFetch(`/admin/orientation/topics/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async deleteOrientationTopic(id: string) {
    return adminFetch(`/admin/orientation/topics/${id}`, { method: 'DELETE' });
  },
  async getUnanswered(handled?: boolean) {
    const q = handled === undefined ? '' : `?handled=${handled}`;
    const data = await adminFetch<any[]>(`/admin/orientation/unanswered${q}`);
    return Array.isArray(data) ? data : [];
  },
  async markUnanswered(id: string, handled: boolean) {
    return adminFetch(`/admin/orientation/unanswered/${id}`, { method: 'PATCH', body: JSON.stringify({ handled }) });
  },
  async deleteUnanswered(id: string) {
    return adminFetch(`/admin/orientation/unanswered/${id}`, { method: 'DELETE' });
  },

  // Inscriptions — dossiers des familles
  async getApplications(status?: string) {
    const q = status ? `?status=${status}` : '';
    const data = await adminFetch<any[]>(`/admin/inscriptions${q}`);
    return Array.isArray(data) ? data : [];
  },
  async getApplication(id: string) {
    return adminFetch<any>(`/admin/inscriptions/${id}`);
  },
  async decideApplication(id: string, payload: { action: string; rendez_vous_at?: string; rendez_vous_message?: string; motif_refus?: string }) {
    return adminFetch(`/admin/inscriptions/${id}/decide`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
  async deleteApplication(id: string) {
    return adminFetch(`/admin/inscriptions/${id}`, { method: 'DELETE' });
  },
  async getInscriptionCounts(): Promise<{ soumis: number; verifie: number; convoque: number; refuse: number; admis: number; unseen: number }> {
    const data = await adminFetch<any>('/admin/inscriptions/counts');
    return {
      soumis: data?.soumis || 0,
      verifie: data?.verifie || 0,
      convoque: data?.convoque || 0,
      refuse: data?.refuse || 0,
      admis: data?.admis || 0,
      unseen: data?.unseen || 0,
    };
  },
};
