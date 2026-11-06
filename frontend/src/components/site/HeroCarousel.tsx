import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import type { HeroSlide } from '../../types';
import { cn } from '../../utils';

interface HeroCarouselProps {
  slides: HeroSlide[];
  isLoading?: boolean;
}

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: 'fallback-1',
    eyebrow: 'Sécurité électronique & automatisation',
    title: 'Votre sécurité, notre priorité !',
    subtitle:
      'Des solutions intelligentes pour protéger vos biens, vos équipes et vos activités, de l’étude à la maintenance.',
    image: '/assets/images/hero/hero-1.jpg',
    primaryLabel: 'Découvrir nos solutions',
    primaryUrl: '/nos-activites',
    secondaryLabel: 'Demander un devis',
    secondaryUrl: '/devis',
    order: 1,
    isActive: true,
  },
  {
    id: 'fallback-2',
    eyebrow: 'Vidéosurveillance & contrôle d’accès',
    title: 'La technologie au service de votre tranquillité.',
    subtitle:
      'Caméras haute définition, enregistrement sécurisé et consultation à distance : gardez un œil sur l’essentiel.',
    image: '/assets/images/hero/hero-2.jpg',
    primaryLabel: 'Découvrir la vidéosurveillance',
    primaryUrl: '/nos-activites/videosurveillance',
    secondaryLabel: 'Demander un devis',
    secondaryUrl: '/devis',
    order: 2,
    isActive: true,
  },
  {
    id: 'fallback-3',
    eyebrow: 'Énergie solaire',
    title: 'Une énergie plus intelligente, un avenir durable.',
    subtitle:
      'Panneaux solaires et stockage sur mesure pour produire votre électricité et travailler sans interruption.',
    image: '/assets/images/hero/hero-3.jpg',
    primaryLabel: 'Découvrir le solaire',
    primaryUrl: '/nos-activites/panneaux-solaires',
    secondaryLabel: 'Demander un devis',
    secondaryUrl: '/devis',
    order: 3,
    isActive: true,
  },
];

const AUTOPLAY_MS = 7000;

export function HeroCarousel({ slides, isLoading }: HeroCarouselProps) {
  const reduceMotion = useReducedMotion();
  const items = useMemo(() => (slides.length > 0 ? slides : FALLBACK_SLIDES), [slides]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % items.length) + items.length) % items.length);
    },
    [items.length]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const previous = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (reduceMotion || paused || items.length <= 1) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % items.length), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, items.length, reduceMotion, index]);

  useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [items.length, index]);

  const active = items[index];

  return (
    <section
      ref={containerRef}
      className="relative isolate flex min-h-[600px] w-full items-center overflow-hidden bg-navy sm:min-h-[640px] lg:h-[min(88vh,840px)]"
      aria-roledescription="carrousel"
      aria-label="Nos engagements en images"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const delta = event.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(delta) > 48) {
          if (delta < 0) next();
          else previous();
        }
        touchStart.current = null;
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') next();
        if (event.key === 'ArrowLeft') previous();
      }}
      tabIndex={-1}
    >
      {/* Images */}
      <AnimatePresence initial={false}>
        <motion.div
          key={active.id}
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
        >
          <motion.img
            src={active.image}
            alt=""
            className="h-full w-full object-cover"
            initial={reduceMotion ? undefined : { scale: 1.02 }}
            animate={reduceMotion ? undefined : { scale: 1.12 }}
            transition={reduceMotion ? undefined : { duration: 11, ease: 'linear' }}
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        </motion.div>
      </AnimatePresence>

      {/* Voiles */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/85 to-navy/40"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-transparent to-navy/40"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 surface-grid opacity-[0.14]" aria-hidden="true" />

      <div className="container relative w-full pb-24 pt-16 sm:pb-28 sm:pt-20 lg:pt-8">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${active.id}`}
              initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {active.eyebrow ? (
                <p className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur-sm">
                  <ShieldCheck size={13} className="text-aces-gold" />
                  {active.eyebrow}
                </p>
              ) : null}

              <h1 className="mt-6 text-balance text-[34px] font-semibold leading-[1.06] text-white sm:text-[46px] lg:text-display-lg">
                {active.title}
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-lg">
                {active.subtitle}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link to={active.primaryUrl || '/nos-activites'} className="btn-gold px-7 py-3.5">
                  {active.primaryLabel || 'Découvrir nos solutions'}
                  <ArrowRight size={17} />
                </Link>
                <Link to={active.secondaryUrl || '/devis'} className="btn-outline px-7 py-3.5">
                  {active.secondaryLabel || 'Demander un devis'}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Contrôles */}
        <div className="absolute inset-x-0 bottom-6 sm:bottom-8">
          <div className="container flex items-center justify-between gap-6">
            <div className="flex items-center gap-2.5" role="tablist" aria-label="Choisir une diapositive">
              {items.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={slideIndex === index}
                  aria-label={`Diapositive ${slideIndex + 1} : ${slide.title}`}
                  onClick={() => goTo(slideIndex)}
                  className={cn(
                    'h-[3px] rounded-full transition-all duration-500',
                    slideIndex === index ? 'w-12 bg-aces-gold' : 'w-6 bg-white/35 hover:bg-white/60'
                  )}
                />
              ))}
              <span className="ml-2 text-[11px] font-medium tabular-nums text-white/50">
                {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </span>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={previous}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white transition-colors hover:border-white hover:bg-white/10"
                aria-label="Diapositive précédente"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={next}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white transition-colors hover:border-white hover:bg-white/10"
                aria-label="Diapositive suivante"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-white/10">
          <div className="h-full w-1/3 animate-pulse bg-aces-gold" />
        </div>
      ) : null}
    </section>
  );
}
