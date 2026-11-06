import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Loader2, Search, Upload } from 'lucide-react';
import { api, queryKeys } from '../../services/api';
import type { MediaItem, Paginated } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Modal, Spinner } from './ui';
import { cn, formatFileSize } from '../../utils';

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
  title?: string;
}

export function MediaPicker({ open, onClose, onSelect, title = 'Médiathèque' }: MediaPickerProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.media({ search, page }),
    queryFn: () =>
      api.get<Paginated<MediaItem>>(`/admin/media?limit=24&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
    enabled: open,
  });

  const upload = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('files', file));
      return api.upload<MediaItem[]>('/admin/media', formData);
    },
    onSuccess: (items) => {
      success(`${items.length} image(s) téléversée(s).`);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
      if (items[0]) onSelect(items[0]);
    },
    onError: (uploadError: Error) => error(uploadError.message),
  });

  return (
    <Modal open={open} onClose={onClose} title={title} description="Sélectionnez une image existante ou téléversez-en une nouvelle." size="lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input py-2.5 pl-9 text-[13px]"
            placeholder="Rechercher un fichier…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files?.length) upload.mutate(event.target.files);
              event.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="btn-primary btn-sm"
            disabled={upload.isPending}
          >
            {upload.isPending ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            Téléverser
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
            {data.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="group relative overflow-hidden rounded-lg border border-slate-200 text-left transition-all hover:border-aces-blue hover:shadow-soft"
              >
                <div className="aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.alt || item.filename}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-1.5">
                  <p className="truncate text-[10.5px] font-medium text-navy">{item.filename}</p>
                  <p className="text-[9.5px] text-slate-400">{formatFileSize(item.size)}</p>
                </div>
              </button>
            ))}
          </div>

          {data.pagination.totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-between text-[12px] text-slate-500">
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page <= 1}
              >
                Précédent
              </button>
              <span>
                {page} / {data.pagination.totalPages}
              </span>
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => setPage((value) => Math.min(data.pagination.totalPages, value + 1))}
                disabled={page >= data.pagination.totalPages}
              >
                Suivant
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 py-14 text-center">
          <ImagePlus size={26} className="mx-auto text-slate-300" />
          <p className="mt-3 text-[13px] font-medium text-navy">Aucun média trouvé</p>
          <p className="mt-1 text-[12px] text-ink-soft">Téléversez votre première image (JPG, PNG, WEBP — 8 Mo max).</p>
        </div>
      )}
    </Modal>
  );
}

/** Champ image avec aperçu + bouton de sélection dans la médiathèque. */
export function ImageField({
  label,
  value,
  onChange,
  hint,
  required,
  className,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  required?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={className}>
      <label className="label">
        {label} {required ? <span className="text-aces-gold">*</span> : null}
      </label>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50',
            !value && 'border-dashed'
          )}
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={20} className="text-slate-300" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            className="input py-2 text-[12.5px]"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/assets/images/… ou /uploads/…"
          />
          <button type="button" onClick={() => setOpen(true)} className="btn-ghost btn-sm">
            <ImagePlus size={14} />
            Choisir dans la médiathèque
          </button>
        </div>
      </div>
      {hint ? <p className="help">{hint}</p> : null}
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(media) => onChange(media.url)}
      />
    </div>
  );
}
