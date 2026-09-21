import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, GraduationCap, Compass, MessageCircle } from 'lucide-react';

export const Formations: React.FC = () => {
  const programs = [
    {
      title: 'Série A4 — Lettres, Arts & Sciences Humaines',
      level: 'Enseignement Secondaire Général',
      description: 'Développement de l’esprit critique à travers la littérature, la philosophie, l’histoire-géographie et les langues vivantes.',
      outcomes: ['Facultés de Droit', 'Lettres & Sciences Humaines', 'Journalisme', 'Relations Internationales']
    },
    {
      title: 'Série D — Sciences Expérimentales & Agronomie',
      level: 'Enseignement Secondaire Général & Scientifique',
      description: 'Focus sur les sciences de la vie et de la terre, la physique et la chimie. Idéal pour les carrières médicales et biologiques.',
      outcomes: ['Facultés de Médecine', 'Pharmacie', 'Agronomie', 'Biotechnologie']
    },
    {
      title: 'Série F2 — Électronique & Informatique Industrielle',
      level: 'Enseignement Technique Industriel',
      description: 'Étude des circuits électroniques, des systèmes automatisés, des microcontrôleurs et de la maintenance informatique.',
      outcomes: ['Technicien Supérieur en Électronique', 'Maintenance Réseaux & Systèmes', 'BTS Industriel']
    },
    {
      title: 'Série F3 — Électrotechnique',
      level: 'Enseignement Technique Industriel',
      description: 'Maîtrise de la production, du transport, de la distribution et de l’utilisation de l’énergie électrique industrielle et domestique.',
      outcomes: ['Électrotechnicien', 'Installateur Industriel', 'BTS Électrotechnique']
    },
    {
      title: 'Série F4 — Génie Civil & Bâtiment',
      level: 'Enseignement Technique Industriel',
      description: 'Conception, calcul de structures, dessin technique (DAO/CAO) et conduite de chantiers de construction.',
      outcomes: ['Conducteur de Travaux', 'Dessinateur Projeteur BTP', 'BTS Génie Civil']
    },
    {
      title: 'Série G1 — Techniques Administratives & Secrétariat',
      level: 'Enseignement Tertiaire & Bureautique',
      description: 'Formation aux métiers du secrétariat de direction, de la communication professionnelle et de la gestion administrative.',
      outcomes: ['Secrétaire de Direction', 'Assistant de Gestion', 'BTS Bureautique']
    },
    {
      title: 'Série G2 — Sciences & Techniques Comptables / Gestion',
      level: 'Enseignement Tertiaire',
      description: 'Comptabilité générale et analytique, fiscalité, droit des affaires et outils informatiques de gestion financière.',
      outcomes: ['Assistant Comptable', 'Gestionnaire de Paie', 'BTS Comptabilité & Gestion']
    },
    {
      title: 'Série G3 — Techniques Commerciales & Action Commerciale',
      level: 'Enseignement Tertiaire',
      description: 'Marketing, négociation vente, relation client, techniques d’exportation et gestion de la force de vente.',
      outcomes: ['Commercial / Technico-commercial', 'Assistant Marketing', 'BTS Action Commerciale']
    },
    {
      title: 'CAP Maçonnerie',
      level: 'Certificat d’Aptitude Professionnelle (CAP)',
      description: 'Formation professionnelle pratique aux techniques de gros œuvre, maçonnerie, coffrage, ferraillage et pose de revêtements.',
      outcomes: ['Maçon Qualifié', 'Chef d’équipe BTP', 'Insertion professionnelle immédiate']
    },
    {
      title: 'CAP Électricité Bâtiment',
      level: 'Certificat d’Aptitude Professionnelle (CAP)',
      description: 'Apprentissage des techniques d’installation électrique résidentielle, câblage de tableaux, mise en conformité et sécurité.',
      outcomes: ['Électricien Installateur', 'Technicien de Maintenance Bâtiment', 'Insertion professionnelle']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-900 text-xs font-bold tracking-wide uppercase border border-brand-100">
          IPP LA PAIX — Offre de Formation Complète
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Nos Formations & Séries</h1>
        <p className="text-lg text-slate-600">
          Un enseignement de pointe alliant théorie rigoureuse et pratique en ateliers professionnels.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {programs.map((prog, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-brand-50 text-brand-900 rounded-2xl flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6 text-brand-700" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">{prog.level}</span>
              <h3 className="text-xl font-bold text-slate-900">{prog.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{prog.description}</p>
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold uppercase text-slate-400">Débouchés & Poursuite d'études :</p>
              <div className="flex flex-wrap gap-2">
                {prog.outcomes.map((out, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">
                    {out}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-brand-900 rounded-3xl p-8 sm:p-10 text-center space-y-4">
        <h2 className="text-2xl font-extrabold text-white">Hésite entre plusieurs filières ?</h2>
        <p className="text-slate-300 text-sm max-w-xl mx-auto">Fais le quiz d’orientation en 2 minutes ou pose ta question à l’assistant — sans créer de compte.</p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to="/orientation" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-brand-950 text-sm font-bold rounded-2xl transition-colors">
            <Compass className="w-4 h-4" /> Faire le quiz
          </Link>
          <Link to="/orientation?tab=assistant" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-2xl border border-white/20 transition-colors">
            <MessageCircle className="w-4 h-4" /> Poser une question
          </Link>
        </div>
      </div>
    </div>
  );
};
