import React from 'react';
import { ShieldCheck, Award, BookOpen, Users, CheckCircle2 } from 'lucide-react';

export const School: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-900 text-xs font-bold tracking-wide uppercase border border-brand-100">
          Institut Polytechnique LA PAIX
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">L'Institut & Nos Valeurs</h1>
        <p className="text-lg text-slate-600">
          De l'enseignement secondaire général aux filières techniques industrielles et tertiaires d'excellence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Notre Mission & Pédagogie</h2>
          <p className="text-slate-600 leading-relaxed">
            Fondé avec l'ambition de former des techniciens et bacheliers hautement qualifiés, l'Institut Polytechnique LA PAIX (IPP) offre un cadre d'apprentissage moderne équipé d'ateliers spécialisés (Électrotechnique, Génie Civil, Électronique, Informatique et Bureautique).
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand-700 shrink-0" />
              <span className="text-slate-700 font-medium">Ateliers techniques et laboratoires informatiques de pointe</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand-700 shrink-0" />
              <span className="text-slate-700 font-medium">Formations professionnelles reconnues (CAP et Séries F/G)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand-700 shrink-0" />
              <span className="text-slate-700 font-medium">Partenariats étroits avec les entreprises et industries de la région</span>
            </div>
          </div>
        </div>
        <div>
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80"
            alt="School Building"
            className="rounded-3xl shadow-xl object-cover h-96 w-full border border-slate-200"
          />
        </div>
      </div>

      <div className="bg-brand-900 text-white rounded-3xl p-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center shadow-xl">
        <div className="space-y-2">
          <ShieldCheck className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-xl font-bold">Rigueur & Discipline</h3>
          <p className="text-sm text-slate-300">Le respect des normes professionnelles et éthiques au cœur de notre formation.</p>
        </div>
        <div className="space-y-2">
          <Award className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-xl font-bold">Savoir-Faire Pratique</h3>
          <p className="text-sm text-slate-300">Un enseignement axé sur la maîtrise des outils et des technologies industrielles.</p>
        </div>
        <div className="space-y-2">
          <BookOpen className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-xl font-bold">Insertion Assurée</h3>
          <p className="text-sm text-slate-300">Des filières adaptées aux besoins réels du marché de l'emploi et de l'industrie.</p>
        </div>
      </div>
    </div>
  );
};
