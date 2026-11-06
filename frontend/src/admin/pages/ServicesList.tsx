import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, queryKeys } from '../../services/api';
import type { Paginated, Service } from '../../types';
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
import { cn, formatShortDate } from '../../utils';

interface AdminService extends Service {
  imagesCount: number;
  updatedAt?: string;
}

export default function ServicesList() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<AdminService | null>(null);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  useEffect(() => {
    setSearch(params.get('search') ?? '');
  }, [params]);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.services({ search, status, page }),
    queryFn: () =>
      api.get<Paginated<AdminService>>(
        `/admin/services?limit=20&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}${
          status ? `&status=${status}` : ''
        }`
      ),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
    void queryClient.invalidateQueries({ queryKey: queryKeys.site });
    void queryClient.invalidateQueries({ queryKey: queryKeys.services });
  };

  const toggle = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/services/${id}/publish`),
    onSuccess: () => {
      success('Statut de publication mis à jour.');
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/services/${id}`),
    onSuccess: () => {
      success('Prestation supprimée.');
      setToDelete(null);
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const reorder = useMutation({
    mutationFn: (items: { id: string; order: number }[]) => api.patch('/admin/services/reorder', { items }),
    onSuccess: () => invalidate(),
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const move = (service: AdminService, direction: -1 | 1) => {
    const list = data?.items ?? [];
    const index = list.findIndex((item) => item.id === service.id);
    const target = list[index + direction];
    if (!target) return;
    reorder.mutate([
      { id: service.id, order: target.order },
      { id: target.id, order: service.order },
    ]);
  };

  return (
    <>
      <PageHeader
        title="Prestations"
        description="Les onze pages de prestations du site. Chaque fiche est entièrement administrable : contenu, images, avantages, FAQ et référencement."
        breadcrumb={['Contenus', 'Prestations']}
        actions={
          <Link to="/admin/prestations/nouvelle" className="btn-primary btn-sm">
            <Plus size={15} />
            Nouvelle prestation
          </Link>
        }
      />

      <Panel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
              if (value) setParams({ search: value });
              else setParams({});
            }}
            placeholder="Rechercher une prestation…"
            className="sm:w-72"
          />
          <div className="flex gap-2">
            {[
              { value: '', label: 'Toutes' },
              { value: 'published', label: 'Publiées' },
              { value: 'draft', label: 'Brouillons' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setStatus(option.value);
                  setPage(1);
                }}
                className={cn('chip', status === option.value && 'chip-active')}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <LoadingBlock />
          ) : data && data.items.length > 0 ? (
            <>
              <Table head={['Prestation', 'Statut', 'Ordre', 'Images', 'Modifiée', 'Actions']}>
                {data.items.map((service) => (
                  <tr key={service.id} className="group hover:bg-slate-50/60">
                    <Td>
                      <div className="flex items-center gap-3">
                        <img
                          src={service.coverImage}
                          alt=""
                          className="h-11 w-16 shrink-0 rounded-md object-cover"
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-navy">{service.title}</p>
                          <p className="truncate text-[11px] text-slate-400">/nos-activites/{service.slug}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Badge
                        className={
                          service.isPublished
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-50 text-slate-500'
                        }
                      >
                        {service.isPublished ? 'Publiée' : 'Brouillon'}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => move(service, -1)}
                          className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-navy"
                          aria-label="Monter"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <span className="w-5 text-center text-[12px] tabular-nums text-slate-500">
                          {service.order}
                        </span>
                        <button
                          type="button"
                          onClick={() => move(service, 1)}
                          className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-navy"
                          aria-label="Descendre"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </Td>
                    <Td className="text-slate-500">{service.imagesCount}</Td>
                    <Td className="whitespace-nowrap text-[12px] text-slate-500">
                      {formatShortDate(service.updatedAt)}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/admin/prestations/${service.id}`}
                          className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-aces-blue/10 hover:text-aces-blue"
                          aria-label="Modifier"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggle.mutate(service.id)}
                          className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                          aria-label={service.isPublished ? 'Dépublier' : 'Publier'}
                        >
                          {service.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setToDelete(service)}
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
              title="Aucune prestation trouvée"
              description="Modifiez votre recherche ou créez une nouvelle prestation."
              action={
                <Link to="/admin/prestations/nouvelle" className="btn-primary btn-sm">
                  <Plus size={15} />
                  Créer une prestation
                </Link>
              }
            />
          )}
        </div>
      </Panel>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer cette prestation ?"
        message={`« ${toDelete?.title} » sera définitivement supprimée, ainsi que ses images associées. Cette action est irréversible.`}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
        loading={remove.isPending}
      />
    </>
  );
}
