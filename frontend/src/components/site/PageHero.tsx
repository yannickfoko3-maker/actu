import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Breadcrumbs, type Crumb } from '../ui/Breadcrumbs';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
  breadcrumbs?: Crumb[];
  children?: ReactNode;
  size?: 'default' | 'compact';
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image = '/assets/images/hero/hero-5.jpg',
  breadcrumbs,
  children,
  size = 'default',
}: PageHeroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className={
        size === 'compact'
          ? 'relative isolate overflow-hidden bg-navy pt-12 pb-14 sm:pt-14 sm:pb-16'
          : 'relative isolate overflow-hidden bg-navy pt-14 pb-16 sm:pt-20 sm:pb-24'
      }
    >
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40"
        loading="eager"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/92 to-navy/55" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-transparent to-navy/30" aria-hidden="true" />

      <div className="container relative">
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} tone="dark" /> : null}

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={size === 'compact' ? 'mt-6 max-w-3xl' : 'mt-8 max-w-3xl'}
        >
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="mt-4 text-balance text-[30px] font-semibold leading-[1.08] text-white sm:text-[40px] lg:text-[46px]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-white/70 sm:text-base">{subtitle}</p>
          ) : null}
          {children ? <div className="mt-7">{children}</div> : null}
        </motion.div>
      </div>
    </section>
  );
}
