import React, { useState, useRef } from 'react';
import { Mail, Calendar, Edit3, CheckCircle2, Upload, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../services/supabaseClient';
import { apiFetch } from '../../services/apiClient';
import { UserProfile } from '../../types';

export const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // sync when user changes (e.g. after initAuth)
  React.useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Image trop volumineuse (max 2 Mo).');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `avatars/${user.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('public-assets').getPublicUrl(path);
      // cache-bust
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      const updated = await apiFetch<UserProfile>('/profile', {
        method: 'PATCH',
        body: JSON.stringify({ avatar_url: publicUrl }),
      });
      setAvatarUrl(publicUrl);
      // update store + localStorage
      useAuthStore.setState({ user: updated } as any);
      localStorage.setItem('school_user', JSON.stringify(updated));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec upload avatar.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('Prénom et nom requis.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await apiFetch<UserProfile>('/profile', {
        method: 'PATCH',
        body: JSON.stringify({ first_name: firstName.trim(), last_name: lastName.trim() }),
      });
      useAuthStore.setState({ user: updated } as any);
      localStorage.setItem('school_user', JSON.stringify(updated));
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec sauvegarde profil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mon Profil</h1>
        <p className="text-slate-600 mt-1">Gérez vos informations personnelles et consultez les détails de votre compte.</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profil mis à jour avec succès.</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
        <div className="flex justify-between items-center border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover shadow-lg shadow-brand-500/30 border border-slate-200" />
              ) : (
                <div className="w-16 h-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-brand-500/30">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white text-xs font-semibold"
                title="Changer la photo"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.first_name} {user?.last_name}</h2>
              <p className="text-xs text-brand-600 font-semibold uppercase tracking-wider mt-0.5">Rôle : {user?.role}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-1 text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                {uploading ? 'Upload...' : 'Changer la photo'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? 'Annuler' : 'Modifier le profil'}</span>
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Prénom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nom</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Enregistrer les modifications
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
              <p className="text-xs text-slate-400 font-medium">Adresse e-mail</p>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-600" />
                <span>{user?.email}</span>
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
              <p className="text-xs text-slate-400 font-medium">Date de création du compte</p>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
