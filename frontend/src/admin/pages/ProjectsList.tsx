import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { api, queryKeys } from '../../services/api';
import type { Paginated, Project } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import {
  Badge,
  ConfirmDialog,
  EmptyState,
  LoadingBlock,
  PageHeader,
  Pagination,
  Panel,
  SearchInput,
  Table,
  Td,
} from '../components/ui';

export default function ProjectsList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Project | null>(null);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.projects({ search, page }),
    queryFn: () =>
      api.get<Paginated<Project>>(
        `/admin/projects?limit=15&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`
      ),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
    void queryClient.invalidateQueries({ queryKey: ['projects'] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.home });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
  };

  const toggle = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/projects/${id}/publish`),
    onSuccess: () => {
      success('Statut mis à jour.');
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/projects/${id}`),
    onSuccess: () => {
      success('Réalisation supprimée.');
      setToDelete(null);
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  return (
    <>
      <PageHeader
        title="Réalisations"
        description="Les projets présentés dans le portfolio, filtrables par prestation sur le site public."
        breadcrumb={['Contenus', 'Réalisations']}
        actions={
          <Link to="/admin/realisations/nouvelle" className="btn-primary btn-sm">
            <Plus size={15} />
            Nouvelle réalisation
          </Link>
        }
      />

      <Panel>
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Rechercher une réalisation…"
          className="sm:w-72"
        />

        <div className="mt-4">
          {isLoading ? (
            <LoadingBlock />
          ) : data && data.items.length > 0 ? (
            <>
              <Table head={['Réalisation', 'Prestation', 'Lieu', 'Statut', 'Actions']}>
                {data.items.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/60">
                    <Td>
                      <div className="flex items-center gap-3">
                        <img
                          src={project.coverImage}
                          alt=""
                          className="h-11 w-16 shrink-0 rounded-md object-cover"
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate text-[13px] font-semibold text-navy">
                            {project.title}
                            {project.featured ? <Star size={12} className="fill-aces-gold text-aces-gold" /> : null}
                          </p>
                          <p className="truncate text-[11px] text-slate-400">
                            {project.images.length} image(s)
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-[12px] text-slate-500">{project.service?.title ?? project.category}</Td>
                    <Td className="text-[12px] text-slate-500">
                      {project.location}
                      {project.year ? ` · ${project.year}` : ''}
                    </Td>
                    <Td>
                      <Badge
                        className={
                          project.isPublished
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-50 text-slate-500'
                        }
                      >
                        {project.isPublished ? 'Publiée' : 'Masquée'}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/admin/realisations/${project.id}`}
                          className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-aces-blue/10 hover:text-aces-blue"
                          aria-label="Modifier"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggle.mutate(project.id)}
                          className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                          aria-label="Changer la visibilité"
                        >
                          {project.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setToDelete(project)}
                          className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </Table>
              <Pagination pagination={data.pagination} onPage={setPage} />
            </>
          ) : (
            <EmptyState
              title="Aucune réalisation"
              description="Ajoutez vos projets pour alimenter le portfolio."
              action={
                <Link to="/admin/realisations/nouvelle" className="btn-primary btn-sm">
                  <Plus size={15} />
                  Ajouter une réalisation
                </Link>
              }
            />
          )}
        </div>
      </Panel>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer cette réalisation ?"
        message={`« ${toDelete?.title} » et ses images seront définitivement supprimées.`}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
        loading={remove.isPending}
      />
    </>
  );
}
