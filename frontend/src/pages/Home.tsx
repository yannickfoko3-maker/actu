import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Headset,
  MapPin,
  Settings,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { api, queryKeys } from '../services/api';
import type { HomeContent } from '../types';
import { useSite } from '../contexts/SiteContext';
import { useSeo } from '../hooks/useSeo';
import { HeroCarousel } from '../components/site/HeroCarousel';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Reveal } from '../components/ui/Reveal';
import { ServiceCard, ProjectCard, ArticleCard } from '../components/site/cards';
import { CTASection, ProcessSection, TestimonialsSection, WhyUsSection } from '../components/site/sections';

const PILLARS = [
  { icon: Sparkles, title: 'Conseil', text: 'Analyse du besoin et visite technique avant tout engagement.' },
  { icon: Wrench, title: 'Installation', text: 'Pose soignée par nos techniciens, dans les délais annoncés.' },
  { icon: Settings, title: 'Maintenance', text: 'Entretien préventif et dépannage sur l’ensemble des équipements.' },
  { icon: Headset, title: 'Assistance', text: 'Un interlocuteur joignable après la mise en service.' },
];

export default function Home() {
  const { settings, slides, navigation } = useSite();
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.home,
    queryFn: () => api.get<HomeContent>('/public/home'),
  });

  const services = data?.services ?? navigation;
  const projects = data?.projects ?? [];
  const articles = data?.articles ?? [];
  const testimonials = data?.testimonials ?? [];

  useSeo({
    title: settings['seo.defaultTitle'] || 'ACES Global Services — Votre sécurité, notre priorité',
    description: settings['seo.defaultDescription'],
    image: settings['seo.ogImage'],
    canonicalPath: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: settings['company.name'],
      slogan: settings['company.tagline'],
      description: settings['company.description'],
      telephone: settings['company.phone'],
      email: settings['company.email'],
      image: `${window.location.origin}${settings['seo.ogImage'] || '/assets/images/hero/hero-1.jpg'}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: settings['company.address'],
        addressLocality: settings['company.city'],
        addressCountry: 'CF',
      },
      areaServed: settings['company.city'],
      url: window.location.origin,
    },
  });

  return (
    <>
      <HeroCarousel slides={slides} isLoading={isLoading} />

      {/* Piliers de service */}
      <section className="relative z-10 border-b border-slate-200 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {PILLARS.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 0.05}>
                <div className="flex items-start gap-4 px-0 py-7 sm:px-6 lg:py-9">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-aces-mist text-aces-blue">
                    <pillar.icon size={20} strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="font-display text-[14.5px] font-semibold text-navy">{pillar.title}</h3>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{pillar.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Présentation */}
      <section className="section overflow-hidden bg-white">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal className="relative">
              <div className="relative overflow-hidden rounded-3xl">
                <img
                  src="/assets/images/about/entreprise.jpg"
                  alt="Équipe ACES Global Services en réunion de travail"
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/25 to-transparent" />
              </div>
              <div className="absolute -bottom-8 -right-2 hidden w-56 overflow-hidden rounded-2xl border-[6px] border-white shadow-card sm:block lg:-right-8">
                <img
                  src="/assets/images/about/supervision.jpg"
                  alt="Poste de supervision de vidéosurveillance"
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -left-4 top-6 hidden rounded-2xl bg-white/95 px-4 py-3 shadow-card backdrop-blur sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-aces-gold">
                  Basés à {settings['company.city']}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-medium text-navy">
                  <MapPin size={13} className="text-aces-blue" />
                  {settings['company.country']}
                </p>
              </div>
            </Reveal>

            <div>
              <SectionHeading
                eyebrow="Qui sommes-nous"
                title="ACES Global Services, votre partenaire en sécurité et en énergie"
                description="Nous concevons, installons et maintenons des solutions techniques pour protéger les biens et les personnes, fluidifier les accès et garantir la continuité d’alimentation des équipements essentiels."
              />

              <ul className="mt-8 space-y-3.5">
                {[
                  'Sécurité électronique et périmétrique : vidéosurveillance, clôture, alarme, contrôle d’accès.',
                  'Automatisation et communication : portails, interphonie, badges, reconnaissance faciale.',
                  'Énergie : panneaux solaires, stockage et alimentation de secours.',
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-[14px] leading-relaxed text-ink-soft">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-aces-blue" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link to="/qui-sommes-nous" className="btn-primary">
                  Découvrir notre entreprise
                  <ArrowRight size={16} />
                </Link>
                <Link to="/nos-activites" className="btn-ghost">
                  Nos prestations
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-200 pt-7">
                <div>
                  <p className="font-display text-2xl font-semibold text-navy">{services.length || 11}</p>
                  <p className="mt-1 text-[11.5px] uppercase tracking-[0.12em] text-ink-soft">Prestations</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-navy">{data?.stats.projects ?? 8}</p>
                  <p className="mt-1 text-[11.5px] uppercase tracking-[0.12em] text-ink-soft">Réalisations</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-navy">4</p>
                  <p className="mt-1 text-[11.5px] uppercase tracking-[0.12em] text-ink-soft">
                    Domaines d’expertise
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos expertises */}
      <section className="section bg-aces-mist/60">
        <div className="container">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Nos expertises"
              title="Onze prestations pour sécuriser, automatiser et alimenter votre site"
              description="Du périmètre au poste de travail, une gamme complète pour les particuliers, les entreprises et les institutions."
            />
            <Link
              to="/nos-activites"
              className="hidden shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-[13px] font-semibold text-navy transition-colors hover:border-aces-blue hover:text-aces-blue sm:inline-flex"
            >
              Toutes les prestations
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.slug} delay={Math.min(index, 5) * 0.04}>
                <ServiceCard service={service} index={index} />
              </Reveal>
            ))}
            {services.length === 0
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="card overflow-hidden">
                    <div className="skeleton aspect-[4/3]" />
                    <div className="space-y-3 p-6">
                      <div className="skeleton h-4 w-2/3" />
                      <div className="skeleton h-3 w-full" />
                      <div className="skeleton h-3 w-4/5" />
                    </div>
                  </div>
                ))
              : null}
          </div>

          <div className="mt-8 flex justify-center sm:hidden">
            <Link to="/nos-activites" className="btn-ghost w-full">
              Toutes les prestations
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <WhyUsSection />

      {/* Réalisations */}
      <section className="section bg-navy">
        <div className="container">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              tone="light"
              eyebrow="Nos réalisations"
              title="Des installations pensées pour durer"
              description="Quelques typologies de projets menés par nos équipes, du périmètre résidentiel au site industriel."
            />
            <Link
              to="/nos-realisations"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              Voir toutes les réalisations
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 6).map((project, index) => (
              <Reveal key={project.id} delay={index * 0.05}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>

          <p className="mt-8 max-w-3xl text-[12px] leading-relaxed text-white/40">
            Les visuels présentés illustrent nos typologies d’intervention. Les photographies sont des images
            d’illustration et ne représentent pas nécessairement des installations identifiables de l’entreprise.
          </p>
        </div>
      </section>

      <ProcessSection />
      <TestimonialsSection testimonials={testimonials} />

      {/* Actualités */}
      {articles.length > 0 ? (
        <section className="section bg-aces-mist/60">
          <div className="container">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Actualités & conseils"
                title="Comprendre avant d’équiper"
                description="Nos conseils pratiques pour choisir, dimensionner et entretenir vos installations."
              />
              <Link
                to="/actualites"
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-[13px] font-semibold text-navy transition-colors hover:border-aces-blue hover:text-aces-blue"
              >
                Tous les articles
                <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Rappel de confiance */}
      <section className="border-y border-slate-200 bg-white py-14">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: 'Matériel éprouvé',
                text: 'Des équipements sélectionnés pour leur fiabilité et la disponibilité des pièces.',
              },
              {
                icon: Award,
                title: 'Pose soignée',
                text: 'Câblage repéré, fixations durables, finitions propres : nous laissons un site propre.',
              },
              {
                icon: Headset,
                title: 'Interlocuteur unique',
                text: 'Du devis à la maintenance, vous suivez votre dossier avec la même équipe.',
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-aces-mist text-aces-blue">
                  <item.icon size={20} strokeWidth={1.8} />
                </span>
                <div>
                  <h3 className="font-display text-[14.5px] font-semibold text-navy">{item.title}</h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
