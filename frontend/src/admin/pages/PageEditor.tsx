import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, Loader2, Save } from 'lucide-react';
import { api, queryKeys } from '../../services/api';
import type { PageContent } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Field, LoadingBlock, PageHeader, Panel } from '../components/ui';
import { ImageField } from '../components/MediaPicker';
import { RichTextEditor } from '../components/RichTextEditor';
import { slugify } from '../../utils';

export default function PageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    subtitle: '',
    heroImage: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.page(id ?? ''),
    queryFn: () => api.get<PageContent>(`/admin/pages/${id}`),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle ?? '',
        heroImage: data.heroImage ?? '',
        content: data.content,
        seoTitle: data.seoTitle ?? '',
        seoDescription: data.seoDescription ?? '',
        status: data.status,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      api.put<PageContent>(`/admin/pages/${id}`, {
        ...form,
        slug: form.slug || slugify(form.title),
      }),
    onSuccess: () => {
      success('Page enregistrée.');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.page(form.slug) });
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  if (isLoading) return <LoadingBlock label="Chargement de la page…" />;

  return (
    <>
      <PageHeader
        title={form.title || 'Page'}
        description={data?.system ? 'Page système : le contenu est modifiable, le slug est verrouillé.' : undefined}
        breadcrumb={['Contenus', 'Pages', 'Édition']}
        actions={
          <>
            <Link to="/admin/pages" className="btn-ghost btn-sm">
              <ArrowLeft size={14} />
              Retour
            </Link>
            <Link to={`/${form.slug}`} target="_blank" className="btn-ghost btn-sm">
              <ExternalLink size={14} />
              Voir
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
          <Panel title="Contenu de la page">
            <div className="grid gap-4">
              <Field label="Titre" required>
                <input
                  className="input"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </Field>
              <Field label="Sous-titre">
                <input
                  className="input"
                  value={form.subtitle}
                  onChange={(event) => setForm({ ...form, subtitle: event.target.value })}
                />
              </Field>
              <div>
                <label className="label">Contenu</label>
                <RichTextEditor
                  value={form.content}
                  onChange={(html) => setForm({ ...form, content: html })}
                  minHeight={420}
                />
              </div>
            </div>
          </Panel>

          <Panel title="Référencement">
            <div className="grid gap-4">
              <Field label="Titre SEO">
                <input
                  className="input"
                  value={form.seoTitle}
                  onChange={(event) => setForm({ ...form, seoTitle: event.target.value })}
                />
              </Field>
              <Field label="Méta-description">
                <textarea
                  className="input resize-none"
                  rows={3}
                  value={form.seoDescription}
                  onChange={(event) => setForm({ ...form, seoDescription: event.target.value })}
                />
              </Field>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Publication">
            <Field label="Statut">
              <select
                className="input"
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as 'PUBLISHED' | 'DRAFT' })}
              >
                <option value="PUBLISHED">Publiée</option>
                <option value="DRAFT">Brouillon</option>
              </select>
            </Field>
            <Field label="Slug" className="mt-4" hint="Le slug des pages système est verrouillé.">
              <input
                className="input"
                value={form.slug}
                disabled={data?.system}
                onChange={(event) => setForm({ ...form, slug: event.target.value })}
              />
            </Field>
            <p className="mt-3 text-[11.5px] text-ink-soft">
              URL publique : <span className="font-medium text-navy">/{form.slug}</span>
            </p>
          </Panel>

          <Panel title="Image d’en-tête">
            <ImageField
              label="Bannière"
              value={form.heroImage}
              onChange={(value) => setForm({ ...form, heroImage: value })}
              hint="Facultative : une image par défaut est utilisée si vide."
            />
          </Panel>

          <Panel title="Aide">
            <p className="text-[12px] leading-relaxed text-ink-soft">
              Les pages système (mentions légales, politique de confidentialité) doivent être relues et validées
              avec les informations juridiques réelles de l’entreprise avant publication.
            </p>
            <button type="button" onClick={() => navigate('/admin/pages')} className="btn-ghost btn-sm mt-3">
              Retour à la liste
            </button>
          </Panel>
        </div>
      </div>
    </>
  );
}
