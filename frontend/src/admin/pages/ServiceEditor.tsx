import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { api, queryKeys } from '../../services/api';
import type { Service } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Field, LoadingBlock, PageHeader, Panel, Toggle } from '../components/ui';
import { ImageField } from '../components/MediaPicker';
import { RichTextEditor } from '../components/RichTextEditor';
import { PairList, StringList } from '../components/Repeatable';
import { SERVICE_ICON_OPTIONS, ServiceIcon } from '../../components/ui/ServiceIcon';
import { slugify } from '../../utils';

type FormState = Omit<Service, 'toc' | 'relatedServices' | 'relatedProjects' | 'id'>;

const EMPTY: FormState = {
  slug: '',
  title: '',
  tagline: '',
  shortDescription: '',
  description: '',
  icon: 'shield',
  heroImage: '',
  coverImage: '',
  benefits: [],
  features: [],
  applications: [],
  process: [],
  equipment: [],
  faqs: [],
  images: [],
  seoTitle: '',
  seoDescription: '',
  order: 0,
  isPublished: true,
};

export default function ServiceEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.service(id ?? 'new'),
    queryFn: () => api.get<Service>(`/admin/services/${id}`),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (data) {
      setForm({
        slug: data.slug,
        title: data.title,
        tagline: data.tagline,
        shortDescription: data.shortDescription,
        description: data.description,
        icon: data.icon,
        heroImage: data.heroImage ?? data.coverImage,
        coverImage: data.coverImage,
        benefits: data.benefits ?? [],
        features: data.features ?? [],
        applications: data.applications ?? [],
        process: data.process ?? [],
        equipment: data.equipment ?? [],
        faqs: data.faqs ?? [],
        images: data.images?.map((image) => ({ url: image.url, alt: image.alt })) ?? [],
        seoTitle: data.seoTitle ?? '',
        seoDescription: data.seoDescription ?? '',
        order: data.order ?? 0,
        isPublished: data.isPublished ?? true,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        order: Number(form.order) || 0,
      };
      return isNew ? api.post<Service>('/admin/services', payload) : api.put<Service>(`/admin/services/${id}`, payload);
    },
    onSuccess: (service) => {
      success(isNew ? 'Prestation créée.' : 'Prestation enregistrée.');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
      void queryClient.invalidateQueries({ queryKey: queryKeys.services });
      void queryClient.invalidateQueries({ queryKey: queryKeys.site });
      if (isNew) navigate(`/admin/prestations/${service.id}`);
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  if (id && isLoading) return <LoadingBlock label="Chargement de la prestation…" />;

  return (
    <>
      <PageHeader
        title={isNew ? 'Nouvelle prestation' : form.title || 'Prestation'}
        description="Renseignez les contenus affichés sur la page publique. Les champs SEO sont facultatifs mais recommandés."
        breadcrumb={['Contenus', 'Prestations', isNew ? 'Nouvelle' : 'Édition']}
        actions={
          <>
            <Link to="/admin/prestations" className="btn-ghost btn-sm">
              <ArrowLeft size={14} />
              Retour
            </Link>
            {!isNew && form.isPublished ? (
              <Link to={`/nos-activites/${form.slug}`} target="_blank" className="btn-ghost btn-sm">
                <ExternalLink size={14} />
                Voir la page
              </Link>
            ) : null}
            <button type="button" onClick={() => save.mutate()} className="btn-primary btn-sm" disabled={save.isPending}>
              {save.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Enregistrer
            </button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel title="Informations générales">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Titre" required>
                <input className="input" value={form.title} onChange={(event) => update('title', event.target.value)} />
              </Field>
              <Field label="Slug (URL)" hint="Laissez vide pour générer automatiquement.">
                <input
                  className="input"
                  value={form.slug}
                  placeholder={slugify(form.title)}
                  onChange={(event) => update('slug', event.target.value)}
                />
              </Field>
              <Field label="Accroche" required className="sm:col-span-2">
                <input
                  className="input"
                  value={form.tagline}
                  onChange={(event) => update('tagline', event.target.value)}
                  placeholder="Une phrase courte qui résume la promesse"
                />
              </Field>
              <Field label="Description courte" required className="sm:col-span-2" hint="Affichée sur les cartes et dans les résultats de recherche.">
                <textarea
                  className="input resize-none"
                  rows={3}
                  value={form.shortDescription}
                  onChange={(event) => update('shortDescription', event.target.value)}
                />
              </Field>
              <Field label="Icône">
                <div className="flex flex-wrap gap-2">
                  {SERVICE_ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => update('icon', icon)}
                      className={`grid h-10 w-10 place-items-center rounded-lg border transition-colors ${
                        form.icon === icon
                          ? 'border-aces-blue bg-aces-blue/10 text-aces-blue'
                          : 'border-slate-200 text-slate-500 hover:border-aces-blue/40'
                      }`}
                      aria-label={icon}
                    >
                      <ServiceIcon name={icon} size={17} />
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Ordre d’affichage" hint="Les valeurs les plus basses apparaissent en premier.">
                <input
                  type="number"
                  className="input"
                  value={form.order}
                  onChange={(event) => update('order', Number(event.target.value))}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Contenu détaillé" description="Introductions, sous-titres, listes : ce contenu constitue le cœur de la page.">
            <RichTextEditor value={form.description} onChange={(html) => update('description', html)} minHeight={340} />
          </Panel>

          <Panel title="Caractéristiques et fonctionnement">
            <PairList
              label="Fonctionnalités"
              items={form.features}
              onChange={(items) => update('features', items)}
              firstKey="title"
              secondKey="description"
              firstPlaceholder="Titre de la fonctionnalité"
              secondPlaceholder="Description courte"
              secondAsTextarea
              addLabel="Ajouter une fonctionnalité"
            />
          </Panel>

          <Panel title="Étapes d’intervention">
            <PairList
              label="Étapes"
              items={form.process}
              onChange={(items) => update('process', items)}
              firstKey="title"
              secondKey="description"
              firstPlaceholder="Ex. : Visite technique"
              secondPlaceholder="Ce que nous faisons concrètement"
              secondAsTextarea
              addLabel="Ajouter une étape"
            />
          </Panel>

          <Panel title="Questions fréquentes">
            <PairList
              label="FAQ"
              items={form.faqs}
              onChange={(items) => update('faqs', items)}
              firstKey="question"
              secondKey="answer"
              firstPlaceholder="Question du client"
              secondPlaceholder="Réponse détaillée"
              secondAsTextarea
              addLabel="Ajouter une question"
            />
          </Panel>

          <Panel title="Référencement (SEO)">
            <div className="grid gap-4">
              <Field label="Titre SEO" hint="60 à 70 caractères recommandés.">
                <input
                  className="input"
                  value={form.seoTitle ?? ''}
                  onChange={(event) => update('seoTitle', event.target.value)}
                />
              </Field>
              <Field label="Méta-description" hint="150 à 160 caractères recommandés.">
                <textarea
                  className="input resize-none"
                  rows={3}
                  value={form.seoDescription ?? ''}
                  onChange={(event) => update('seoDescription', event.target.value)}
                />
              </Field>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Publication">
            <div className="space-y-3">
              <Toggle
                checked={form.isPublished}
                onChange={(value) => update('isPublished', value)}
                label="Publier la prestation"
                description="Si désactivé, la page reste accessible uniquement depuis l’administration."
              />
              <div className="rounded-lg bg-slate-50 p-3 text-[11.5px] leading-relaxed text-ink-soft">
                URL publique : <br />
                <span className="font-medium text-navy">
                  /nos-activites/{form.slug || slugify(form.title) || '…'}
                </span>
              </div>
            </div>
          </Panel>

          <Panel title="Visuels">
            <div className="space-y-4">
              <ImageField
                label="Bannière de la page"
                value={form.heroImage ?? ''}
                onChange={(value) => update('heroImage', value)}
                required
              />
              <ImageField
                label="Image de couverture (cartes)"
                value={form.coverImage}
                onChange={(value) => update('coverImage', value)}
                required
              />
            </div>
          </Panel>

          <Panel
            title="Galerie"
            actions={
              <button
                type="button"
                onClick={() => update('images', [...form.images, { url: '', alt: '' }])}
                className="btn-ghost btn-sm"
              >
                <Plus size={13} />
                Ajouter
              </button>
            }
          >
            {form.images.length === 0 ? (
              <p className="text-[12.5px] text-ink-soft">
                Aucune image de galerie. Ajoutez des visuels pour enrichir la page.
              </p>
            ) : (
              <div className="space-y-4">
                {form.images.map((image, index) => (
                  <div key={index} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Image {index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => update('images', form.images.filter((_, itemIndex) => itemIndex !== index))}
                        className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Supprimer l’image"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <ImageField
                      label="Fichier"
                      value={image.url}
                      onChange={(value) => {
                        const next = [...form.images];
                        next[index] = { ...image, url: value };
                        update('images', next);
                      }}
                    />
                    <Field label="Texte alternatif" className="mt-3">
                      <input
                        className="input py-2 text-[12.5px]"
                        value={image.alt}
                        onChange={(event) => {
                          const next = [...form.images];
                          next[index] = { ...image, alt: event.target.value };
                          update('images', next);
                        }}
                      />
                    </Field>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Listes de contenu">
            <div className="space-y-5">
              <StringList
                label="Avantages"
                items={form.benefits}
                onChange={(items) => update('benefits', items)}
                placeholder="Ex. : détection des coupures et franchissements"
              />
              <StringList
                label="Domaines d’utilisation"
                items={form.applications}
                onChange={(items) => update('applications', items)}
                placeholder="Ex. : villas et résidences"
              />
              <StringList
                label="Équipements concernés"
                items={form.equipment}
                onChange={(items) => update('equipment', items)}
                placeholder="Ex. : centrales de clôture multipolaires"
              />
            </div>
          </Panel>
        </div>
      </div>

      <div className="sticky bottom-4 mt-4 flex justify-end">
        <button type="button" onClick={() => save.mutate()} className="btn-primary shadow-card" disabled={save.isPending}>
          {save.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Enregistrer les modifications
        </button>
      </div>
    </>
  );
}
