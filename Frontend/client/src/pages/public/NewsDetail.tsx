import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import { newsService } from '../../services/news.service';
import { NewsItem } from '../../types';

export const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (id) {
        const item = await newsService.getNewsById(id);
        if (item) setNews(item);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="text-center py-32 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Actualité introuvable</h2>
        <Link to="/actualites" className="text-brand-600 font-medium hover:underline">← Retour aux actualités</Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div>
        <Link to="/actualites" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-600 mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux actualités</span>
        </Link>
        <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full uppercase tracking-wider">
          Actualité Officielle
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-4">
          {news.title}
        </h1>
        <div className="flex items-center gap-6 mt-4 text-sm text-slate-500 border-y border-slate-200 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>{new Date(news.published_at || news.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            <span>{news.author_name || 'Direction'}</span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden shadow-lg h-96">
        <img src={news.image_url} alt={news.title} className="w-full h-full object-cover" />
      </div>

      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6 text-lg">
        <p>{news.content}</p>
        <p>
          L'administration reste à la entière disposition des parents et des élèves pour toute information complémentaire relative à cette publication.
        </p>
      </div>
    </article>
  );
};
