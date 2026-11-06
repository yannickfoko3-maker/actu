import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Lock, Pencil, Trash2 } from 'lucide-react';
import { api, queryKeys } from '../../services/api';
import type { PageContent, Paginated } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import {
  Badge,
  ConfirmDialog,
  EmptyState,
  LoadingBlock,
  PageHeader,
  Panel,
  SearchInput,
  Table,
  Td,
} from '../components/ui';
import { formatShortDate } from '../../utils';

export default function PagesList() {
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState<PageContent | null>(null);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.pages({ search }),
    queryFn: () =>
      api.get<Paginated<PageContent>>(`/admin/pages?limit=50${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/pages/${id}`),
    onSuccess: () => {
      success('Page supprimée.');
      setToDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] });
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  return (
    <>
      <PageHeader
        title="Pages"
        description="Mentions légales, politique de confidentialité et pages libres. Le contenu est éditable avec un éditeur de texte riche."
        breadcrumb={['Contenus', 'Pages']}
      />

      <Panel>
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher une page…" className="sm:w-72" />

        <div className="mt-4">
          {isLoading ? (
            <LoadingBlock />
          ) : data && data.items.length > 0 ? (
            <Table head={['Page', 'Statut', 'Modifiée', 'Actions']}>
              {data.items.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50/60">
                  <Td>
                    <p className="text-[13px] font-semibold text-navy">{page.title}</p>
                    <p className="text-[11px] text-slate-400">/{page.slug}</p>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        className={
                          page.status === 'PUBLISHED'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-50 text-slate-500'
                        }
                      >
                        {page.status === 'PUBLISHED' ? 'Publiée' : 'Brouillon'}
                      </Badge>
                      {page.system ? (
                        <span title="Page système" className="text-slate-400">
                          <Lock size={12} />
                        </span>
                      ) : null}
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap text-[12px] text-slate-500">
                    {formatShortDate(page.updatedAt)}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/admin/pages/${page.id}`}
                        className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-aces-blue/10 hover:text-aces-blue"
                        aria-label="Modifier"
                      >
                        <Pencil size={14} />
                      </Link>
                      <Link
                        to={`/${page.slug}`}
                        target="_blank"
                        className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-navy"
                        aria-label="Voir"
                      >
                        <ExternalLink size={14} />
                      </Link>
                      {!page.system ? (
                        <button
                          type="button"
                          onClick={() => setToDelete(page)}
                          className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : null}
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState title="Aucune page" description="Les pages système sont créées automatiquement." />
          )}
        </div>
      </Panel>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer cette page ?"
        message={`« ${toDelete?.title} » sera définitivement supprimée.`}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
        loading={remove.isPending}
      />
    </>
  );
}
