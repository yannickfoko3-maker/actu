import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, LayoutGrid, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, queryKeys } from '../services/api';
import type { ServiceSummary } from '../types';
import { useSeo } from '../hooks/useSeo';
import { useSite } from '../contexts/SiteContext';
import { PageHero } from '../components/site/PageHero';
import { ServiceCard } from '../components/site/cards';
import { Reveal } from '../components/ui/Reveal';
import { CTASection, ProcessSection } from '../components/site/sections';

export default function ServicesIndex() {
  const { navigation, whatsapp, setting } = useSite();
  const { data: services } = useQuery({
    queryKey: queryKeys.services,
    queryFn: () => api.get<ServiceSummary[]>('/public/services'),
  });

  const items = services ?? navigation;

  useSeo({
    title: 'Nos activités — Sécurité, automatisation et énergie',
    description:
      'Onze prestations pour protéger vos biens et vos activités : clôture électrique, vidéosurveillance, panneaux solaires, contrôle d’accès, interphonie, portails automatiques, alarme incendie, reconnaissance faciale, badges, sas d’entrée et géolocalisation GPS.',
    image: '/assets/images/hero/hero-2.jpg',
    canonicalPath: '/nos-activites',
  });

  return (
    <>
      <PageHero
        eyebrow="Nos activités"
        title="Onze prestations, une même exigence de fiabilité"
        subtitle="Sécurité électronique et périmétrique, automatisation, communication et énergie : nos solutions se complètent pour former un dispositif cohérent."
        image="/assets/images/hero/hero-2.jpg"
        breadcrumbs={[{ label: 'Nos activités' }]}
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/devis" className="btn-gold">
            Demander un devis
            <ArrowRight size={16} />
          </Link>
          <a href={whatsapp()} target="_blank" rel="noopener noreferrer" className="btn-outline">
            <MessageCircle size={16} />
            Poser une question
          </a>
        </div>
      </PageHero>

      <section className="section-tight border-b border-slate-200 bg-white">
        <div className="container">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-aces-mist text-aces-blue">
                <LayoutGrid size={20} />
              </span>
              <p className="max-w-2xl text-[14px] leading-relaxed text-ink-soft">
                Chaque prestation est documentée : fonctionnement, applications, avantages, équipements et
                questions fréquentes. Sélectionnez celle qui correspond à votre besoin, ou contactez-nous si vous
                hésitez entre plusieurs solutions.
              </p>
            </div>
            <ul className="grid gap-2 text-[12.5px] text-ink-soft sm:grid-cols-2 lg:shrink-0">
              {['Étude technique préalable', 'Matériel et pose inclus', 'Maintenance possible'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-aces-blue" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section bg-aces-mist/60">
        <div className="container">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((service, index) => (
              <Reveal key={service.slug} delay={Math.min(index, 6) * 0.04}>
                <ServiceCard service={service} index={index} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ProcessSection />

      <CTASection
        title="Plusieurs besoins à couvrir ?"
        description={`Nos équipes conçoivent des dispositifs combinés — par exemple clôture électrique, vidéosurveillance et alimentation solaire — pour un site cohérent et évolutif. Contactez ${setting(
          'company.name'
        )} pour en discuter.`}
      />
    </>
  );
}
