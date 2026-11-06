import { Link } from 'react-router-dom';
import { ArrowRight, Headset, MessageCircle, Quote, ShieldCheck, Star, Wrench } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Testimonial } from '../../types';
import { useSite } from '../../contexts/SiteContext';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { cn } from '../../utils';

/* ------------------------------------------------------------------------- */
/* Bandeau d'appel à l'action                                                 */
/* ------------------------------------------------------------------------- */
export function CTASection({
  title = 'Votre projet mérite une solution adaptée.',
  description = 'Décrivez-nous votre besoin : nous étudions la faisabilité, proposons une architecture claire et vous transmettons un devis détaillé.',
  image = '/assets/images/misc/cta.jpg',
}: {
  title?: string;
  description?: string;
  image?: string;
}) {
  const { whatsapp } = useSite();

  return (
    <section className="relative overflow-hidden bg-navy py-20 sm:py-24">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/60" aria-hidden="true" />
      <div className="container relative">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Parlons de votre projet</p>
            <h2 className="mt-4 text-display-sm text-white sm:text-display">{title}</h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/70">{description}</p>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col gap-3 sm:flex-row">
            <Link to="/devis" className="btn-gold px-7 py-3.5">
              Demander un devis
              <ArrowRight size={17} />
            </Link>
            <a
              href={whatsapp()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline px-7 py-3.5"
            >
              <MessageCircle size={17} />
              Discuter sur WhatsApp
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------- */
/* Processus en 5 étapes                                                      */
/* ------------------------------------------------------------------------- */
const PROCESS_STEPS = [
  {
    title: 'Écoute et prise de contact',
    description: 'Nous échangeons sur votre besoin, votre site et vos contraintes de délai ou de budget.',
  },
  {
    title: 'Analyse des besoins',
    description: 'Visite technique, relevé des mesures et identification des points sensibles.',
  },
  {
    title: 'Proposition technique et devis',
    description: 'Une architecture claire, des équipements référencés et un devis détaillé, sans surprise.',
  },
  {
    title: 'Installation et mise en service',
    description: 'Pose soignée, câblage repéré, tests complets et formation à l’usage.',
  },
  {
    title: 'Maintenance et assistance',
    description: 'Entretien préventif, dépannage et évolutions : votre installation reste opérationnelle.',
  },
];

export function ProcessSection() {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Notre processus"
              title="Cinq étapes, aucune zone d’ombre"
              description="Une méthode éprouvée qui sécurise votre investissement, de la première visite à la maintenance."
            />
            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-slate-200 bg-aces-mist/60 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-aces-blue shadow-sm">
                <Headset size={18} />
              </span>
              <p className="text-[13px] leading-relaxed text-ink-soft">
                Un interlocuteur unique suit votre dossier jusqu’à la mise en service.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <ol className="relative space-y-4">
              {PROCESS_STEPS.map((step, index) => (
                <Reveal as="li" key={step.title} delay={index * 0.05}>
                  <div className="group flex gap-5 rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-aces-blue/30 hover:shadow-soft sm:p-6">
                    <div className="relative shrink-0">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-[15px] font-semibold text-white transition-colors group-hover:bg-aces-blue">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {index < PROCESS_STEPS.length - 1 ? (
                        <span className="absolute left-1/2 top-full h-[calc(100%+8px)] w-px -translate-x-1/2 bg-gradient-to-b from-slate-200 to-transparent" />
                      ) : null}
                    </div>
                    <div>
                      <h3 className="font-display text-[15.5px] font-semibold text-navy">{step.title}</h3>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{step.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------- */
/* Pourquoi nous choisir                                                      */
/* ------------------------------------------------------------------------- */
const REASONS = [
  {
    icon: ShieldCheck,
    title: 'Conseil et expertise',
    description:
      'Une visite technique avant tout devis, pour une solution dimensionnée sur votre besoin réel plutôt que sur un catalogue.',
  },
  {
    icon: Wrench,
    title: 'Installation soignée',
    description:
      'Câblage repéré, fixations durables, réglages vérifiés : la qualité de pose conditionne la fiabilité dans le temps.',
  },
  {
    icon: Headset,
    title: 'Accompagnement client',
    description:
      'Formation à l’usage, documentation technique remise et assistance après installation : vous restez autonome.',
  },
];

const REASONS_SECONDARY = [
  { title: 'Solutions adaptées', description: 'Résidentiel, tertiaire ou industriel : chaque site a ses contraintes.' },
  { title: 'Innovation technologique', description: 'Équipements récents, biométrie, supervision et accès distant.' },
  { title: 'Qualité des équipements', description: 'Matériels éprouvés, pièces de rechange disponibles et garanties constructeur.' },
];

export function WhyUsSection() {
  return (
    <section className="section bg-aces-mist/70">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Pourquoi nous choisir ?"
              title="La différence se joue dans les détails"
              description="Nous ne vendons pas du matériel : nous livrons un système qui fonctionne, que vous savez utiliser et qui reste fiable."
            />
            <div className="mt-8 overflow-hidden rounded-2xl">
              <img
                src="/assets/images/about/technicien.jpg"
                alt="Technicien ACES en intervention sur un équipement de sécurité"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-1">
              {REASONS.map((reason, index) => (
                <Reveal key={reason.title} delay={index * 0.06}>
                  <div className="card flex gap-5 p-6">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-aces-blue/10 text-aces-blue">
                      <reason.icon size={22} strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3 className="font-display text-[15.5px] font-semibold text-navy">{reason.title}</h3>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{reason.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {REASONS_SECONDARY.map((reason) => (
                <div key={reason.title} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                  <p className="text-[13px] font-semibold text-navy">{reason.title}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{reason.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------- */
/* Témoignages — affichés uniquement s'ils sont publiés en back-office        */
/* ------------------------------------------------------------------------- */
export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const reduceMotion = useReducedMotion();

  if (!testimonials.length) return null;

  return (
    <section className="section bg-white">
      <div className="container">
        <SectionHeading
          align="center"
          eyebrow="Ils nous font confiance"
          title="Ce que disent nos clients"
          description="Des retours authentiques, publiés après accord des personnes concernées."
          className="mx-auto"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.figure
              key={testimonial.id}
              initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className={cn('card flex h-full flex-col p-6', 'border-slate-200')}
            >
              <Quote size={26} className="text-aces-gold/70" />
              <blockquote className="mt-4 flex-1 text-[14px] leading-relaxed text-ink-soft">
                {testimonial.content}
              </blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                {testimonial.photo ? (
                  <img
                    src={testimonial.photo}
                    alt={testimonial.authorName}
                    className="h-10 w-10 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-aces-blue/10 text-[13px] font-semibold text-aces-blue">
                    {testimonial.authorName.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div className="flex-1">
                  <figcaption className="text-[13px] font-semibold text-navy">
                    {testimonial.authorName}
                  </figcaption>
                  <p className="text-[11.5px] text-ink-soft">
                    {[testimonial.authorRole, testimonial.company].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex gap-0.5" aria-label={`Note : ${testimonial.rating} sur 5`}>
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      size={13}
                      className={starIndex < testimonial.rating ? 'fill-aces-gold text-aces-gold' : 'text-slate-200'}
                    />
                  ))}
                </div>
              </div>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
