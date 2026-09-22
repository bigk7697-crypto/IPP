import { apiFetch } from './apiClient';

export type Niveau = '6eme' | '5eme' | '4eme' | '3eme' | 'Seconde' | 'Premiere' | 'Terminale' | 'CAP';

export const NIVEAUX: { value: Niveau; label: string }[] = [
  { value: '6eme', label: '6ème' },
  { value: '5eme', label: '5ème' },
  { value: '4eme', label: '4ème' },
  { value: '3eme', label: '3ème' },
  { value: 'Seconde', label: 'Seconde' },
  { value: 'Premiere', label: 'Première' },
  { value: 'Terminale', label: 'Terminale' },
  { value: 'CAP', label: 'CAP (pro)' },
];

export type DossierStatus = 'soumis' | 'verifie' | 'convoque' | 'refuse' | 'admis';

export interface DossierSuivi {
  id?: string;
  reference: string;
  first_name: string;
  niveau: string;
  filiere_slug: string | null;
  status: DossierStatus;
  rendez_vous_at: string | null;
  rendez_vous_message: string;
  motif_refus: string;
  updated_at: string;
}

export interface SubmitResult {
  id: string;
  reference: string;
}

export const STATUS_LABEL: Record<DossierStatus, string> = {
  soumis: 'Dossier reçu',
  verifie: 'Dossier vérifié',
  convoque: 'Convoqué — rendez-vous fixé',
  refuse: 'Dossier refusé',
  admis: 'Admis — bienvenue !',
};

export const inscriptionService = {
  async submit(form: FormData): Promise<SubmitResult> {
    return apiFetch<SubmitResult>('/inscriptions/submit', { method: 'POST', body: form });
  },

  async track(reference: string): Promise<DossierSuivi> {
    const ref = reference.trim().toUpperCase();
    return apiFetch<DossierSuivi>(`/inscriptions/track/${encodeURIComponent(ref)}`);
  },

  async mine(): Promise<DossierSuivi[]> {
    const remote = await apiFetch<DossierSuivi[]>('/inscriptions/mine');
    return Array.isArray(remote) ? remote : [];
  },
};
