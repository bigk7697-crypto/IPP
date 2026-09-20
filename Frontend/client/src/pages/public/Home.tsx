import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Calendar as CalendarIcon, Users, Award, ShieldCheck, Download, ChevronRight } from 'lucide-react';
import { newsService } from '../../services/news.service';
import { eventService } from '../../services/event.service';
import { galleryService } from '../../services/gallery.service';
import { documentService } from '../../services/document.service';
import { NewsItem, EventItem, GalleryAlbum, DocumentItem } from '../../types';

export const Home: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [n, e, a, d] = await Promise.all([
          newsService.getNews(),
          eventService.getEvents(),
          galleryService.getAlbums(),
          documentService.getDocuments()
        ]);
        setNews(n.slice(0, 3));
        setEvents(e.slice(0, 3));
        setAlbums(a.slice(0, 2));
        setDocuments(d.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2000&q=80"
            alt="School campus"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-400 text-xs font-semibold tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Excellence & Rigueur Académique</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Façonner l'élite scientifique et technique de demain
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Bienvenue au Lycée Polytechnique LA PAIX. Une institution d'enseignement secondaire offrant un encadrement rigoureux, des laboratoires de pointe et un suivi personnalisé.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/formations"
                className="flex items-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all"
              >
                <span>Découvrir nos formations</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl backdrop-blur-sm border border-white/10 transition-all"
              >
                <span>Nous contacter</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques clés */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">1,250</p>
              <p className="text-xs text-slate-500 font-medium uppercase">Élèves inscrits</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">98.5%</p>
              <p className="text-xs text-slate-500 font-medium uppercase">Taux de réussite</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">8 Séries</p>
              <p className="text-xs text-slate-500 font-medium uppercase">Formations adaptées</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">25 Ans</p>
              <p className="text-xs text-slate-500 font-medium uppercase">D'expérience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Présentation École */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest">Mot de la Direction</h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              Une institution dédiée à l’épanouissement intellectuel et moral
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Fondé sur des valeurs d'intégrité, de rigueur et d'innovation, le Lycée Polytechnique LA PAIX offre un cadre d'apprentissage stimulant. Nos enseignants hautement qualifiés guident chaque élève pour révéler son plein potentiel dans les disciplines scientifiques, littéraires et techniques.
            </p>
            <div className="pt-2">
              <Link
                to="/ecole"
                className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700 transition-colors"
              >
                <span>En savoir plus sur l'établissement</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80"
              alt="Students"
              className="rounded-2xl shadow-lg object-cover h-64 w-full"
            />
            <img
              src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80"
              alt="Science Lab"
              className="rounded-2xl shadow-lg object-cover h-64 w-full mt-8"
            />
          </div>
        </div>
      </section>

      {/* Dernières Actualités */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">Actualités</h2>
            <h3 className="text-3xl font-bold text-slate-950 tracking-tight">Les dernières nouvelles du lycée</h3>
          </div>
          <Link
            to="/actualites"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <span>Voir toutes les actualités</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item) => (
            <Link
              key={item.id}
              to={`/actualites/${item.id}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-200 flex flex-col"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                  Actualité
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <p className="text-xs text-slate-400 mb-2">
                    {new Date(item.published_at || item.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                    {item.content}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-brand-600 pt-2">
                  <span>Lire la suite</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Prochains Événements */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">Agenda</h2>
              <h3 className="text-3xl font-bold tracking-tight">Prochains événements</h3>
            </div>
            <Link
              to="/evenements"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-400 hover:text-brand-300"
            >
              <span>Voir tout le calendrier</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold">
                      Événement
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(event.start_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg text-white">{event.title}</h4>
                  <p className="text-sm text-slate-300 line-clamp-3">{event.description}</p>
                </div>
                <div className="pt-4 border-t border-slate-700 text-xs text-slate-400 flex items-center justify-between">
                  <span>📍 {event.location}</span>
                  <Link to={`/evenements/${event.id}`} className="text-brand-400 font-semibold hover:underline">
                    Détails →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents Récents */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">Ressources</h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Documents administratifs récents</h3>
          </div>
          <Link
            to="/documents"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <span>Accéder à la bibliothèque</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-brand-50 text-brand-600 rounded-xl shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  {doc.category}
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{doc.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{doc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
