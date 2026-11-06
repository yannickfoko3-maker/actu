import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Check, Loader2, Save } from 'lucide-react';
import { api, queryKeys } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Badge, LoadingBlock, PageHeader, Panel } from '../components/ui';
import { ImageField } from '../components/MediaPicker';
import { cn } from '../../utils';

interface SettingRow {
  id: string;
  key: string;
  value: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'url' | 'email' | 'tel' | 'json';
}

interface SettingsResponse {
  groups: Record<string, SettingRow[]>;
  environment: { dataAdapter: string; mailConfigured: boolean; nodeEnv: string };
}

export default function SettingsPage() {
  const [activeGroup, setActiveGroup] = useState<string>('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.settings,
    queryFn: () => api.get<SettingsResponse>('/admin/settings'),
  });

  const groups = useMemo(() => Object.keys(data?.groups ?? {}), [data]);

  useEffect(() => {
    if (data) {
      const flat: Record<string, string> = {};
      Object.values(data.groups).forEach((rows) => {
        rows.forEach((row) => {
          flat[row.key] = row.value ?? '';
        });
      });
      setValues(flat);
      setDirty(false);
      if (!activeGroup && groups[0]) setActiveGroup(groups[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const save = useMutation({
    mutationFn: () => api.put('/admin/settings', values),
    onSuccess: () => {
      success('Paramètres enregistrés. Les modifications sont visibles sur le site.');
      setDirty(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.settings });
      void queryClient.invalidateQueries({ queryKey: queryKeys.site });
      void queryClient.invalidateQueries({ queryKey: queryKeys.home });
      void queryClient.invalidateQueries({ queryKey: ['page'] });
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const update = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setDirty(true);
  };

  if (isLoading || !data) return <LoadingBlock label="Chargement des paramètres…" />;

  const rows = data.groups[activeGroup] ?? [];

  return (
    <>
      <PageHeader
        title="Paramètres du site"
        description="Coordonnées, identité visuelle, réseaux sociaux, référencement et messages des formulaires."
        breadcrumb={['Administration', 'Paramètres']}
        actions={
          <button type="button" className="btn-primary btn-sm" onClick={() => save.mutate()} disabled={save.isPending || !dirty}>
            {save.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Enregistrer
          </button>
        }
      />

      {dirty ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-[12px] text-amber-900">
          <AlertTriangle size={14} />
          Des modifications ne sont pas encore enregistrées.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
        <Panel className="h-max p-2">
          <nav aria-label="Groupes de paramètres">
            <ul className="space-y-0.5">
              {groups.map((group) => (
                <li key={group}>
                  <button
                    type="button"
                    onClick={() => setActiveGroup(group)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[12.5px] transition-colors',
                      activeGroup === group
                        ? 'bg-aces-blue/10 font-semibold text-aces-blue'
                        : 'text-ink hover:bg-slate-50'
                    )}
                  >
                    {group}
                    {activeGroup === group ? <Check size={13} /> : null}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </Panel>

        <div className="space-y-4">
          <Panel title={activeGroup} description={`${rows.length} paramètre(s) dans cette section.`}>
            <div className="grid gap-5 sm:grid-cols-2">
              {rows.map((row) => {
                const value = values[row.key] ?? '';
                const fullWidth = row.type === 'textarea' || row.type === 'image' || row.key.includes('description');
                return (
                  <div key={row.id} className={cn(fullWidth && 'sm:col-span-2')}>
                    {row.type === 'image' ? (
                      <ImageField label={row.label} value={value} onChange={(next) => update(row.key, next)} />
                    ) : (
                      <>
                        <label className="label" htmlFor={`setting-${row.key}`}>
                          {row.label}
                        </label>
                        {row.type === 'textarea' ? (
                          <textarea
                            id={`setting-${row.key}`}
                            className="input resize-none"
                            rows={row.key.includes('description') || row.key.includes('keywords') ? 3 : 2}
                            value={value}
                            onChange={(event) => update(row.key, event.target.value)}
                          />
                        ) : (
                          <input
                            id={`setting-${row.key}`}
                            type={row.type === 'tel' ? 'tel' : row.type === 'email' ? 'email' : row.type === 'url' ? 'url' : 'text'}
                            className="input"
                            value={value}
                            onChange={(event) => update(row.key, event.target.value)}
                          />
                        )}
                        <p className="mt-1 text-[10.5px] text-slate-400">{row.key}</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>

          {activeGroup === 'Coordonnées' ? (
            <Panel title="Lisibilité des coordonnées">
              <p className="text-[12px] leading-relaxed text-ink-soft">
                Les champs « Téléphone affiché », « Téléphone (format international) » et « Numéro WhatsApp » alimentent
                le bouton flottant WhatsApp, les liens d’appel et les données structurées du site. Le numéro WhatsApp doit
                être saisi avec l’indicatif pays, sans espace ni signe « + ».
              </p>
            </Panel>
          ) : null}
        </div>
      </div>

      <Panel title="Environnement serveur" className="mt-4">
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <Badge className={data.environment.dataAdapter === 'prisma' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}>
            Base de données : {data.environment.dataAdapter === 'prisma' ? 'MySQL (Prisma)' : 'JSON (démonstration)'}
          </Badge>
          <Badge className={data.environment.mailConfigured ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'}>
            SMTP : {data.environment.mailConfigured ? 'configuré' : 'non configuré'}
          </Badge>
          <Badge>Environnement : {data.environment.nodeEnv}</Badge>
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-ink-soft">
          Ces valeurs proviennent des variables d’environnement du serveur (<code className="rounded bg-slate-100 px-1">backend/.env</code>) et ne
          sont pas modifiables depuis l’interface pour des raisons de sécurité.
        </p>
      </Panel>
    </>
  );
}
