import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Calendar, FileSpreadsheet, FolderOpen, Users, ShieldCheck, ClipboardList, ArrowRight } from 'lucide-react';
import { adminService } from '../services/admin.service';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ news: 0, events: 0, results: 0, documents: 0, classes: 0 });
  const [pendingInscriptions, setPendingInscriptions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [n, e, r, d, c, ins] = await Promise.all([
        adminService.getNews(),
        adminService.getEvents(),
        adminService.getResults(),
        adminService.getDocuments(),
        adminService.getClasses(),
        adminService.getInscriptionCounts().catch(() => ({ soumis: 0 }))
      ]);
      setStats({
        news: n.length,
        events: e.length,
        results: r.length,
        documents: d.length,
        classes: c.length
      });
      setPendingInscriptions((ins as any).soumis || 0);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-brand-900 text-white p-8 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="space-y-2">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-full uppercase tracking-wider border border-amber-400/30">
            Portail Officiel de Gestion
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Tableau de Bord Administrateur</h1>
          <p className="text-slate-300 text-sm">Supervision centralisée des publications, documents et résultats scolaires.</p>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-white/10 px-4 py-3 rounded-2xl border border-white/10">
          <ShieldCheck className="w-8 h-8 text-amber-400" />
          <div>
            <p className="text-xs text-slate-300">Sécurité & RLS</p>
            <p className="text-sm font-bold text-white">Actif & Vérifié</p>
          </div>
        </div>
      </div>

      {pendingInscriptions > 0 && (
        <Link to="/inscriptions" className="flex items-center gap-4 bg-amber-500/10 border border-amber-400/40 rounded-3xl p-5 hover:bg-amber-500/20 transition-colors">
          <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-amber-300 font-extrabold text-lg">{pendingInscriptions} dossier{pendingInscriptions > 1 ? 's' : ''} en attente de vérification</p>
            <p className="text-amber-200/70 text-xs">Cliquez pour ouvrir et vérifier</p>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-300" />
        </Link>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase font-bold tracking-wider">Actualités</span>
            <Newspaper className="w-5 h-5 text-brand-700" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.news}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase font-bold tracking-wider">Événements</span>
            <Calendar className="w-5 h-5 text-brand-700" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.events}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase font-bold tracking-wider">Résultats</span>
            <FileSpreadsheet className="w-5 h-5 text-brand-700" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.results}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs uppercase font-bold tracking-wider">Documents</span>
            <FolderOpen className="w-5 h-5 text-brand-700" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.documents}</p>
        </div>
      </div>
    </div>
  );
};
