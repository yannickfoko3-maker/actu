import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, MapPin } from 'lucide-react';
import type { ArticleSummary, Project, ServiceSummary } from '../../types';
import { ServiceIcon } from '../ui/ServiceIcon';
import { cn, formatShortDate } from '../../utils';

export function ServiceCard({ service, index = 0 }: { service: ServiceSummary; index?: number }) {
  return (
    <Link
      to={`/nos-activites/${service.slug}`}
      className="card card-hover group flex h-full flex-col overflow-hidden"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={service.coverImage}
          alt={service.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/75 via-navy/10 to-transparent" />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-navy shadow-sm">
          Prestation
        </span>
        <span className="absolute -bottom-0.5 left-4 grid h-12 w-12 translate-y-1/3 place-items-center rounded-xl bg-white text-aces-blue shadow-[0_12px_28px_-14px_rgba(6,43,99,0.55)] transition-colors group-hover:bg-aces-blue group-hover:text-white">
          <ServiceIcon name={service.icon} size={22} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6 pt-8">
        <h3 className="font-display text-[17px] font-semibold leading-snug text-navy transition-colors group-hover:text-aces-blue">
          {service.title}
        </h3>
        <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-ink-soft">{service.shortDescription}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-aces-blue">
          En savoir plus
          <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen?: () => void;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-navy">
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left"
        aria-label={`Voir la réalisation : ${project.title}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={project.coverImage}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover opacity-90 transition-all duration-[900ms] ease-out group-hover:scale-[1.05] group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent opacity-90" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
            {project.location}
            {project.year ? ` · ${project.year}` : ''}
          </span>
          <h3 className="mt-2.5 font-display text-[16.5px] font-semibold leading-snug text-white">
            {project.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-white/70">{project.summary}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-aces-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Voir le détail
            <ArrowUpRight size={14} />
          </span>
        </div>
      </button>
      <Link
        to={`/nos-realisations/${project.slug}`}
        className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-all duration-300 hover:bg-white hover:text-navy group-hover:opacity-100"
        aria-label={`Ouvrir la fiche : ${project.title}`}
      >
        <ArrowUpRight size={16} />
      </Link>
    </article>
  );
}

export function ArticleCard({ article, featured = false }: { article: ArticleSummary; featured?: boolean }) {
  return (
    <article
      className={cn(
        'card card-hover group flex h-full flex-col overflow-hidden',
        featured && 'sm:flex-row'
      )}
    >
      <Link
        to={`/actualites/${article.slug}`}
        className={cn('relative block overflow-hidden bg-slate-100', featured ? 'sm:w-1/2' : '')}
      >
        <div className={cn('relative overflow-hidden', featured ? 'aspect-[16/11] sm:h-full' : 'aspect-[16/10]')}>
          <img
            src={article.coverImage}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
          />
          {article.category ? (
            <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-aces-blue shadow-sm">
              {article.category.name}
            </span>
          ) : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-ink-soft">
          {article.publishedAt ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} className="text-aces-blue" />
              {formatShortDate(article.publishedAt)}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} className="text-aces-blue" />
            {article.readingTime} min de lecture
          </span>
        </div>
        <h3 className="mt-3 font-display text-[17px] font-semibold leading-snug text-navy">
          <Link to={`/actualites/${article.slug}`} className="transition-colors hover:text-aces-blue">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-ink-soft">{article.excerpt}</p>
        <Link
          to={`/actualites/${article.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-aces-blue"
        >
          Lire l’article
          <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

export function ProjectMeta({ location, year }: { location: string; year?: number | null }) {
  return (
    <span className="inline-flex items-center gap-3 text-[12px] text-ink-soft">
      <span className="inline-flex items-center gap-1.5">
        <MapPin size={13} className="text-aces-blue" />
        {location}
      </span>
      {year ? (
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={13} className="text-aces-blue" />
          {year}
        </span>
      ) : null}
    </span>
  );
}
