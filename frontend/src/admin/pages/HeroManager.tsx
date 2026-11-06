import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, queryKeys } from '../../services/api';
import type { HeroSlide } from '../../types';
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

const EMPTY_SLIDE: Omit<HeroSlide, 'id'> = {
  eyebrow: '',
  title: '',
  subtitle: '',
  image: '',
  primaryLabel: 'Demander un devis',
  primaryUrl: '/devis',
  secondaryLabel: 'Découvrir nos solutions',
  secondaryUrl: '/nos-activites',
  order: 0,
  isActive: true,
};

export default function HeroManager() {
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [draft, setDraft] = useState<Omit<HeroSlide, 'id'>>(EMPTY_SLIDE);
  const [toDelete, setToDelete] = useState<HeroSlide | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data: slides, isLoading } = useQuery({
    queryKey: queryKeys.admin.hero,
    queryFn: () => api.get<HeroSlide[]>('/admin/hero'),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.hero });
    void queryClient.invalidateQueries({ queryKey: queryKeys.home });
    void queryClient.invalidateQueries({ queryKey: queryKeys.site });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
  };

  const save = useMutation({
    mutationFn: () =>
      editing
        ? api.put<HeroSlide>(`/admin/hero/${editing.id}`, draft)
        : api.post<HeroSlide>('/admin/hero', { ...draft, order: draft.order || (slides?.length ?? 0) + 1 }),
    onSuccess: () => {
      success(editing ? 'Diapositive mise à jour.' : 'Diapositive ajoutée.');
      setEditing(null);
      setModalOpen(false);
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const toggle = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/hero/${id}/toggle`),
    onSuccess: () => {
      success('Visibilité mise à jour.');
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/hero/${id}`),
    onSuccess: () => {
      success('Diapositive supprimée.');
      setToDelete(null);
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const reorder = useMutation({
    mutationFn: (items: { id: string; order: number }[]) => api.patch('/admin/hero/reorder', { items }),
    onSuccess: () => invalidate(),
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const openNew = () => {
    setEditing(null);
    setDraft({ ...EMPTY_SLIDE, order: (slides?.length ?? 0) + 1 });
    setModalOpen(true);
  };

  const openEdit = (slide: HeroSlide) => {
    setEditing(slide);
    setDraft({ ...slide });
    setModalOpen(true);
  };

  const move = (slide: HeroSlide, direction: -1 | 1) => {
    const list = slides ?? [];
    const index = list.findIndex((item) => item.id === slide.id);
    const target = list[index + direction];
    if (!target) return;
    reorder.mutate([
      { id: slide.id, order: target.order },
      { id: target.id, order: slide.order },
    ]);
  };

  const closeModal = () => {
    setEditing(null);
    setDraft(EMPTY_SLIDE);
    setModalOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Carrousel d’accueil"
        description="Les diapositives affichées en haut de la page d’accueil. Toute modification est visible immédiatement sur le site public."
        breadcrumb={['Contenus', 'Carrousel']}
        actions={
          <button type="button" onClick={openNew} className="btn-primary btn-sm">
            <Plus size={15} />
            Ajouter une diapositive
          </button>
        }
      />

      {isLoading ? (
        <LoadingBlock />
      ) : (slides ?? []).length === 0 ? (
        <EmptyState
          title="Aucune diapositive"
          description="Ajoutez une première diapositive pour animer le haut de la page d’accueil."
          action={
            <button type="button" onClick={openNew} className="btn-primary btn-sm">
              <Plus size={15} />
              Créer une diapositive
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {slides?.map((slide) => (
            <Panel key={slide.id} className="overflow-hidden">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-lg sm:w-40">
                  <img src={slide.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  <span className="absolute left-2 top-2 rounded bg-navy/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {slide.order}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={
                        slide.isActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-slate-50 text-slate-500'
                      }
                    >
                      {slide.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {slide.eyebrow ? <span className="text-[11px] text-slate-400">{slide.eyebrow}</span> : null}
                  </div>
                  <p className="mt-1.5 font-display text-[14.5px] font-semibold text-navy">{slide.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[12px] text-ink-soft">{slide.subtitle}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-400">
                    <span>Bouton 1 : {slide.primaryLabel} → {slide.primaryUrl}</span>
                    <span>Bouton 2 : {slide.secondaryLabel} → {slide.secondaryUrl}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(slide, -1)}
                    className="grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-navy"
                    aria-label="Monter"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(slide, 1)}
                    className="grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-navy"
                    aria-label="Descendre"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle.mutate(slide.id)}
                    className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                    aria-label={slide.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {slide.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(slide)}
                    className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-aces-blue/10 hover:text-aces-blue"
                    aria-label="Modifier"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(slide)}
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
        onClose={closeModal}
        title={editing ? 'Modifier la diapositive' : 'Nouvelle diapositive'}
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={closeModal}
            >
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
          <Field label="Sur-titre" className="sm:col-span-2">
            <input
              className="input"
              value={draft.eyebrow ?? ''}
              onChange={(event) => setDraft({ ...draft, eyebrow: event.target.value })}
              placeholder="Ex. : Sécurité électronique & automatisation"
            />
          </Field>
          <Field label="Titre" required className="sm:col-span-2">
            <input
              className="input"
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </Field>
          <Field label="Sous-titre" required className="sm:col-span-2">
            <textarea
              className="input resize-none"
              rows={3}
              value={draft.subtitle}
              onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })}
            />
          </Field>
          <ImageField
            label="Image de fond"
            required
            className="sm:col-span-2"
            value={draft.image}
            onChange={(value) => setDraft({ ...draft, image: value })}
            hint="Format paysage recommandé (1920 × 1080). Un voile bleu est appliqué automatiquement pour la lisibilité."
          />
          <Field label="Libellé du bouton principal">
            <input
              className="input"
              value={draft.primaryLabel}
              onChange={(event) => setDraft({ ...draft, primaryLabel: event.target.value })}
            />
          </Field>
          <Field label="Destination du bouton principal">
            <input
              className="input"
              value={draft.primaryUrl}
              onChange={(event) => setDraft({ ...draft, primaryUrl: event.target.value })}
              placeholder="/devis"
            />
          </Field>
          <Field label="Libellé du second bouton">
            <input
              className="input"
              value={draft.secondaryLabel}
              onChange={(event) => setDraft({ ...draft, secondaryLabel: event.target.value })}
            />
          </Field>
          <Field label="Destination du second bouton">
            <input
              className="input"
              value={draft.secondaryUrl}
              onChange={(event) => setDraft({ ...draft, secondaryUrl: event.target.value })}
            />
          </Field>
          <Field label="Ordre">
            <input
              type="number"
              className="input"
              value={draft.order}
              onChange={(event) => setDraft({ ...draft, order: Number(event.target.value) })}
            />
          </Field>
          <div className="sm:col-span-2">
            <Toggle
              checked={draft.isActive}
              onChange={(value) => setDraft({ ...draft, isActive: value })}
              label="Diapositive active"
              description="Les diapositives inactives ne s’affichent pas sur le site."
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer cette diapositive ?"
        message={`« ${toDelete?.title} » sera retirée du carrousel d’accueil.`}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
        loading={remove.isPending}
      />
    </>
  );
}
