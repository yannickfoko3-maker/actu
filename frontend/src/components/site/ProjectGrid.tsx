import { useMemo, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import type { Project, ServiceSummary } from '../../types';
import { ProjectCard } from './cards';
import { Lightbox } from '../ui/Lightbox';
import { cn } from '../../utils';

interface ProjectGridProps {
  projects: Project[];
  services: ServiceSummary[];
  showFilters?: boolean;
}

export function ProjectGrid({ projects, services, showFilters = true }: ProjectGridProps) {
  const [filter, setFilter] = useState<string>('all');
  const [lightbox, setLightbox] = useState<{ images: { url: string; alt?: string }[]; index: number } | null>(null);

  const categories = useMemo(() => {
    const slugs = new Set(projects.map((project) => project.category));
    return services.filter((service) => slugs.has(service.slug));
  }, [projects, services]);

  const filtered = useMemo(
    () => (filter === 'all' ? projects : projects.filter((project) => project.category === filter)),
    [projects, filter]
  );

  return (
    <div>
      {showFilters && categories.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="mr-1 hidden items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft sm:inline-flex">
            <LayoutGrid size={14} className="text-aces-blue" />
            Filtrer
          </span>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={cn('chip', filter === 'all' && 'chip-active')}
            aria-pressed={filter === 'all'}
          >
            Toutes les réalisations
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setFilter(category.slug)}
              className={cn('chip', filter === category.slug && 'chip-active')}
              aria-pressed={filter === category.slug}
            >
              {category.title}
            </button>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-ink-soft">
          Aucune réalisation n’est publiée pour cette prestation pour le moment.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={() =>
                setLightbox({
                  images:
                    project.images.length > 0
                      ? project.images.map((image) => ({ url: image.url, alt: image.alt || project.title }))
                      : [{ url: project.coverImage, alt: project.title }],
                  index: 0,
                })
              }
            />
          ))}
        </div>
      )}

      <Lightbox
        images={lightbox?.images ?? []}
        index={lightbox ? lightbox.index : null}
        onClose={() => setLightbox(null)}
        onNavigate={(index) => setLightbox((current) => (current ? { ...current, index } : null))}
      />
    </div>
  );
}
