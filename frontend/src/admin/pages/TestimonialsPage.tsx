import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { api, queryKeys } from '../../services/api';
import type { Testimonial } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import {
  Badge,
  ConfirmDialog,
  EmptyState,
  Field,
  LoadingBlock,
  Modal,
  PageHeader,
  Panel,
  Spinner,
  Toggle,
} from '../components/ui';
import { ImageField } from '../components/MediaPicker';
import { cn } from '../../utils';

const EMPTY = {
  authorName: '',
  authorRole: '',
  company: '',
  content: '',
  rating: 5,
  photo: '',
  isPublished: true,
  order: 0,
};

export default function TestimonialsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [draft, setDraft] = useState(EMPTY);
  const [toDelete, setToDelete] = useState<Testimonial | null>(null);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.testimonials,
    queryFn: () => api.get<Testimonial[]>('/admin/testimonials'),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.testimonials });
    void queryClient.invalidateQueries({ queryKey: queryKeys.testimonials });
    void queryClient.invalidateQueries({ queryKey: queryKeys.home });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
  };

  const save = useMutation({
    mutationFn: () =>
      editing
        ? api.put<Testimonial>(`/admin/testimonials/${editing.id}`, draft)
        : api.post<Testimonial>('/admin/testimonials', draft),
    onSuccess: () => {
      success(editing ? 'Témoignage mis à jour.' : 'Témoignage ajouté.');
      setModalOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const toggle = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/testimonials/${id}/publish`),
    onSuccess: () => {
      success('Visibilité mise à jour.');
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/testimonials/${id}`),
    onSuccess: () => {
      success('Témoignage supprimé.');
      setToDelete(null);
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const openNew = () => {
    setEditing(null);
    setDraft({ ...EMPTY, order: (data?.length ?? 0) + 1 });
    setModalOpen(true);
  };

  const openEdit = (testimonial: Testimonial) => {
    setEditing(testimonial);
    setDraft({
      authorName: testimonial.authorName,
      authorRole: testimonial.authorRole ?? '',
      company: testimonial.company ?? '',
      content: testimonial.content,
      rating: testimonial.rating,
      photo: testimonial.photo ?? '',
      isPublished: testimonial.isPublished,
      order: testimonial.order,
    });
    setModalOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Témoignages"
        description="Les avis publiés apparaissent sur la page d’accueil. N’ajoutez que des témoignages réellement recueillis auprès de vos clients."
        breadcrumb={['Contenus', 'Témoignages']}
        actions={
          <button type="button" onClick={openNew} className="btn-primary btn-sm">
            <Plus size={15} />
            Ajouter un témoignage
          </button>
        }
      />

      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-900">
        <strong>Important :</strong> ne publiez pas de témoignages fictifs. Tant qu’aucun avis n’est saisi, la section
        correspondante du site public est automatiquement masquée.
      </div>

      {isLoading ? (
        <LoadingBlock />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          title="Aucun témoignage"
          description="Ajoutez un premier avis client après accord de la personne concernée."
          action={
            <button type="button" onClick={openNew} className="btn-primary btn-sm">
              <Plus size={15} />
              Ajouter
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {data?.map((testimonial) => (
            <Panel key={testimonial.id}>
              <div className="flex items-start gap-3">
                {testimonial.photo ? (
                  <img src={testimonial.photo} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-[12px] font-semibold text-white">
                    {testimonial.authorName.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-semibold text-navy">{testimonial.authorName}</p>
                    <Badge
                      className={
                        testimonial.isPublished
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-slate-50 text-slate-500'
                      }
                    >
                      {testimonial.isPublished ? 'Publié' : 'Masqué'}
                    </Badge>
                  </div>
                  <p className="text-[11.5px] text-ink-soft">
                    {[testimonial.authorRole, testimonial.company].filter(Boolean).join(' · ') || '—'}
                  </p>
                  <div className="mt-1 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={11}
                        className={cn(star <= testimonial.rating ? 'fill-aces-gold text-aces-gold' : 'text-slate-300')}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-ink">« {testimonial.content} »</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(testimonial)}
                    className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-aces-blue/10 hover:text-aces-blue"
                    aria-label="Modifier"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle.mutate(testimonial.id)}
                    className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                    aria-label="Changer la visibilité"
                  >
                    {testimonial.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(testimonial)}
                    className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier le témoignage' : 'Nouveau témoignage'}
        footer={
          <>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button type="button" className="btn-primary btn-sm" onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? <Spinner className="text-white" /> : null}
              Enregistrer
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom du client" required>
            <input
              className="input"
              value={draft.authorName}
              onChange={(event) => setDraft({ ...draft, authorName: event.target.value })}
            />
          </Field>
          <Field label="Fonction">
            <input
              className="input"
              value={draft.authorRole}
              onChange={(event) => setDraft({ ...draft, authorRole: event.target.value })}
            />
          </Field>
          <Field label="Entreprise">
            <input
              className="input"
              value={draft.company}
              onChange={(event) => setDraft({ ...draft, company: event.target.value })}
            />
          </Field>
          <Field label="Note">
            <select
              className="input"
              value={draft.rating}
              onChange={(event) => setDraft({ ...draft, rating: Number(event.target.value) })}
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} / 5
                </option>
              ))}
            </select>
          </Field>
          <Field label="Témoignage" required className="sm:col-span-2">
            <textarea
              className="input resize-none"
              rows={4}
              value={draft.content}
              onChange={(event) => setDraft({ ...draft, content: event.target.value })}
            />
          </Field>
          <div className="sm:col-span-2">
            <ImageField
              label="Photo (facultative)"
              value={draft.photo}
              onChange={(value) => setDraft({ ...draft, photo: value })}
            />
          </div>
          <Field label="Ordre">
            <input
              type="number"
              className="input"
              value={draft.order}
              onChange={(event) => setDraft({ ...draft, order: Number(event.target.value) })}
            />
          </Field>
          <div className="flex items-end">
            <Toggle
              checked={draft.isPublished}
              onChange={(value) => setDraft({ ...draft, isPublished: value })}
              label="Publier"
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer ce témoignage ?"
        message={`Le témoignage de « ${toDelete?.authorName} » sera définitivement supprimé.`}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
        loading={remove.isPending}
      />
    </>
  );
}
