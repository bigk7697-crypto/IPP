import React, { useState } from 'react';
import { User, Mail, Calendar, ShieldCheck, Edit3, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
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

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
        <div className="flex justify-between items-center border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-brand-500/30">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.first_name} {user?.last_name}</h2>
              <p className="text-xs text-brand-600 font-semibold uppercase tracking-wider mt-0.5">Rôle : {user?.role}</p>
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
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
            >
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
