import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Plus, Save } from 'lucide-react';
import { api, queryKeys } from '../../services/api';
import type { Article, Category } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Field, LoadingBlock, Modal, PageHeader, Panel, Spinner } from '../components/ui';
import { ImageField } from '../components/MediaPicker';
import { RichTextEditor } from '../components/RichTextEditor';
import { slugify } from '../../utils';

export default function ArticleEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    categoryId: '',
    tags: '',
    author: 'ACES Global Services',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED',
    publishedAt: '',
    readingTime: 4,
    seoTitle: '',
    seoDescription: '',
  });

  const [categoryModal, setCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.article(id ?? 'new'),
    queryFn: () => api.get<Article>(`/admin/articles/${id}`),
    enabled: Boolean(id),
  });

  const { data: categories } = useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: () => api.get<Category[]>('/public/categories'),
  });

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        categoryId: data.categoryId ?? '',
        tags: (data.tags ?? []).join(', '),
        author: data.author ?? 'ACES Global Services',
        status: (data.status as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED') ?? 'DRAFT',
        publishedAt: data.publishedAt ? data.publishedAt.slice(0, 16) : '',
        readingTime: data.readingTime ?? 4,
        seoTitle: data.seoTitle ?? '',
        seoDescription: data.seoDescription ?? '',
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        categoryId: form.categoryId || null,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
        readingTime: Number(form.readingTime) || 4,
      };
      return isNew ? api.post<Article>('/admin/articles', payload) : api.put<Article>(`/admin/articles/${id}`, payload);
    },
    onSuccess: (article) => {
      success(isNew ? 'Article créé.' : 'Article enregistré.');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
      void queryClient.invalidateQueries({ queryKey: ['articles'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.home });
      if (isNew) navigate(`/admin/actualites/${article.id}`);
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const createCategory = useMutation({
    mutationFn: () => api.post<Category>('/admin/categories', { ...newCategory, kind: 'article' }),
    onSuccess: (category) => {
      success('Catégorie créée.');
      setCategoryModal(false);
      setNewCategory({ name: '', description: '' });
      setForm((current) => ({ ...current, categoryId: category.id }));
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  if (id && isLoading) return <LoadingBlock label="Chargement de l’article…" />;

  return (
    <>
      <PageHeader
        title={isNew ? 'Nouvel article' : form.title || 'Article'}
        breadcrumb={['Contenus', 'Actualités', isNew ? 'Nouveau' : 'Édition']}
        actions={
          <>
            <Link to="/admin/actualites" className="btn-ghost btn-sm">
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
          <Panel title="Contenu de l’article">
            <div className="grid gap-4">
              <Field label="Titre" required>
                <input className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
              </Field>
              <Field label="Chapeau / résumé" required hint="Affiché sur les cartes et dans les résultats de recherche.">
                <textarea
                  className="input resize-none"
                  rows={3}
                  value={form.excerpt}
                  onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
                />
              </Field>
              <div>
                <label className="label">Contenu</label>
                <RichTextEditor value={form.content} onChange={(html) => setForm({ ...form, content: html })} minHeight={380} />
              </div>
            </div>
          </Panel>

          <Panel title="Référencement">
            <div className="grid gap-4">
              <Field label="Titre SEO">
                <input className="input" value={form.seoTitle} onChange={(event) => setForm({ ...form, seoTitle: event.target.value })} />
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
            <div className="grid gap-4">
              <Field label="Statut">
                <select
                  className="input"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as typeof form.status })}
                >
                  <option value="DRAFT">Brouillon</option>
                  <option value="PUBLISHED">Publié</option>
                  <option value="SCHEDULED">Programmé</option>
                </select>
              </Field>
              <Field label="Date de publication" hint="Utilisée pour le tri et l’affichage.">
                <input
                  type="datetime-local"
                  className="input"
                  value={form.publishedAt}
                  onChange={(event) => setForm({ ...form, publishedAt: event.target.value })}
                />
              </Field>
              <Field label="Auteur">
                <input className="input" value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} />
              </Field>
              <Field label="Temps de lecture (minutes)">
                <input
                  type="number"
                  className="input"
                  value={form.readingTime}
                  onChange={(event) => setForm({ ...form, readingTime: Number(event.target.value) })}
                />
              </Field>
            </div>
          </Panel>

          <Panel
            title="Catégorie & tags"
            actions={
              <button type="button" onClick={() => setCategoryModal(true)} className="btn-ghost btn-sm">
                <Plus size={13} />
                Catégorie
              </button>
            }
          >
            <div className="grid gap-4">
              <Field label="Catégorie">
                <select
                  className="input"
                  value={form.categoryId}
                  onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                >
                  <option value="">Sans catégorie</option>
                  {(categories ?? []).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tags" hint="Séparés par des virgules.">
                <input
                  className="input"
                  value={form.tags}
                  onChange={(event) => setForm({ ...form, tags: event.target.value })}
                  placeholder="vidéosurveillance, conseils"
                />
              </Field>
              <Field label="Slug">
                <input
                  className="input"
                  value={form.slug}
                  placeholder={slugify(form.title)}
                  onChange={(event) => setForm({ ...form, slug: event.target.value })}
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
        </div>
      </div>

      <Modal
        open={categoryModal}
        onClose={() => setCategoryModal(false)}
        title="Nouvelle catégorie"
        size="sm"
        footer={
          <>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setCategoryModal(false)}>
              Annuler
            </button>
            <button type="button" className="btn-primary btn-sm" onClick={() => createCategory.mutate()} disabled={createCategory.isPending}>
              {createCategory.isPending ? <Spinner className="text-white" /> : <Plus size={14} />}
              Créer
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Nom" required>
            <input
              className="input"
              value={newCategory.name}
              onChange={(event) => setNewCategory({ ...newCategory, name: event.target.value })}
            />
          </Field>
          <Field label="Description">
            <textarea
              className="input resize-none"
              rows={3}
              value={newCategory.description}
              onChange={(event) => setNewCategory({ ...newCategory, description: event.target.value })}
            />
          </Field>
        </div>
      </Modal>
    </>
  );
}
