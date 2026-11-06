import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { api, queryKeys } from '../services/api';
import type { ArticleSummary, Category, Paginated } from '../types';
import { useSeo } from '../hooks/useSeo';
import { PageHero } from '../components/site/PageHero';
import { ArticleCard } from '../components/site/cards';
import { cn } from '../utils';
import { CTASection } from '../components/site/sections';

interface ArticlesResponse extends Paginated<ArticleSummary> {
  categories: Category[];
}

export default function NewsPage() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.articles({ category, search: query, page }),
    queryFn: () =>
      api.get<ArticlesResponse>(
        `/public/articles?limit=9&page=${page}${category !== 'all' ? `&category=${category}` : ''}${
          query ? `&search=${encodeURIComponent(query)}` : ''
        }`
      ),
  });

  useSeo({
    title: 'Actualités & conseils',
    description:
      'Conseils pratiques et actualités d’ACES Global Services : vidéosurveillance, contrôle d’accès, énergie solaire et sécurité incendie.',
    image: '/assets/images/articles/article-3.jpg',
    canonicalPath: '/actualites',
  });

  const categories = data?.categories ?? [];
  const articles = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <PageHero
        eyebrow="Actualités & conseils"
        title="Comprendre avant d’équiper"
        subtitle="Des articles courts et concrets pour vous aider à choisir, dimensionner et entretenir vos installations."
        image="/assets/images/articles/article-3.jpg"
        breadcrumbs={[{ label: 'Actualités' }]}
        size="compact"
      />

      <section className="section bg-white">
        <div className="container">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setCategory('all');
                  setPage(1);
                }}
                className={cn('chip', category === 'all' && 'chip-active')}
              >
                Tous les articles
              </button>
              {categories.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => {
                    setCategory(item.slug);
                    setPage(1);
                  }}
                  className={cn('chip', category === item.slug && 'chip-active')}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <form
              className="relative w-full lg:w-72"
              onSubmit={(event) => {
                event.preventDefault();
                setQuery(search);
                setPage(1);
              }}
            >
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-10"
                placeholder="Rechercher un article…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Rechercher un article"
              />
            </form>
          </div>

          {isLoading ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="card overflow-hidden">
                  <div className="skeleton aspect-[16/10]" />
                  <div className="space-y-3 p-6">
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-4 w-11/12" />
                    <div className="skeleton h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-aces-mist/40 p-14 text-center">
              <p className="font-display text-lg font-semibold text-navy">Aucun article trouvé</p>
              <p className="mt-2 text-sm text-ink-soft">
                Essayez une autre catégorie ou un autre mot-clé.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 ? (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={pagination.page <= 1}
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-navy disabled:opacity-40"
                aria-label="Page précédente"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: pagination.totalPages }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPage(index + 1)}
                  className={cn(
                    'h-10 min-w-10 rounded-lg border px-3 text-[13px] font-medium transition-colors',
                    pagination.page === index + 1
                      ? 'border-aces-blue bg-aces-blue text-white'
                      : 'border-slate-200 text-navy hover:border-aces-blue'
                  )}
                >
                  {index + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-navy disabled:opacity-40"
                aria-label="Page suivante"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <CTASection />
    </>
  );
}
