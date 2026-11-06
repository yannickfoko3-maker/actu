import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Building2, CalendarDays, MapPin, MessageCircle, Tag } from 'lucide-react';
import { api, queryKeys } from '../services/api';
import type { Project } from '../types';
import { useSeo } from '../hooks/useSeo';
import { useSite } from '../contexts/SiteContext';
import { PageHero } from '../components/site/PageHero';
import { Reveal } from '../components/ui/Reveal';
import { Lightbox } from '../components/ui/Lightbox';
import { CTASection } from '../components/site/sections';
import { NotFoundContent } from './NotFound';
import { ServiceIcon } from '../components/ui/ServiceIcon';

export default function ProjectDetail() {
  const { slug = '' } = useParams();
  const { whatsapp } = useSite();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: project, isLoading, isError } = useQuery({
    queryKey: queryKeys.project(slug),
    queryFn: () => api.get<Project>(`/public/projects/${slug}`),
    enabled: Boolean(slug),
  });

  useSeo({
    title: project?.title ?? 'Réalisation',
    description: project?.summary,
    image: project?.coverImage,
    canonicalPath: `/nos-realisations/${slug}`,
  });

  if (isLoading) {
    return (
      <>
        <PageHero title="Chargement…" breadcrumbs={[{ label: 'Nos réalisations', href: '/nos-realisations' }]} />
        <div className="container section">
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </>
    );
  }

  if (isError || !project) {
    return <NotFoundContent title="Réalisation introuvable" description="Cette fiche n’existe pas ou n’est plus publiée." />;
  }

  const gallery = project.images.length
    ? project.images
    : [{ url: project.coverImage, alt: project.title }];

  return (
    <>
      <PageHero
        eyebrow={project.service?.title ?? 'Réalisation'}
        title={project.title}
        subtitle={project.summary}
        image={project.coverImage}
        breadcrumbs={[
          { label: 'Nos réalisations', href: '/nos-realisations' },
          { label: project.title },
        ]}
      >
        <div className="flex flex-wrap items-center gap-4 text-[12.5px] text-white/70">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} className="text-aces-gold" />
            {project.location}
          </span>
          {project.year ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} className="text-aces-gold" />
              {project.year}
            </span>
          ) : null}
          {project.client ? (
            <span className="inline-flex items-center gap-1.5">
              <Building2 size={14} className="text-aces-gold" />
              {project.client}
            </span>
          ) : null}
        </div>
      </PageHero>

      <section className="section bg-white">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-8">
              <Reveal>
                <div className="rich-text" dangerouslySetInnerHTML={{ __html: project.description }} />
              </Reveal>

              <Reveal className="mt-10">
                <h2 className="text-[1.3rem] font-semibold text-navy">Galerie</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {gallery.map((image, index) => (
                    <button
                      key={`${image.url}-${index}`}
                      type="button"
                      onClick={() => setLightboxIndex(index)}
                      className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100"
                      aria-label={`Agrandir l’image ${index + 1}`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt || project.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[11.5px] text-ink-soft">
                  Photographies d’illustration, non contractuelles.
                </p>
              </Reveal>
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                    Fiche projet
                  </h2>
                  <dl className="mt-4 space-y-3 text-[13px]">
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-ink-soft">Prestation</dt>
                      <dd className="text-right font-medium text-navy">{project.service?.title ?? project.category}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <dt className="text-ink-soft">Lieu</dt>
                      <dd className="text-right font-medium text-navy">{project.location}</dd>
                    </div>
                    {project.year ? (
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-ink-soft">Année</dt>
                        <dd className="text-right font-medium text-navy">{project.year}</dd>
                      </div>
                    ) : null}
                    {project.client ? (
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-ink-soft">Client</dt>
                        <dd className="text-right font-medium text-navy">{project.client}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <Link to="/devis" className="btn-primary mt-5 w-full">
                    Demander un devis
                    <ArrowRight size={16} />
                  </Link>
                  <a
                    href={whatsapp(
                      `Bonjour ACES Global Services, je souhaite un projet similaire à « ${project.title} ».`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost mt-2.5 w-full text-[#128C7E]"
                  >
                    <MessageCircle size={16} />
                    En parler sur WhatsApp
                  </a>
                </div>

                {project.service ? (
                  <Link
                    to={`/nos-activites/${project.service.slug}`}
                    className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-aces-mist/60 p-5 transition-colors hover:border-aces-blue/30"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-aces-blue shadow-sm">
                      <ServiceIcon name={project.service.icon} size={18} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">
                        Prestation liée
                      </span>
                      <span className="mt-0.5 block text-[13.5px] font-semibold text-navy group-hover:text-aces-blue">
                        {project.service.title}
                      </span>
                    </span>
                    <Tag size={15} className="text-slate-300 group-hover:text-aces-blue" />
                  </Link>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {project.related && project.related.length > 0 ? (
        <section className="section-tight bg-aces-mist/60">
          <div className="container">
            <div className="flex items-end justify-between">
              <h2 className="text-[1.4rem] font-semibold text-navy">Autres réalisations</h2>
              <Link to="/nos-realisations" className="link-underline text-[13px]">
                Tout voir
              </Link>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {project.related.map((item) => (
                <Link key={item.slug} to={`/nos-realisations/${item.slug}`} className="card card-hover group overflow-hidden">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">{item.location}</p>
                    <h3 className="mt-1.5 font-display text-[14.5px] font-semibold text-navy group-hover:text-aces-blue">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CTASection />

      <Lightbox
        images={gallery.map((image) => ({ url: image.url, alt: image.alt || project.title }))}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </>
  );
}
