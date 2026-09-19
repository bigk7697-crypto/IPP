import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-900 rounded-xl flex items-center justify-center text-white">
                <GraduationCap className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight block">IPP LA PAIX</span>
                <span className="text-[10px] text-amber-400 font-bold uppercase">Institut Polytechnique</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Excellence technique, professionnelle et générale. Formant les leaders et techniciens hautement qualifiés de demain.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigation Rapide</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/ecole" className="hover:text-white transition-colors">L’Institut</Link></li>
              <li><Link to="/formations" className="hover:text-white transition-colors">Formations & Séries</Link></li>
              <li><Link to="/actualites" className="hover:text-white transition-colors">Actualités</Link></li>
              <li><Link to="/evenements" className="hover:text-white transition-colors">Événements</Link></li>
              <li><Link to="/galerie" className="hover:text-white transition-colors">Galerie Photo</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Ressources & Espace</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/documents" className="hover:text-white transition-colors">Documents & Règlements</Link></li>
              <li><Link to="/calendrier" className="hover:text-white transition-colors">Calendrier Scolaire</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Nous Contacter</Link></li>
              <li><Link to="/connexion" className="hover:text-white transition-colors">Espace Utilisateur</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Coordonnées</h3>
            <div className="flex items-start gap-3 text-sm text-slate-400">
              <MapPin className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
              <span>Avenue de la Paix, Quartier Résidentiel, BP 4521</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Phone className="w-5 h-5 text-brand-500 shrink-0" />
              <span>+228 22 40 50 60 / 90 10 20 30</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Mail className="w-5 h-5 text-brand-500 shrink-0" />
              <span>contact@ipp-lapaix.edu</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Clock className="w-5 h-5 text-brand-500 shrink-0" />
              <span>Lun - Ven : 07h30 - 18h00</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 IPP (Institut Polytechnique LA PAIX). Tous droits réservés.</p>
          <p className="mt-4 sm:mt-0">Plateforme Scolaire V1 — Excellence Technique & Générale</p>
        </div>
      </div>
    </footer>
  );
};
