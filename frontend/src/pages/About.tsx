import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Compass, HeartHandshake, MapPin, ShieldCheck, Target, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, queryKeys } from '../services/api';
import type { PageContent, ServiceSummary } from '../types';
import { useSeo } from '../hooks/useSeo';
import { useSite } from '../contexts/SiteContext';
import { PageHero } from '../components/site/PageHero';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ServiceIcon } from '../components/ui/ServiceIcon';
import { CTASection } from '../components/site/sections';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Fiabilité',
    text: 'Un équipement de sécurité en panne n’a aucune valeur. Nous privilégions des matériels éprouvés et une pose soignée.',
  },
  {
    icon: HeartHandshake,
    title: 'Transparence',
    text: 'Devis détaillés, délais annoncés et explications accessibles : vous savez ce que vous achetez.',
  },
  {
    icon: Users,
    title: 'Proximité',
    text: 'Nos techniciens interviennent sur site et restent joignables après la mise en service.',
  },
  {
    icon: Compass,
    title: 'Pragmatisme',
    text: 'Nous dimensionnons pour votre usage réel, ni sous-équipé ni surdimensionné.',
  },
];

export default function About() {
  const { navigation, setting } = useSite();
  const { data: page } = useQuery({
    queryKey: queryKeys.page('qui-sommes-nous'),
    queryFn: () => api.get<PageContent>('/public/pages/qui-sommes-nous'),
    retry: false,
  });
  const { data: services } = useQuery({
    queryKey: queryKeys.services,
    queryFn: () => api.get<ServiceSummary[]>('/public/services'),
  });

  const items = services ?? navigation;

  useSeo({
    title: page?.seoTitle || 'Qui sommes-nous ?',
    description:
      page?.seoDescription ||
      'ACES Global Services : entreprise spécialisée en sécurité électronique, automatisation, communication et énergie. Mission, valeurs et engagement client.',
    image: page?.heroImage ?? '/assets/images/about/entreprise.jpg',
    canonicalPath: '/qui-sommes-nous',
  });

  return (
    <>
      <PageHero
        eyebrow="L’entreprise"
        title={page?.title ?? 'Qui sommes-nous ?'}
        subtitle={
          page?.subtitle ??
          'Une équipe technique au service de la sécurité, de l’automatisation et de l’énergie.'
        }
        image={page?.heroImage ?? '/assets/images/about/entreprise.jpg'}
        breadcrumbs={[{ label: 'Qui sommes-nous' }]}
      />

      <section className="section bg-white">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-7">
              <div
                className="rich-text"
                dangerouslySetInnerHTML={{ __html: page?.content ?? '<p>Contenu en cours de chargement…</p>' }}
              />
            </Reveal>

            <aside className="lg:col-span-5">
              <div className="sticky top-28 space-y-5">
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <img
                    src="/assets/images/about/technicien.jpg"
                    alt="Technicien ACES lors d’une intervention"
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-aces-mist/60 p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                    Nos domaines d’expertise
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {items.slice(0, 6).map((service) => (
                      <li key={service.slug}>
                        <Link
                          to={`/nos-activites/${service.slug}`}
                          className="group flex items-center gap-3 rounded-lg bg-white px-3 py-2.5 transition-colors hover:text-aces-blue"
                        >
                          <ServiceIcon name={service.icon} size={16} className="text-aces-blue" />
                          <span className="flex-1 text-[12.5px] font-medium text-navy group-hover:text-aces-blue">
                            {service.title}
                          </span>
                          <ArrowRight size={13} className="text-slate-300 group-hover:text-aces-blue" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">Nous trouver</p>
                  <p className="mt-3 flex items-start gap-2.5 text-[13px] leading-relaxed text-ink">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-aces-blue" />
                    <span>
                      {setting('company.address')}
                      <br />
                      {setting('company.city')}, {setting('company.country')}
                    </span>
                  </p>
                  <Link to="/contact" className="btn-ghost mt-4 w-full">
                    Nous contacter
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="section bg-aces-mist/60">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Nos valeurs"
            title="Ce qui guide chacune de nos interventions"
            description="Quatre principes simples, appliqués du premier appel jusqu’à la maintenance."
            className="mx-auto"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, index) => (
              <Reveal key={value.title} delay={index * 0.05}>
                <div className="card h-full p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-aces-blue/10 text-aces-blue">
                    <value.icon size={20} strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-4 font-display text-[15px] font-semibold text-navy">{value.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{value.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / vision */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal className="rounded-2xl bg-navy p-8 text-white sm:p-10">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-aces-gold">
                <Target size={20} />
              </span>
              <h2 className="mt-5 font-display text-xl font-semibold text-white">Notre mission</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-white/70">
                Mettre la technologie au service de la tranquillité de nos clients : comprendre un besoin, proposer
                une solution dimensionnée pour ce besoin, l’installer proprement et l’accompagner dans le temps.
              </p>
            </Reveal>
            <Reveal delay={0.06} className="rounded-2xl border border-slate-200 bg-aces-mist/60 p-8 sm:p-10">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-aces-blue shadow-sm">
                <Compass size={20} />
              </span>
              <h2 className="mt-5 font-display text-xl font-semibold text-navy">Notre vision</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                Devenir la référence locale des solutions de sécurité et d’énergie intégrées : des installations
                cohérentes, documentées, maintenues et capables d’évoluer avec les besoins de nos clients.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <CTASection
        title="Envie d’en savoir plus sur notre méthode ?"
        description="Nous vous expliquons comment nous travaillons, ce que comprend un devis et comment se déroule une installation."
      />
    </>
  );
}
