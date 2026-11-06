import { useQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import { api, queryKeys } from '../services/api';
import type { Paginated, Project, ServiceSummary } from '../types';
import { useSeo } from '../hooks/useSeo';
import { useSite } from '../contexts/SiteContext';
import { PageHero } from '../components/site/PageHero';
import { ProjectGrid } from '../components/site/ProjectGrid';
import { CTASection } from '../components/site/sections';

export default function ProjectsPage() {
  const { navigation } = useSite();
  const { data: projects } = useQuery({
    queryKey: queryKeys.projects({ scope: 'public' }),
    queryFn: () => api.get<Paginated<Project>>('/public/projects?limit=48'),
  });
  const { data: services } = useQuery({
    queryKey: queryKeys.services,
    queryFn: () => api.get<ServiceSummary[]>('/public/services'),
  });

  useSeo({
    title: 'Nos réalisations — Sécurité, énergie et automatisation',
    description:
      'Découvrez des exemples de projets menés par ACES Global Services : résidences sécurisées, sièges sociaux, entrepôts solaires, agences bancaires et flottes géolocalisées.',
    image: '/assets/images/projects/projet-1.jpg',
    canonicalPath: '/nos-realisations',
  });

  return (
    <>
      <PageHero
        eyebrow="Nos réalisations"
        title="Des projets concrets, des contraintes réelles"
        subtitle="Résidentiel, tertiaire, industriel : chaque site impose ses contraintes. Voici comment nous y répondons."
        image="/assets/images/projects/projet-1.jpg"
        breadcrumbs={[{ label: 'Nos réalisations' }]}
      />

      <section className="section bg-white">
        <div className="container">
          <div className="mb-9 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-[12.5px] leading-relaxed text-amber-900">
            <Info size={17} className="mt-0.5 shrink-0 text-amber-600" />
            <p>
              <strong>Transparence.</strong> Les fiches ci-dessous décrivent des typologies de projets et les
              solutions techniques associées. Les photographies sont des images d’illustration et ne représentent
              pas nécessairement des installations identifiables de l’entreprise.
            </p>
          </div>

          <ProjectGrid projects={projects?.items ?? []} services={services ?? navigation} />
        </div>
      </section>

      <CTASection
        title="Votre site a ses particularités"
        description="Envoyez-nous quelques photos ou décrivez votre configuration : nous vous indiquons ce qui est réalisable, à quel budget et dans quel délai."
      />
    </>
  );
}
