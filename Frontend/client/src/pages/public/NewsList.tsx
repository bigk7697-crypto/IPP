import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Calendar } from 'lucide-react';
import { newsService } from '../../services/news.service';
import { resolveImageUrl } from '../../utils/images';
import { useRealtime } from '../../hooks/useRealtime';
import { NewsItem } from '../../types';

export const NewsList: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [rtick, setRtick] = useState(0);

  // Une actu publiée apparaît sans rechargement.
  useRealtime('news', undefined, () => setRtick((t) => t + 1), true);

  useEffect(() => {
    async function load() {
      const data = await newsService.getNews();
      setNews(data);
      setLoading(false);
    }
    load();
  }, [rtick]);

  const filteredNews = news.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Actualités & Annonces</h1>
          <p className="text-slate-600 mt-2">Restez informés de la vie de l'établissement et des temps forts de l'année scolaire.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une actualité..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500">Aucune actualité ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredNews.map((item) => (
            <Link
              key={item.id}
              to={`/actualites/${item.id}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-200 flex flex-col"
            >
              {(() => {
                const url = resolveImageUrl(item.image_url || item.image_path);
                if (!url) return null;
                return (
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                );
              })()}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.published_at || item.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 text-lg">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-3">
                    {item.content}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-brand-600 pt-2">
                  <span>Lire l'article</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
