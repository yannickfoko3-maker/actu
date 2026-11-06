import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Badge, Field, PageHeader, Panel } from '../components/ui';
import { formatDateTime, initials } from '../../utils';

export default function ProfilePage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const permissions = user?.permissions ?? [];

  const changePassword = useMutation({
    mutationFn: () => api.post('/auth/password', form),
    onSuccess: () => {
      success('Mot de passe modifié.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  return (
    <>
      <PageHeader
        title="Mon profil"
        description="Informations de votre compte administratif et sécurité."
        breadcrumb={['Administration', 'Mon profil']}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Compte">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-navy text-[18px] font-semibold text-white">
              {initials(user?.name ?? '')}
            </span>
            <div>
              <p className="font-display text-[17px] font-semibold text-navy">{user?.name}</p>
              <p className="text-[12px] text-ink-soft">{user?.email}</p>
              <Badge className="mt-1.5 border-aces-blue/20 bg-aces-blue/10 text-aces-blue">{user?.role.label}</Badge>
            </div>
          </div>

          <dl className="mt-5 space-y-2 text-[12px]">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-ink-soft">Dernière connexion</dt>
              <dd className="text-ink">{user?.lastLoginAt ? formatDateTime(user.lastLoginAt) : '—'}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-ink-soft">Permissions</dt>
              <dd className="text-ink">
                {permissions.includes('*') ? 'Toutes' : `${permissions.length} autorisations`}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {(permissions.includes('*') ? ['Accès complet au back-office'] : permissions).map((permission) => (
              <span key={permission} className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-600">
                <CheckCircle2 size={10} className="text-emerald-600" />
                {permission}
              </span>
            ))}
          </div>
        </Panel>

        <Panel title="Changer le mot de passe" description="Utilisez un mot de passe unique d’au moins 10 caractères.">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              changePassword.mutate();
            }}
          >
            <Field label="Mot de passe actuel" required>
              <input
                type="password"
                className="input"
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={(event) => setForm({ ...form, currentPassword: event.target.value })}
              />
            </Field>
            <Field label="Nouveau mot de passe" required hint="10 caractères minimum, avec au moins une lettre et un chiffre.">
              <input
                type="password"
                className="input"
                autoComplete="new-password"
                value={form.newPassword}
                onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
              />
            </Field>
            <Field label="Confirmer le nouveau mot de passe" required>
              <input
                type="password"
                className="input"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              />
            </Field>
            <button type="submit" className="btn-primary btn-sm" disabled={changePassword.isPending}>
              {changePassword.isPending ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
              Mettre à jour
            </button>
          </form>

          <div className="mt-5 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-ink-soft">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-aces-blue" />
            La session expire automatiquement après 8 heures. Le jeton d’authentification est stocké dans un cookie
            httpOnly et n’est jamais exposé au JavaScript de la page.
          </div>
        </Panel>
      </div>
    </>
  );
}
