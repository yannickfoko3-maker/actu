import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, ImagePlus, Pencil, Trash2, Upload } from 'lucide-react';
import { api, queryKeys } from '../../services/api';
import type { MediaItem, Paginated } from '../../types';
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
import { cn, formatFileSize, formatShortDate } from '../../utils';

export default function MediaPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [draft, setDraft] = useState({ alt: '', caption: '' });
  const [toDelete, setToDelete] = useState<MediaItem | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.media({ search, page }),
    queryFn: () =>
      api.get<Paginated<MediaItem>>(`/admin/media?limit=24&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
  };

  const upload = useMutation({
    mutationFn: (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      return api.upload<MediaItem[]>('/admin/media', formData);
    },
    onSuccess: (items) => {
      success(`${items.length} fichier(s) importé(s).`);
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const update = useMutation({
    mutationFn: () => api.patch<MediaItem>(`/admin/media/${editing?.id}`, draft),
    onSuccess: () => {
      success('Médias mis à jour.');
      setEditing(null);
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/media/${id}`),
    onSuccess: () => {
      success('Fichier supprimé.');
      setToDelete(null);
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    upload.mutate(Array.from(files));
  };

  const copyUrl = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(item.id);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      error('Impossible de copier l’URL dans ce navigateur.');
    }
  };

  return (
    <>
      <PageHeader
        title="Médiathèque"
        description="Toutes les images utilisées sur le site. Importez, renommez et réutilisez vos visuels depuis les différents formulaires."
        breadcrumb={['Contenus', 'Médiathèque']}
        actions={
          <button type="button" onClick={() => fileInput.current?.click()} className="btn-primary btn-sm" disabled={upload.isPending}>
            {upload.isPending ? <Spinner className="text-white" /> : <Upload size={15} />}
            Importer des fichiers
          </button>
        }
      />

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <Panel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Rechercher un fichier…"
            className="sm:w-72"
          />
          <p className="text-[11.5px] text-slate-400">
            {data?.pagination.total ?? 0} fichier(s) · JPG, PNG, WEBP, SVG, GIF — 5 Mo max.
          </p>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
          className={cn(
            'mt-4 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
            dragging ? 'border-aces-blue bg-aces-blue/5' : 'border-slate-200 bg-slate-50/60'
          )}
        >
          <ImagePlus size={22} className="mx-auto text-slate-400" />
          <p className="mt-2 text-[12.5px] text-ink">
            Glissez-déposez vos images ici ou{' '}
            <button type="button" onClick={() => fileInput.current?.click()} className="font-semibold text-aces-blue">
              parcourez vos fichiers
            </button>
          </p>
        </div>

        <div className="mt-5">
          {isLoading ? (
            <LoadingBlock />
          ) : data && data.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                {data.items.map((item) => (
                  <div key={item.id} className="group overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="relative aspect-[4/3] bg-slate-100">
                      <img src={item.url} alt={item.alt} className="h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-navy/70 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => copyUrl(item)}
                          className="grid h-8 w-8 place-items-center rounded-md bg-white/95 text-navy hover:bg-white"
                          aria-label="Copier l’URL"
                        >
                          {copied === item.id ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(item);
                            setDraft({ alt: item.alt, caption: item.caption });
                          }}
                          className="grid h-8 w-8 place-items-center rounded-md bg-white/95 text-navy hover:bg-white"
                          aria-label="Modifier"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setToDelete(item)}
                          className="grid h-8 w-8 place-items-center rounded-md bg-white/95 text-red-600 hover:bg-white"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="truncate text-[11.5px] font-medium text-navy" title={item.filename}>
                        {item.filename}
                      </p>
                      <p className="mt-0.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{formatFileSize(item.size)}</span>
                        <span>{formatShortDate(item.createdAt)}</span>
                      </p>
                      {item.alt ? (
                        <p className="mt-1 line-clamp-1 text-[10px] text-slate-400" title={item.alt}>
                          {item.alt}
                        </p>
                      ) : (
                        <Badge className="mt-1 border-amber-200 bg-amber-50 text-[9.5px] text-amber-700">Sans texte alt</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Pagination pagination={data.pagination} onPage={setPage} />
            </>
          ) : (
            <EmptyState
              title="Médiathèque vide"
              description="Importez vos premières images pour les utiliser dans les pages du site."
              icon={<ImagePlus size={18} />}
              action={
                <button type="button" onClick={() => fileInput.current?.click()} className="btn-primary btn-sm">
                  <Upload size={15} />
                  Importer des images
                </button>
              }
            />
          )}
        </div>
      </Panel>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Détails du fichier"
        footer={
          <>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setEditing(null)}>
              Annuler
            </button>
            <button type="button" className="btn-primary btn-sm" onClick={() => update.mutate()} disabled={update.isPending}>
              {update.isPending ? <Spinner className="text-white" /> : null}
              Enregistrer
            </button>
          </>
        }
      >
        {editing ? (
          <div className="space-y-4">
            <img src={editing.url} alt={editing.alt} className="max-h-56 w-full rounded-lg object-contain" />
            <div className="grid grid-cols-2 gap-3 text-[11.5px] text-ink-soft">
              <p>
                <span className="block text-[10px] uppercase tracking-wider text-slate-400">Fichier</span>
                {editing.originalName}
              </p>
              <p>
                <span className="block text-[10px] uppercase tracking-wider text-slate-400">Dimensions</span>
                {editing.width && editing.height ? `${editing.width} × ${editing.height} px` : '—'}
              </p>
              <p>
                <span className="block text-[10px] uppercase tracking-wider text-slate-400">Taille</span>
                {formatFileSize(editing.size)}
              </p>
              <p className="truncate">
                <span className="block text-[10px] uppercase tracking-wider text-slate-400">URL</span>
                {editing.url}
              </p>
            </div>
            <Field label="Texte alternatif (accessibilité)" hint="Décrivez l’image pour les lecteurs d’écran.">
              <input className="input" value={draft.alt} onChange={(event) => setDraft({ ...draft, alt: event.target.value })} />
            </Field>
            <Field label="Légende">
              <input
                className="input"
                value={draft.caption}
                onChange={(event) => setDraft({ ...draft, caption: event.target.value })}
              />
            </Field>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer ce fichier ?"
        message={`« ${toDelete?.originalName} » sera supprimé du serveur. Les pages qui l’utilisent afficheront une image manquante.`}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
        loading={remove.isPending}
      />
    </>
  );
}
