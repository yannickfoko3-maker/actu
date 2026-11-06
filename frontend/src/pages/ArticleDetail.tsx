import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Check, Clock, Copy, Facebook, Linkedin, Share2 } from 'lucide-react';
import { useState } from 'react';
import { api, queryKeys } from '../services/api';
import type { Article } from '../types';
import { useSeo } from '../hooks/useSeo';
import { useSite } from '../contexts/SiteContext';
import { PageHero } from '../components/site/PageHero';
import { ArticleCard } from '../components/site/cards';
import { CTASection } from '../components/site/sections';
import { NotFoundContent } from './NotFound';
import { formatDate } from '../utils';

export default function ArticleDetail() {
  const { slug = '' } = useParams();
  const { setting } = useSite();
  const [copied, setCopied] = useState(false);

  const { data: article, isLoading, isError } = useQuery({
    queryKey: queryKeys.article(slug),
    queryFn: () => api.get<Article>(`/public/articles/${slug}`),
    enabled: Boolean(slug),
  });

  useSeo({
    title: article?.seoTitle || article?.title || 'Article',
    description: article?.seoDescription || article?.excerpt,
    image: article?.coverImage,
    type: 'article',
    canonicalPath: `/actualites/${slug}`,
    jsonLd: article
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: article.title,
          description: article.excerpt,
          image: `${window.location.origin}${article.coverImage}`,
          datePublished: article.publishedAt,
          author: { '@type': 'Organization', name: article.author || setting('company.name') },
          publisher: { '@type': 'Organization', name: setting('company.name') },
        }
      : undefined,
  });

  if (isLoading) {
    return (
      <>
        <PageHero title="Chargement de l’article…" breadcrumbs={[{ label: 'Actualités', href: '/actualites' }]} />
        <div className="container section">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="skeleton h-5 w-2/3" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-11/12" />
            <div className="skeleton h-64 rounded-2xl" />
          </div>
        </div>
      </>
    );
  }

  if (isError || !article) {
    return <NotFoundContent title="Article introuvable" description="Cet article n’existe pas ou n’est plus publié." />;
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow={article.category?.name ?? 'Actualité'}
        title={article.title}
        subtitle={article.excerpt}
        image={article.coverImage}
        breadcrumbs={[
          { label: 'Actualités', href: '/actualites' },
          { label: article.title },
        ]}
      >
        <div className="flex flex-wrap items-center gap-4 text-[12.5px] text-white/70">
          {article.publishedAt ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} className="text-aces-gold" />
              {formatDate(article.publishedAt)}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} className="text-aces-gold" />
            {article.readingTime} min de lecture
          </span>
          <span className="text-white/50">Par {article.author}</span>
        </div>
      </PageHero>

      <section className="section bg-white">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <img
              src={article.coverImage}
              alt={article.title}
              className="aspect-[16/9] w-full rounded-2xl object-cover shadow-soft"
              loading="eager"
            />

            <div className="rich-text mt-10" dangerouslySetInnerHTML={{ __html: article.content }} />

            {article.tags.length > 0 ? (
              <div className="mt-10 flex flex-wrap items-center gap-2">
                <span className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Tags</span>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-aces-mist/60 px-3 py-1 text-[11.5px] text-ink-soft"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Share2 size={15} className="text-ink-soft" />
                <span className="text-[12.5px] font-semibold text-navy">Partager</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-medium text-navy transition-colors hover:border-aces-blue hover:text-aces-blue"
                >
                  <Facebook size={14} />
                  Facebook
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-medium text-navy transition-colors hover:border-aces-blue hover:text-aces-blue"
                >
                  <Linkedin size={14} />
                  LinkedIn
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${article.title} — ${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-medium text-navy transition-colors hover:border-[#25D366] hover:text-[#128C7E]"
                >
                  WhatsApp
                </a>
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-medium text-navy transition-colors hover:border-aces-blue hover:text-aces-blue"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  {copied ? 'Lien copié' : 'Copier le lien'}
                </button>
              </div>
            </div>

            <div className="mt-10">
              <Link to="/actualites" className="inline-flex items-center gap-2 text-[13px] font-semibold text-aces-blue">
                <ArrowLeft size={15} />
                Retour aux actualités
              </Link>
            </div>
          </div>
        </div>
      </section>

      {article.related && article.related.length > 0 ? (
        <section className="section-tight bg-aces-mist/60">
          <div className="container">
            <h2 className="text-[1.4rem] font-semibold text-navy">À lire également</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {article.related.map((item) => (
                <ArticleCard key={item.id} article={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CTASection />
    </>
  );
}
