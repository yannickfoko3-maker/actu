import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Phone,
  Wrench,
} from 'lucide-react';
import { api, queryKeys } from '../services/api';
import type { Service } from '../types';
import { useSite } from '../contexts/SiteContext';
import { useSeo } from '../hooks/useSeo';
import { PageHero } from '../components/site/PageHero';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Reveal } from '../components/ui/Reveal';
import { Accordion } from '../components/ui/Accordion';
import { Lightbox } from '../components/ui/Lightbox';
import { ServiceIcon } from '../components/ui/ServiceIcon';
import { CTASection } from '../components/site/sections';
import { NotFoundContent } from './NotFound';
import { cn, slugify } from '../utils';

function addHeadingIds(html: string): string {
  return html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (match, attributes, inner) => {
    const id = slugify(String(inner).replace(/<[^>]+>/g, ''));
    return `<h2 id="${id}"${attributes}>${inner}</h2>`;
  });
}

export default function ServiceDetail() {
  const { slug = '' } = useParams();
  const { navigation, whatsapp, call, phone, setting } = useSite();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: service, isLoading, isError } = useQuery({
    queryKey: queryKeys.service(slug),
    queryFn: () => api.get<Service>(`/public/services/${slug}`),
    enabled: Boolean(slug),
  });

  useSeo({
    title: service?.seoTitle || (service ? `${service.title} — ${service.tagline}` : 'Prestation'),
    description: service?.seoDescription || service?.shortDescription,
    image: service?.heroImage,
    canonicalPath: `/nos-activites/${slug}`,
    jsonLd: service
      ? {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.title,
          description: service.shortDescription,
          serviceType: service.title,
          areaServed: setting('company.city'),
          provider: {
            '@type': 'LocalBusiness',
            name: setting('company.name'),
            telephone: phone,
            email: setting('company.email'),
          },
          offers: { '@type': 'Offer', availability: 'https://schema.org/InStock' },
        }
      : undefined,
  });

  if (isLoading) {
    return (
      <>
        <PageHero title="Chargement de la prestation…" breadcrumbs={[{ label: 'Nos activités', href: '/nos-activites' }]} />
        <div className="container section">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="skeleton h-6 w-2/3" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-11/12" />
              <div className="skeleton h-4 w-10/12" />
            </div>
            <div className="skeleton h-64 rounded-2xl" />
          </div>
        </div>
      </>
    );
  }

  if (isError || !service) {
    return <NotFoundContent title="Prestation introuvable" description="Cette prestation n’existe pas ou n’est plus publiée." />;
  }

  const serviceWhatsapp = whatsapp(
    `Bonjour ACES Global Services, je souhaite obtenir des informations sur votre prestation « ${service.title} » et demander un devis.`
  );
  const gallery = service.images.length
    ? service.images
    : [{ url: service.coverImage, alt: service.title }];

  return (
    <>
      <PageHero
        eyebrow="Nos activités"
        title={service.title}
        subtitle={service.tagline}
        image={service.heroImage || service.coverImage}
        breadcrumbs={[
          { label: 'Nos activités', href: '/nos-activites' },
          { label: service.title },
        ]}
      >
        <div className="flex flex-wrap gap-3">
          <Link to={`/devis?service=${service.slug}`} className="btn-gold">
            Demander un devis
            <ArrowRight size={16} />
          </Link>
          <a href={serviceWhatsapp} target="_blank" rel="noopener noreferrer" className="btn-outline">
            <MessageCircle size={16} />
            WhatsApp
          </a>
          <a href={call()} className="btn-outline">
            <Phone size={16} />
            {phone}
          </a>
        </div>
      </PageHero>

      <section className="section bg-white">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            {/* Contenu principal */}
            <div className="lg:col-span-8">
              <Reveal>
                <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-aces-mist/60 p-5 sm:p-6">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-aces-blue shadow-sm">
                    <ServiceIcon name={service.icon} size={22} />
                  </span>
                  <p className="text-[14px] leading-relaxed text-ink-soft">{service.shortDescription}</p>
                </div>
              </Reveal>

              <Reveal className="mt-10">
                <div
                  className="rich-text"
                  // Contenu éditorial assaini côté serveur
                  dangerouslySetInnerHTML={{ __html: addHeadingIds(service.description) }}
                />
              </Reveal>

              {/* Fonctionnement */}
              {service.features.length > 0 ? (
                <Reveal className="mt-12">
                  <h2 className="text-[1.4rem] font-semibold text-navy">Comment fonctionne la solution</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {service.features.map((feature) => (
                      <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="font-display text-[14.5px] font-semibold text-navy">{feature.title}</h3>
                        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </Reveal>
              ) : null}

              {/* Avantages */}
              {service.benefits.length > 0 ? (
                <Reveal className="mt-12">
                  <h2 className="text-[1.4rem] font-semibold text-navy">Les avantages pour votre site</h2>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {service.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3 rounded-xl bg-aces-mist/70 px-4 py-3.5">
                        <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-aces-blue" />
                        <span className="text-[13.5px] leading-relaxed text-ink">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}

              {/* Applications */}
              {service.applications.length > 0 ? (
                <Reveal className="mt-12">
                  <h2 className="text-[1.4rem] font-semibold text-navy">Domaines d’utilisation</h2>
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {service.applications.map((application) => (
                      <span
                        key={application}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[12.5px] font-medium text-ink-soft"
                      >
                        {application}
                      </span>
                    ))}
                  </div>
                </Reveal>
              ) : null}

              {/* Installation */}
              <Reveal className="mt-12 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
                <div>
                  <h2 className="flex items-center gap-2 text-[1.15rem] font-semibold text-navy">
                    <Wrench size={18} className="text-aces-blue" />
                    Notre intervention
                  </h2>
                  <ol className="mt-5 space-y-4">
                    {service.process.map((step, index) => (
                      <li key={step.title} className="flex gap-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-aces-blue/10 text-[11.5px] font-semibold text-aces-blue">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-[13.5px] font-semibold text-navy">{step.title}</p>
                          <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">{step.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h2 className="text-[1.15rem] font-semibold text-navy">Équipements concernés</h2>
                  <ul className="mt-5 space-y-2.5">
                    {service.equipment.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[13px] text-ink-soft">
                        <ChevronRight size={14} className="mt-1 shrink-0 text-aces-gold" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              {/* Galerie */}
              {gallery.length > 0 ? (
                <Reveal className="mt-12">
                  <h2 className="text-[1.4rem] font-semibold text-navy">En images</h2>
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {gallery.map((image, index) => (
                      <button
                        key={`${image.url}-${index}`}
                        type="button"
                        onClick={() => setLightboxIndex(index)}
                        className={cn(
                          'group relative overflow-hidden rounded-xl bg-slate-100',
                          index === 0 ? 'col-span-2 row-span-2 aspect-[4/3]' : 'aspect-square'
                        )}
                        aria-label={`Agrandir l’image : ${image.alt || service.title}`}
                      >
                        <img
                          src={image.url}
                          alt={image.alt || service.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <span className="absolute inset-0 bg-navy/0 transition-colors group-hover:bg-navy/20" />
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-[11.5px] text-ink-soft">
                    Photographies d’illustration — elles ne représentent pas nécessairement une installation
                    identifiée.
                  </p>
                </Reveal>
              ) : null}

              {/* FAQ */}
              {service.faqs.length > 0 ? (
                <Reveal className="mt-12">
                  <h2 className="text-[1.4rem] font-semibold text-navy">Questions fréquentes</h2>
                  <Accordion items={service.faqs} className="mt-5" />
                </Reveal>
              ) : null}
            </div>

            {/* Colonne latérale */}
            <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-5">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
                  <div className="bg-navy-gradient p-6 text-white">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-aces-gold">
                      Besoin de cette prestation ?
                    </p>
                    <h2 className="mt-2 font-display text-[19px] font-semibold leading-snug">
                      Étudions ensemble votre projet
                    </h2>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-white/70">
                      Visite technique, proposition détaillée et devis gratuit sous 24 à 48 h.
                    </p>
                  </div>
                  <div className="space-y-2.5 p-4">
                    <Link to={`/devis?service=${service.slug}`} className="btn-primary w-full">
                      Demander un devis
                      <ArrowRight size={16} />
                    </Link>
                    <a
                      href={serviceWhatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost w-full border-[#25D366]/40 text-[#128C7E] hover:border-[#25D366] hover:text-[#128C7E]"
                    >
                      <MessageCircle size={16} />
                      Discuter sur WhatsApp
                    </a>
                    <a href={call()} className="btn-ghost w-full">
                      <Phone size={16} className="text-aces-blue" />
                      {phone}
                    </a>
                  </div>
                </div>

                {service.toc.length > 0 ? (
                  <nav className="rounded-2xl border border-slate-200 bg-white p-5" aria-label="Sommaire de la page">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">Sommaire</p>
                    <ul className="mt-3 space-y-2">
                      {service.toc.map((item) => (
                        <li key={item.id}>
                          <a
                            href={`#${item.id}`}
                            className="flex items-start gap-2 text-[13px] text-ink-soft transition-colors hover:text-aces-blue"
                          >
                            <ChevronRight size={13} className="mt-1 shrink-0 text-aces-gold" />
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ) : null}

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                    Autres prestations
                  </p>
                  <ul className="mt-3 space-y-1">
                    {navigation
                      .filter((item) => item.slug !== service.slug)
                      .slice(0, 6)
                      .map((item) => (
                        <li key={item.slug}>
                          <Link
                            to={`/nos-activites/${item.slug}`}
                            className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-aces-mist"
                          >
                            <ServiceIcon name={item.icon} size={15} className="text-aces-blue" />
                            <span className="flex-1 text-[12.5px] text-ink-soft group-hover:text-navy">
                              {item.title}
                            </span>
                            <ArrowUpRight size={13} className="text-slate-300 group-hover:text-aces-blue" />
                          </Link>
                        </li>
                      ))}
                  </ul>
                  <Link
                    to="/nos-activites"
                    className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-aces-blue"
                  >
                    Toutes les prestations
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Réalisations liées */}
      {service.relatedProjects && service.relatedProjects.length > 0 ? (
        <section className="section-tight bg-aces-mist/60">
          <div className="container">
            <SectionHeading
              eyebrow="Réalisations associées"
              title="Le savoir-faire en situation"
              description="Des exemples de projets comparables à celui que vous envisagez."
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {service.relatedProjects.map((project) => (
                <Link
                  key={project.slug}
                  to={`/nos-realisations/${project.slug}`}
                  className="card card-hover group overflow-hidden"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-[14.5px] font-semibold text-navy">{project.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">
                      {project.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CTASection
        title={`Un projet de ${service.title.toLowerCase()} ?`}
        description="Décrivez-nous votre site et vos contraintes : nous vous proposons une solution dimensionnée et un devis détaillé."
      />

      <Lightbox
        images={gallery.map((image) => ({ url: image.url, alt: image.alt || service.title }))}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </>
  );
}
