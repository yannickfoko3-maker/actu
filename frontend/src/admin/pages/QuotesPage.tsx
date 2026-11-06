import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Eye, Mail, Phone, Stamp, Trash2, X } from 'lucide-react';
import { api, queryKeys } from '../../services/api';
import type { Paginated, QuoteRequest } from '../../types';
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
import { QUOTE_STATUS, cn, formatDateTime } from '../../utils';

const STATUSES = ['NEW', 'IN_PROGRESS', 'DONE', 'ARCHIVED'] as const;

export default function QuotesPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(params.get('open'));
  const [notes, setNotes] = useState('');
  const [toDelete, setToDelete] = useState<QuoteRequest | null>(null);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.quotes({ search, status, page }),
    queryFn: () =>
      api.get<Paginated<QuoteRequest>>(
        `/admin/quotes?limit=20&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}${
          status ? `&status=${status}` : ''
        }`
      ),
  });

  const { data: selected } = useQuery({
    queryKey: queryKeys.admin.quote(selectedId ?? 'none'),
    queryFn: () => api.get<QuoteRequest>(`/admin/quotes/${selectedId}`),
    enabled: Boolean(selectedId),
  });

  useEffect(() => {
    if (selected) setNotes(selected.internalNotes ?? '');
  }, [selected]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'quotes'] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
  };

  const update = useMutation({
    mutationFn: (payload: Partial<QuoteRequest>) => api.patch<QuoteRequest>(`/admin/quotes/${selectedId}`, payload),
    onSuccess: () => {
      success('Demande mise à jour.');
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/quotes/${id}`),
    onSuccess: () => {
      success('Demande supprimée.');
      setToDelete(null);
      setSelectedId(null);
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const closeDetail = () => {
    setSelectedId(null);
    if (params.get('open')) {
      params.delete('open');
      setParams(params, { replace: true });
    }
  };

  const counters = useMemo(() => {
    const items = data?.items ?? [];
    return STATUSES.map((value) => ({
      value,
      count: items.filter((item) => item.status === value).length,
    }));
  }, [data]);

  const exportCsv = async () => {
    try {
      const response = await fetch(`/api/admin/quotes/export${status ? `?status=${status}` : ''}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Export impossible. Vérifiez votre session.');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aces-demandes-devis-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      success('Export CSV généré.');
    } catch (exportError) {
      error(exportError instanceof Error ? exportError.message : 'Export impossible.');
    }
  };

  return (
    <>
      <PageHeader
        title="Demandes de devis"
        description="Toutes les demandes envoyées depuis le formulaire de devis. Vous pouvez les qualifier, ajouter des notes et exporter la liste au format CSV."
        breadcrumb={['Commercial', 'Demandes de devis']}
        actions={
          <button type="button" onClick={exportCsv} className="btn-primary btn-sm">
            <Download size={15} />
            Exporter en CSV
          </button>
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
            placeholder="Nom, ville, prestation…"
            className="sm:w-72"
          />
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setStatus('');
                setPage(1);
              }}
              className={cn('chip', status === '' && 'chip-active')}
            >
              Toutes
            </button>
            {counters.map((counter) => (
              <button
                key={counter.value}
                type="button"
                onClick={() => {
                  setStatus(counter.value);
                  setPage(1);
                }}
                className={cn('chip', status === counter.value && 'chip-active')}
              >
                {QUOTE_STATUS[counter.value]?.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <LoadingBlock />
          ) : data && data.items.length > 0 ? (
            <>
              <Table head={['Demandeur', 'Prestation', 'Budget', 'Statut', 'Reçue le', 'Actions']}>
                {data.items.map((quote) => (
                  <tr key={quote.id} className={cn('hover:bg-slate-50/60', quote.status === 'NEW' && 'bg-aces-blue/[0.03]')}>
                    <Td>
                      <p className="text-[13px] font-semibold text-navy">{quote.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {quote.company ? `${quote.company} · ` : ''}
                        {quote.city}
                      </p>
                    </Td>
                    <Td className="max-w-[220px] truncate text-[12px] text-slate-600">{quote.serviceTitle}</Td>
                    <Td className="whitespace-nowrap text-[12px] text-slate-500">{quote.budget || '—'}</Td>
                    <Td>
                      <Badge className={QUOTE_STATUS[quote.status]?.className}>{QUOTE_STATUS[quote.status]?.label}</Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-[11.5px] text-slate-500">{formatDateTime(quote.createdAt)}</Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedId(quote.id)}
                          className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-aces-blue/10 hover:text-aces-blue"
                          aria-label="Consulter"
                        >
                          <Eye size={14} />
                        </button>
                        <a
                          href={`mailto:${quote.email}?subject=${encodeURIComponent(`Votre demande de devis — ${quote.serviceTitle}`)}`}
                          className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-navy"
                          aria-label="Répondre par e-mail"
                        >
                          <Mail size={14} />
                        </a>
                        <button
                          type="button"
                          onClick={() => setToDelete(quote)}
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
              title="Aucune demande"
              description="Les demandes envoyées depuis la page Devis apparaîtront ici."
            />
          )}
        </div>
      </Panel>

      {/* Panneau de détail */}
      {selectedId ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm" onClick={closeDetail} />
          <aside className="relative flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-[10.5px] uppercase tracking-[0.14em] text-slate-400">Demande de devis</p>
                <p className="font-display text-[16px] font-semibold text-navy">{selected?.name ?? 'Chargement…'}</p>
                {selected ? <p className="text-[11.5px] text-ink-soft">Reçue le {formatDateTime(selected.createdAt)}</p> : null}
              </div>
              <button
                type="button"
                onClick={closeDetail}
                className="grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {!selected ? (
                <LoadingBlock />
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={QUOTE_STATUS[selected.status]?.className}>{QUOTE_STATUS[selected.status]?.label}</Badge>
                    {selected.budget ? <Badge>Budget : {selected.budget}</Badge> : null}
                    <Badge>Contact : {selected.preferredContact}</Badge>
                  </div>

                  <dl className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label: 'E-mail', value: selected.email, href: `mailto:${selected.email}` },
                      { label: 'Téléphone', value: selected.phone, href: `tel:${selected.phone}` },
                      { label: 'Ville', value: selected.city },
                      { label: 'Entreprise', value: selected.company || '—' },
                      { label: 'Prestation', value: selected.serviceTitle },
                      { label: 'Consentement', value: selected.consent ? 'Donné' : 'Non donné' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg bg-slate-50 px-3 py-2.5">
                        <dt className="text-[10px] uppercase tracking-wider text-slate-400">{item.label}</dt>
                        <dd className="mt-0.5 text-[12.5px] font-medium text-navy">
                          {item.href ? (
                            <a href={item.href} className="text-aces-blue hover:underline">
                              {item.value}
                            </a>
                          ) : (
                            item.value
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div>
                    <p className="label">Description du projet</p>
                    <p className="whitespace-pre-line rounded-lg border border-slate-200 p-4 text-[13px] leading-relaxed text-ink">
                      {selected.projectDescription}
                    </p>
                  </div>

                  <div>
                    <label className="label" htmlFor="quote-status">
                      Statut de traitement
                    </label>
                    <select
                      id="quote-status"
                      className="input"
                      value={selected.status}
                      onChange={(event) => update.mutate({ status: event.target.value as QuoteRequest['status'] })}
                    >
                      {STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {QUOTE_STATUS[value]?.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label" htmlFor="quote-notes">
                      Notes internes
                    </label>
                    <textarea
                      id="quote-notes"
                      className="input resize-none"
                      rows={5}
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Visite technique prévue, devis envoyé, relance…"
                    />
                    <button
                      type="button"
                      onClick={() => update.mutate({ internalNotes: notes })}
                      className="btn-ghost btn-sm mt-2"
                      disabled={update.isPending}
                    >
                      <Stamp size={13} />
                      Enregistrer les notes
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    <a href={`mailto:${selected.email}`} className="btn-primary btn-sm">
                      <Mail size={14} />
                      Répondre
                    </a>
                    <a
                      href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost btn-sm"
                    >
                      WhatsApp
                    </a>
                    <a href={`tel:${selected.phone}`} className="btn-ghost btn-sm">
                      <Phone size={14} />
                      Appeler
                    </a>
                    <button
                      type="button"
                      onClick={() => setToDelete(selected)}
                      className="btn-ghost btn-sm text-red-600 hover:border-red-200 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer cette demande ?"
        message={`La demande de ${toDelete?.name} sera définitivement supprimée.`}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
        loading={remove.isPending}
      />
    </>
  );
}
