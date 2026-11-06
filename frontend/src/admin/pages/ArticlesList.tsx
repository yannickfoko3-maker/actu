import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, queryKeys } from '../../services/api';
import type { Article, Category, Paginated } from '../../types';
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
import { ARTICLE_STATUS, cn, formatShortDate } from '../../utils';

export default function ArticlesList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Article | null>(null);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.articles({ search, status, page }),
    queryFn: () =>
      api.get<Paginated<Article>>(
        `/admin/articles?limit=15&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}${
          status ? `&status=${status}` : ''
        }`
      ),
  });

  const { data: categories } = useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: () => api.get<Category[]>('/public/categories'),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    void queryClient.invalidateQueries({ queryKey: ['articles'] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.home });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
  };

  const setArticleStatus = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: string }) =>
      api.patch(`/admin/articles/${id}/status`, { status: nextStatus }),
    onSuccess: () => {
      success('Statut de l’article mis à jour.');
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/articles/${id}`),
    onSuccess: () => {
      success('Article supprimé.');
      setToDelete(null);
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  return (
    <>
      <PageHeader
        title="Actualités"
        description="Articles d’information et de conseil. Les brouillons ne sont pas visibles sur le site public."
        breadcrumb={['Contenus', 'Actualités']}
        actions={
          <Link to="/admin/actualites/nouvelle" className="btn-primary btn-sm">
            <Plus size={15} />
            Nouvel article
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
            }}
            placeholder="Rechercher un article…"
            className="sm:w-72"
          />
          <div className="flex gap-2">
            {[
              { value: '', label: 'Tous' },
              { value: 'PUBLISHED', label: 'Publiés' },
              { value: 'DRAFT', label: 'Brouillons' },
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
              <Table head={['Article', 'Catégorie', 'Statut', 'Publié le', 'Actions']}>
                {data.items.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50/60">
                    <Td>
                      <div className="flex items-center gap-3">
                        <img
                          src={article.coverImage}
                          alt=""
                          className="h-11 w-16 shrink-0 rounded-md object-cover"
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-navy">{article.title}</p>
                          <p className="truncate text-[11px] text-slate-400">
                            {article.readingTime} min · {article.views ?? 0} vue(s)
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-[12px] text-slate-500">{article.category?.name ?? '—'}</Td>
                    <Td>
                      <Badge className={ARTICLE_STATUS[article.status ?? 'DRAFT']?.className}>
                        {ARTICLE_STATUS[article.status ?? 'DRAFT']?.label}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-[12px] text-slate-500">
                      {article.publishedAt ? formatShortDate(article.publishedAt) : '—'}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/admin/actualites/${article.id}`}
                          className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-aces-blue/10 hover:text-aces-blue"
                          aria-label="Modifier"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setArticleStatus.mutate({
                              id: article.id,
                              nextStatus: article.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
                            })
                          }
                          className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                          aria-label="Changer le statut"
                        >
                          {article.status === 'PUBLISHED' ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setToDelete(article)}
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
              title="Aucun article"
              description="Rédigez votre premier article de conseil."
              action={
                <Link to="/admin/actualites/nouvelle" className="btn-primary btn-sm">
                  <Plus size={15} />
                  Nouvel article
                </Link>
              }
            />
          )}
        </div>
        {categories ? (
          <p className="mt-4 text-[11.5px] text-slate-400">
            {categories.length} catégorie(s) disponible(s) — gérez-les depuis l’éditeur d’article.
          </p>
        ) : null}
      </Panel>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer cet article ?"
        message={`« ${toDelete?.title} » sera définitivement supprimé.`}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
        loading={remove.isPending}
      />
    </>
  );
}
