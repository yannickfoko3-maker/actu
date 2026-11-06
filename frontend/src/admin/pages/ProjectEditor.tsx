import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { api, queryKeys } from '../../services/api';
import type { Project, ServiceSummary } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Field, LoadingBlock, PageHeader, Panel, Toggle } from '../components/ui';
import { ImageField } from '../components/MediaPicker';
import { RichTextEditor } from '../components/RichTextEditor';
import { slugify } from '../../utils';

export default function ProjectEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: '',
    client: '',
    location: '',
    year: new Date().getFullYear(),
    summary: '',
    description: '',
    coverImage: '',
    isPublished: true,
    featured: false,
    order: 0,
    images: [] as { url: string; alt: string }[],
  });

  const { data: services } = useQuery({
    queryKey: queryKeys.services,
    queryFn: () => api.get<ServiceSummary[]>('/public/services'),
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.project(id ?? 'new'),
    queryFn: () => api.get<Project>(`/admin/projects/${id}`),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title,
        slug: data.slug,
        category: data.category,
        client: data.client ?? '',
        location: data.location,
        year: data.year ?? new Date().getFullYear(),
        summary: data.summary,
        description: data.description,
        coverImage: data.coverImage,
        isPublished: data.isPublished,
        featured: data.featured,
        order: data.order,
        images: data.images.map((image) => ({ url: image.url, alt: image.alt })),
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, slug: form.slug || slugify(form.title), year: Number(form.year) || null };
      return isNew ? api.post<Project>('/admin/projects', payload) : api.put<Project>(`/admin/projects/${id}`, payload);
    },
    onSuccess: (project) => {
      success(isNew ? 'Réalisation créée.' : 'Réalisation enregistrée.');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.home });
      if (isNew) navigate(`/admin/realisations/${project.id}`);
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  if (id && isLoading) return <LoadingBlock label="Chargement de la réalisation…" />;

  return (
    <>
      <PageHeader
        title={isNew ? 'Nouvelle réalisation' : form.title || 'Réalisation'}
        breadcrumb={['Contenus', 'Réalisations', isNew ? 'Nouvelle' : 'Édition']}
        actions={
          <>
            <Link to="/admin/realisations" className="btn-ghost btn-sm">
              <ArrowLeft size={14} />
              Retour
            </Link>
            <button type="button" className="btn-primary btn-sm" onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Enregistrer
            </button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel title="Présentation du projet">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Titre" required className="sm:col-span-2">
                <input className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
              </Field>
              <Field label="Slug">
                <input
                  className="input"
                  value={form.slug}
                  placeholder={slugify(form.title)}
                  onChange={(event) => setForm({ ...form, slug: event.target.value })}
                />
              </Field>
              <Field label="Prestation associée" required>
                <select
                  className="input"
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                >
                  <option value="">Sélectionner…</option>
                  {(services ?? []).map((service) => (
                    <option key={service.slug} value={service.slug}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Lieu" required>
                <input className="input" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
              </Field>
              <Field label="Année">
                <input
                  type="number"
                  className="input"
                  value={form.year}
                  onChange={(event) => setForm({ ...form, year: Number(event.target.value) })}
                />
              </Field>
              <Field label="Client (facultatif)" className="sm:col-span-2">
                <input className="input" value={form.client} onChange={(event) => setForm({ ...form, client: event.target.value })} />
              </Field>
              <Field label="Résumé" required className="sm:col-span-2" hint="Affiché sur les cartes du portfolio.">
                <textarea
                  className="input resize-none"
                  rows={3}
                  value={form.summary}
                  onChange={(event) => setForm({ ...form, summary: event.target.value })}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Description détaillée">
            <RichTextEditor value={form.description} onChange={(html) => setForm({ ...form, description: html })} minHeight={300} />
          </Panel>

          <Panel
            title="Galerie"
            actions={
              <button
                type="button"
                onClick={() => setForm({ ...form, images: [...form.images, { url: '', alt: '' }] })}
                className="btn-ghost btn-sm"
              >
                <Plus size={13} />
                Ajouter une image
              </button>
            }
          >
            {form.images.length === 0 ? (
              <p className="text-[12.5px] text-ink-soft">Aucune image dans la galerie.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {form.images.map((image, index) => (
                  <div key={index} className="rounded-lg border border-slate-200 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Image {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, images: form.images.filter((_, itemIndex) => itemIndex !== index) })}
                        className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Supprimer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <ImageField
                      label="Fichier"
                      value={image.url}
                      onChange={(value) => {
                        const next = [...form.images];
                        next[index] = { ...image, url: value };
                        setForm({ ...form, images: next });
                      }}
                    />
                    <Field label="Texte alternatif" className="mt-2">
                      <input
                        className="input py-2 text-[12px]"
                        value={image.alt}
                        onChange={(event) => {
                          const next = [...form.images];
                          next[index] = { ...image, alt: event.target.value };
                          setForm({ ...form, images: next });
                        }}
                      />
                    </Field>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Publication">
            <div className="space-y-3">
              <Toggle
                checked={form.isPublished}
                onChange={(value) => setForm({ ...form, isPublished: value })}
                label="Publier la réalisation"
              />
              <Toggle
                checked={form.featured}
                onChange={(value) => setForm({ ...form, featured: value })}
                label="Mettre en avant"
                description="Affichée dans la section « Nos réalisations » de l’accueil."
              />
              <Field label="Ordre d’affichage">
                <input
                  type="number"
                  className="input"
                  value={form.order}
                  onChange={(event) => setForm({ ...form, order: Number(event.target.value) })}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Image principale">
            <ImageField
              label="Couverture"
              required
              value={form.coverImage}
              onChange={(value) => setForm({ ...form, coverImage: value })}
            />
          </Panel>

          <Panel title="Rappel">
            <p className="text-[12px] leading-relaxed text-ink-soft">
              Le site public précise que les photographies sont des illustrations. Utilisez de préférence des images
              de vos propres chantiers lorsque vous en disposez.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}
