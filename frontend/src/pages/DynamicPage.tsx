import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, queryKeys } from '../services/api';
import type { PageContent } from '../types';
import { useSeo } from '../hooks/useSeo';
import { PageHero } from '../components/site/PageHero';
import { formatDate } from '../utils';
import { NotFoundContent } from './NotFound';

/** Pages éditoriales gérées depuis le back-office (mentions légales, confidentialité…). */
export default function DynamicPage() {
  const { slug = '' } = useParams();

  const { data: page, isLoading, isError } = useQuery({
    queryKey: queryKeys.page(slug),
    queryFn: () => api.get<PageContent>(`/public/pages/${slug}`),
    enabled: Boolean(slug),
    retry: false,
  });

  useSeo({
    title: page?.seoTitle || page?.title || 'Informations',
    description: page?.seoDescription ?? page?.subtitle ?? undefined,
    image: page?.heroImage ?? undefined,
    canonicalPath: `/${slug}`,
  });

  if (isLoading) {
    return (
      <>
        <PageHero title="Chargement…" />
        <div className="container section">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="skeleton h-5 w-1/2" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-11/12" />
          </div>
        </div>
      </>
    );
  }

  if (isError || !page) {
    return (
      <NotFoundContent
        title="Page introuvable"
        description="Cette page n’existe pas ou n’est pas publiée. Consultez nos prestations ou contactez-nous directement."
      />
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Informations"
        title={page.title}
        subtitle={page.subtitle ?? undefined}
        image={page.heroImage ?? '/assets/images/hero/hero-5.jpg'}
        breadcrumbs={[{ label: page.title }]}
        size="compact"
      />
      <section className="section bg-white">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="rich-text" dangerouslySetInnerHTML={{ __html: page.content }} />
            {page.updatedAt ? (
              <p className="mt-10 border-t border-slate-200 pt-5 text-[11.5px] text-ink-soft">
                Dernière mise à jour : {formatDate(page.updatedAt)}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
