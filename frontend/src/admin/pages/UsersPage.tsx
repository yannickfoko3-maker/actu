import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, KeyRound, Pencil, Plus, ShieldCheck, Trash2, UserPlus, X } from 'lucide-react';
import { api, queryKeys } from '../../services/api';
import type { AdminUser, Role } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  Badge,
  ConfirmDialog,
  Field,
  LoadingBlock,
  Modal,
  PageHeader,
  Panel,
  Spinner,
  Table,
  Td,
  Toggle,
} from '../components/ui';
import { cn, initials } from '../../utils';

interface UsersResponse {
  items: AdminUser[];
  roles: Role[];
  permissions: { code: string; label: string; group: string }[];
}

const EMPTY_USER = { name: '', email: '', password: '', roleId: '', isActive: true };

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(EMPTY_USER);
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);
  const [roleModal, setRoleModal] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: '', label: '', description: '', permissions: [] as string[] });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: () => api.get<UsersResponse>('/admin/users'),
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });

  const save = useMutation({
    mutationFn: () => {
      if (editing) {
        const payload: Record<string, unknown> = {
          name: form.name,
          email: form.email,
          roleId: form.roleId,
          isActive: form.isActive,
        };
        if (form.password) payload.password = form.password;
        return api.put<AdminUser>(`/admin/users/${editing.id}`, payload);
      }
      return api.post<AdminUser>('/admin/users', form);
    },
    onSuccess: () => {
      success(editing ? 'Compte mis à jour.' : 'Compte créé.');
      setModalOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      success('Compte supprimé.');
      setToDelete(null);
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const createRole = useMutation({
    mutationFn: () => api.post<Role>('/admin/roles', roleForm),
    onSuccess: () => {
      success('Rôle créé.');
      setRoleModal(false);
      setRoleForm({ name: '', label: '', description: '', permissions: [] });
      invalidate();
    },
    onError: (mutationError: Error) => error(mutationError.message),
  });

  const permissionGroups = (data?.permissions ?? []).reduce<Record<string, { code: string; label: string }[]>>(
    (acc, permission) => {
      acc[permission.group] = acc[permission.group] ?? [];
      acc[permission.group].push({ code: permission.code, label: permission.label });
      return acc;
    },
    {}
  );

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_USER, roleId: data?.roles.find((role) => role.name === 'editor')?.id ?? '' });
    setModalOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: '', roleId: user.roleId, isActive: user.isActive });
    setModalOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Utilisateurs & rôles"
        description="Gérez les comptes autorisés à accéder à l’administration et leurs permissions."
        breadcrumb={['Administration', 'Utilisateurs']}
        actions={
          <>
            <button type="button" onClick={() => setRoleModal(true)} className="btn-ghost btn-sm">
              <ShieldCheck size={15} />
              Nouveau rôle
            </button>
            <button type="button" onClick={openNew} className="btn-primary btn-sm">
              <UserPlus size={15} />
              Nouvel utilisateur
            </button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Comptes administrateurs">
          {isLoading ? (
            <LoadingBlock />
          ) : (
            <Table head={['Utilisateur', 'Rôle', 'Statut', 'Dernière connexion', 'Actions']}>
              {(data?.items ?? []).map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/60">
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-[10.5px] font-semibold text-white">
                        {initials(user.name)}
                      </span>
                      <div>
                        <p className="text-[12.5px] font-semibold text-navy">
                          {user.name}
                          {user.id === currentUser?.id ? <span className="ml-1 text-[10px] text-slate-400">(vous)</span> : null}
                        </p>
                        <p className="text-[11px] text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge>{user.role?.label ?? '—'}</Badge>
                  </Td>
                  <Td>
                    <Badge
                      className={
                        user.isActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-slate-50 text-slate-500'
                      }
                    >
                      {user.isActive ? 'Actif' : 'Désactivé'}
                    </Badge>
                  </Td>
                  <Td className="whitespace-nowrap text-[11.5px] text-slate-500">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('fr-FR') : 'Jamais'}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(user)}
                        className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-aces-blue/10 hover:text-aces-blue"
                        aria-label="Modifier"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(user)}
                        disabled={user.id === currentUser?.id}
                        className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </Table>
          )}
          <p className="mt-4 text-[11.5px] text-ink-soft">
            Le mot de passe des comptes existants n’est jamais affiché. Utilisez « Modifier » pour le réinitialiser.
          </p>
        </Panel>

        <Panel title="Rôles et permissions" description="Chaque rôle regroupe un ensemble de permissions.">
          <div className="space-y-3">
            {(data?.roles ?? []).map((role) => (
              <div key={role.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[12.5px] font-semibold text-navy">{role.label}</p>
                  <Badge className="text-[9.5px]">{role.permissions.includes('*') ? 'Tous les droits' : `${role.permissions.length} droits`}</Badge>
                </div>
                <p className="mt-0.5 text-[11px] text-ink-soft">{role.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {role.permissions.slice(0, 8).map((permission) => (
                    <span key={permission} className="rounded bg-slate-100 px-1.5 py-0.5 text-[9.5px] text-slate-600">
                      {permission === '*' ? 'Tout' : permission}
                    </span>
                  ))}
                  {role.permissions.length > 8 ? (
                    <span className="text-[9.5px] text-slate-400">+{role.permissions.length - 8}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Modal utilisateur */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier le compte' : 'Nouvel utilisateur'}
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
          <Field label="Nom complet" required>
            <input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="Adresse e-mail" required>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </Field>
          <Field label="Rôle" required>
            <select className="input" value={form.roleId} onChange={(event) => setForm({ ...form, roleId: event.target.value })}>
              <option value="">Sélectionner…</option>
              {(data?.roles ?? []).map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label={editing ? 'Nouveau mot de passe' : 'Mot de passe'}
            required={!editing}
            hint="10 caractères minimum, avec au moins une lettre et un chiffre."
          >
            <input
              type="password"
              className="input"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder={editing ? 'Laisser vide pour conserver' : ''}
            />
          </Field>
          <div className="sm:col-span-2">
            <Toggle
              checked={form.isActive}
              onChange={(value) => setForm({ ...form, isActive: value })}
              label="Compte actif"
              description="Un compte désactivé ne peut plus se connecter."
            />
          </div>
        </div>
      </Modal>

      {/* Modal rôle */}
      <Modal
        open={roleModal}
        onClose={() => setRoleModal(false)}
        title="Nouveau rôle"
        size="lg"
        footer={
          <>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setRoleModal(false)}>
              Annuler
            </button>
            <button type="button" className="btn-primary btn-sm" onClick={() => createRole.mutate()} disabled={createRole.isPending}>
              {createRole.isPending ? <Spinner className="text-white" /> : <KeyRound size={14} />}
              Créer le rôle
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom technique" required hint="Minuscules et tirets, ex. : redacteur">
            <input className="input" value={roleForm.name} onChange={(event) => setRoleForm({ ...roleForm, name: event.target.value })} />
          </Field>
          <Field label="Libellé" required>
            <input className="input" value={roleForm.label} onChange={(event) => setRoleForm({ ...roleForm, label: event.target.value })} />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <input
              className="input"
              value={roleForm.description}
              onChange={(event) => setRoleForm({ ...roleForm, description: event.target.value })}
            />
          </Field>
        </div>

        <div className="mt-5 space-y-4">
          {Object.entries(permissionGroups).map(([group, permissions]) => (
            <div key={group}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{group}</p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {permissions.map((permission) => {
                  const checked = roleForm.permissions.includes(permission.code);
                  return (
                    <button
                      key={permission.code}
                      type="button"
                      onClick={() =>
                        setRoleForm({
                          ...roleForm,
                          permissions: checked
                            ? roleForm.permissions.filter((code) => code !== permission.code)
                            : [...roleForm.permissions, permission.code],
                        })
                      }
                      className={cn(
                        'flex items-center gap-2 rounded-md border px-2.5 py-2 text-left text-[11.5px] transition-colors',
                        checked ? 'border-aces-blue bg-aces-blue/5 text-navy' : 'border-slate-200 text-ink-soft hover:border-slate-300'
                      )}
                    >
                      <span
                        className={cn(
                          'grid h-4 w-4 shrink-0 place-items-center rounded border',
                          checked ? 'border-aces-blue bg-aces-blue text-white' : 'border-slate-300'
                        )}
                      >
                        {checked ? <Check size={10} /> : null}
                      </span>
                      {permission.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Supprimer ce compte ?"
        message={`Le compte de ${toDelete?.name} sera supprimé. Cette action est irréversible.`}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
        loading={remove.isPending}
      />
    </>
  );
}
