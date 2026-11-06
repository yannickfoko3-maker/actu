import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { api, queryKeys } from '../services/api';
import type { ServiceSummary } from '../types';
import { useSeo } from '../hooks/useSeo';
import { useSite } from '../contexts/SiteContext';
import { PageHero } from '../components/site/PageHero';
import { QuoteForm } from '../components/site/forms';
import { Reveal } from '../components/ui/Reveal';

const STEPS = [
  'Nous accusons réception de votre demande sous 24 à 48 h ouvrées.',
  'Un conseiller vous rappelle pour préciser le besoin et le site.',
  'Une visite technique est programmée si nécessaire.',
  'Vous recevez un devis détaillé, clair et sans engagement.',
];

export default function Quote() {
  const [params] = useSearchParams();
  const { phone, call, whatsapp, setting } = useSite();
  const preselected = params.get('service') ?? undefined;

  const { data: services } = useQuery({
    queryKey: queryKeys.services,
    queryFn: () => api.get<ServiceSummary[]>('/public/services'),
  });

  useSeo({
    title: 'Demander un devis gratuit',
    description:
      'Demandez un devis gratuit pour votre projet de vidéosurveillance, clôture électrique, panneaux solaires, contrôle d’accès ou portail automatique. Réponse sous 24 à 48 heures ouvrées.',
    image: '/assets/images/hero/hero-4.jpg',
    canonicalPath: '/devis',
  });

  return (
    <>
      <PageHero
        eyebrow="Demande de devis"
        title="Un devis clair, gratuit et sans engagement"
        subtitle="Décrivez votre projet : nous étudions votre besoin, vérifions la faisabilité technique et vous transmettons une proposition détaillée."
        image="/assets/images/hero/hero-4.jpg"
        breadcrumbs={[{ label: 'Demander un devis' }]}
        size="compact"
      >
        <div className="flex flex-wrap gap-3">
          <a href={call()} className="btn-gold">
            <Phone size={16} />
            {phone}
          </a>
          <a href={whatsapp()} target="_blank" rel="noopener noreferrer" className="btn-outline">
            <MessageCircle size={16} />
            WhatsApp
          </a>
        </div>
      </PageHero>

      <section className="section bg-white">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <div className="card p-6 sm:p-8">
                <h2 className="font-display text-xl font-semibold text-navy">Votre projet en quelques lignes</h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                  Les champs marqués d’un astérisque sont obligatoires. Vos informations restent confidentielles.
                </p>
                <div className="mt-7">
                  <QuoteForm services={services ?? []} defaultServiceSlug={preselected} />
                </div>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div className="space-y-5">
                <Reveal className="rounded-2xl border border-slate-200 bg-aces-mist/60 p-6">
                  <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold text-navy">
                    <Clock size={17} className="text-aces-blue" />
                    Ce qui se passe ensuite
                  </h2>
                  <ol className="mt-4 space-y-3.5">
                    {STEPS.map((step, index) => (
                      <li key={step} className="flex gap-3">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[11px] font-semibold text-aces-blue shadow-sm">
                          {index + 1}
                        </span>
                        <p className="text-[13px] leading-relaxed text-ink-soft">{step}</p>
                      </li>
                    ))}
                  </ol>
                </Reveal>

                <Reveal delay={0.05} className="rounded-2xl border border-slate-200 p-6">
                  <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold text-navy">
                    <ShieldCheck size={17} className="text-aces-blue" />
                    Nos engagements
                  </h2>
                  <ul className="mt-4 space-y-2.5">
                    {[
                      'Devis gratuit et sans engagement',
                      'Prix détaillés : matériel, pose et options',
                      'Visite technique avant validation',
                      'Matériel garanti et pièces disponibles',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[13px] text-ink-soft">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-aces-blue" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>

                <Reveal delay={0.1} className="overflow-hidden rounded-2xl bg-navy p-6 text-white">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-aces-gold">
                    Vous préférez parler ?
                  </p>
                  <p className="mt-2 font-display text-[16px] font-semibold leading-snug">
                    Appelez-nous directement
                  </p>
                  <a href={call()} className="mt-3 inline-flex items-center gap-2 text-[15px] font-semibold text-white">
                    <Phone size={16} className="text-aces-gold" />
                    {phone}
                  </a>
                  <p className="mt-3 text-[12px] leading-relaxed text-white/60">{setting('company.hours')}</p>
                  <Link to="/contact" className="mt-4 inline-flex text-[12.5px] font-semibold text-aces-gold hover:text-white">
                    Voir toutes les coordonnées
                  </Link>
                </Reveal>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
