import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Archive,
  CheckCheck,
  Mail,
  MailOpen,
  MessageSquare,
  Phone,
  Send,
  Trash2,
} from 'lucide-react';
import { api, queryKeys } from '../../services/api';
import type { ContactMessage, Paginated } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import {
  Badge,
  ConfirmDialog,
  EmptyState,
  Field,
  LoadingBlock,
  Modal,
  PageHeader,
  Pagination,
  Panel,
  SearchInput,
  Spinner,
} from '../components/ui';
import { MESSAGE_STATUS, cn, formatDateTime } from '../../utils';

export default function MessagesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [reply, setReply] = useState({ subject: '', message: '' });
  const [toDelete, setToDelete] = useState<ContactMessage | null>(null);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.messages({ search, status, page }),
    queryFn: () =>
      api.get<Paginated<ContactMessage>>(
        `/admin/messages?limit=20&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}${
          status ? `&status=${status}` : ''
        }`
      ),
  });

  const { data: selected } = useQuery({
    queryKey: queryKeys.admin.message(selectedId ?? 'none'),
    queryFn: () => api.get<ContactMessage>(`/admin/messages/${selectedId}`),
    enabled: Boolean(selectedId),
  });

  useEffect(() => {
    if (!selectedId && data?.items.length) setSelectedId(data.items[0].id);
  }, [data, selectedId]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
  };

  const updateStatus = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: string }) =>
      api.patch(`/admin/messages/${id}`, { status: nextStatus }),
    onSuccess: () => {
      success('Message mis à jour.');
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const sendReply = useMutation({
    mutationFn: () => api.post<{ sent: boolean; message: string }>(`/admin/messages/${selectedId}/reply`, reply),
    onSuccess: (result) => {
      success(result.message);
      setReplyOpen(false);
      setReply({ subject: '', message: '' });
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/messages/${id}`),
    onSuccess: () => {
      success('Message supprimé.');
      setToDelete(null);
      setSelectedId(null);
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const openReply = () => {
    if (!selected) return;
    setReply({
      subject: `Réponse à votre message : ${selected.subject}`,
      message: `Bonjour ${selected.name},\n\nNous avons bien reçu votre message et vous en remercions.\n\n`,
    });
    setReplyOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Messages"
        description="Messages envoyés depuis le formulaire de contact du site."
        breadcrumb={['Commercial', 'Messages']}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Panel className="lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Rechercher…"
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              { value: '', label: 'Tous' },
              { value: 'NEW', label: 'Non lus' },
              { value: 'READ', label: 'Lus' },
              { value: 'ARCHIVED', label: 'Archivés' },
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

          <div className="mt-4">
            {isLoading ? (
              <LoadingBlock />
            ) : data && data.items.length > 0 ? (
              <>
                <ul className="divide-y divide-slate-100">
                  {data.items.map((message) => (
                    <li key={message.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(message.id)}
                        className={cn(
                          'w-full px-1 py-3 text-left transition-colors hover:bg-slate-50',
                          selectedId === message.id && 'bg-aces-blue/5'
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={cn(
                              'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[10px] font-semibold',
                              message.status === 'NEW'
                                ? 'bg-aces-gold/15 text-aces-gold'
                                : 'bg-slate-100 text-slate-500'
                            )}
                          >
                            {message.name.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'truncate text-[12.5px]',
                                  message.status === 'NEW' ? 'font-semibold text-navy' : 'font-medium text-ink'
                                )}
                              >
                                {message.name}
                              </span>
                              {message.status === 'NEW' ? (
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-aces-blue" />
                              ) : null}
                            </span>
                            <span className="mt-0.5 block truncate text-[11.5px] text-ink">{message.subject}</span>
                            <span className="mt-0.5 block truncate text-[10.5px] text-slate-400">
                              {formatDateTime(message.createdAt)}
                            </span>
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
                <Pagination pagination={data.pagination} onPage={setPage} />
              </>
            ) : (
              <EmptyState title="Aucun message" description="Les messages du site apparaîtront ici." icon={<MessageSquare size={18} />} />
            )}
          </div>
        </Panel>

        <Panel title={selected ? selected.subject : 'Sélectionnez un message'}>
          {!selected ? (
            <p className="py-10 text-center text-[12.5px] text-ink-soft">
              Choisissez un message dans la liste pour afficher son contenu.
            </p>
          ) : (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <p className="font-display text-[15px] font-semibold text-navy">{selected.subject}</p>
                  <p className="mt-1 text-[12px] text-ink-soft">
                    De <span className="font-medium text-ink">{selected.name}</span> ·{' '}
                    {formatDateTime(selected.createdAt)}
                  </p>
                </div>
                <Badge className={MESSAGE_STATUS[selected.status]?.className}>
                  {MESSAGE_STATUS[selected.status]?.label}
                </Badge>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                  <dt className="text-[10px] uppercase tracking-wider text-slate-400">E-mail</dt>
                  <dd className="mt-0.5">
                    <a href={`mailto:${selected.email}`} className="text-[12.5px] font-medium text-aces-blue hover:underline">
                      {selected.email}
                    </a>
                  </dd>
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2.5">
                  <dt className="text-[10px] uppercase tracking-wider text-slate-400">Téléphone</dt>
                  <dd className="mt-0.5">
                    <a href={`tel:${selected.phone}`} className="text-[12.5px] font-medium text-aces-blue hover:underline">
                      {selected.phone}
                    </a>
                  </dd>
                </div>
              </dl>

              <div className="mt-4 rounded-lg border border-slate-200 p-4">
                <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink">{selected.message}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={openReply} className="btn-primary btn-sm">
                  <Send size={14} />
                  Répondre par e-mail
                </button>
                <a href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re : ${selected.subject}`)}`} className="btn-ghost btn-sm">
                  <Mail size={14} />
                  Ouvrir dans la messagerie
                </a>
                <a href={`tel:${selected.phone}`} className="btn-ghost btn-sm">
                  <Phone size={14} />
                  Appeler
                </a>
                {selected.status !== 'READ' ? (
                  <button
                    type="button"
                    onClick={() => updateStatus.mutate({ id: selected.id, nextStatus: 'READ' })}
                    className="btn-ghost btn-sm"
                  >
                    <MailOpen size={14} />
                    Marquer comme lu
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => updateStatus.mutate({ id: selected.id, nextStatus: 'NEW' })}
                    className="btn-ghost btn-sm"
                  >
                    <CheckCheck size={14} />
                    Marquer comme non lu
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => updateStatus.mutate({ id: selected.id, nextStatus: 'ARCHIVED' })}
                  className="btn-ghost btn-sm"
                >
                  <Archive size={14} />
                  Archiver
                </button>
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
        </Panel>
      </div>

      <Modal
        open={replyOpen}
        onClose={() => setReplyOpen(false)}
        title={`Répondre à ${selected?.name ?? ''}`}
        footer={
          <>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setReplyOpen(false)}>
              Annuler
            </button>
            <button type="button" className="btn-primary btn-sm" onClick={() => sendReply.mutate()} disabled={sendReply.isPending}>
              {sendReply.isPending ? <Spinner className="text-white" /> : <Send size={14} />}
              Envoyer
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-[11.5px] text-ink-soft">
            Destinataire : <span className="font-medium text-navy">{selected?.email}</span>
            <br />
            Si le serveur SMTP n’est pas configuré, la réponse est enregistrée dans le journal d’activité mais aucun
            e-mail n’est envoyé.
          </p>
          <Field label="Objet" required>
            <input className="input" value={reply.subject} onChange={(event) => setReply({ ...reply, subject: event.target.value })} />
          </Field>
          <Field label="Message" required>
            <textarea
              className="input resize-none"
              rows={8}
              value={reply.message}
              onChange={(event) => setReply({ ...reply, message: event.target.value })}
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer ce message ?"
        message={`Le message de ${toDelete?.name} sera définitivement supprimé.`}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
        loading={remove.isPending}
      />
    </>
  );
}
