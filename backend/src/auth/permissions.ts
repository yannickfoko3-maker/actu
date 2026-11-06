/**
 * Catalogue des permissions du back-office.
 * Les rôles stockent un tableau de codes ; `*` accorde tout (super administrateur).
 */

export const PERMISSIONS = [
  { code: 'dashboard.read', label: 'Consulter le tableau de bord', group: 'Général' },
  { code: 'services.read', label: 'Consulter les prestations', group: 'Contenus' },
  { code: 'services.write', label: 'Créer et modifier les prestations', group: 'Contenus' },
  { code: 'services.delete', label: 'Supprimer les prestations', group: 'Contenus' },
  { code: 'pages.read', label: 'Consulter les pages', group: 'Contenus' },
  { code: 'pages.write', label: 'Modifier les pages', group: 'Contenus' },
  { code: 'hero.write', label: 'Gérer le carrousel d’accueil', group: 'Contenus' },
  { code: 'projects.write', label: 'Gérer les réalisations', group: 'Contenus' },
  { code: 'articles.write', label: 'Gérer les actualités', group: 'Contenus' },
  { code: 'media.write', label: 'Gérer la médiathèque', group: 'Contenus' },
  { code: 'testimonials.write', label: 'Gérer les témoignages', group: 'Contenus' },
  { code: 'messages.read', label: 'Consulter les messages', group: 'Commercial' },
  { code: 'messages.write', label: 'Traiter les messages', group: 'Commercial' },
  { code: 'quotes.read', label: 'Consulter les demandes de devis', group: 'Commercial' },
  { code: 'quotes.write', label: 'Traiter les demandes de devis', group: 'Commercial' },
  { code: 'settings.write', label: 'Modifier les paramètres du site', group: 'Administration' },
  { code: 'users.write', label: 'Gérer les utilisateurs et rôles', group: 'Administration' },
  { code: 'logs.read', label: 'Consulter le journal d’activité', group: 'Administration' },
] as const;

export type PermissionCode = (typeof PERMISSIONS)[number]['code'];

export const ROLE_DEFINITIONS = [
  {
    name: 'super-admin',
    label: 'Super administrateur',
    description: 'Contrôle total sur le site, les contenus, les utilisateurs et les paramètres.',
    permissions: ['*'],
    isSystem: true,
  },
  {
    name: 'admin',
    label: 'Administrateur',
    description: 'Gère les contenus, les demandes commerciales et les paramètres du site.',
    permissions: [
      'dashboard.read',
      'services.read',
      'services.write',
      'services.delete',
      'pages.read',
      'pages.write',
      'hero.write',
      'projects.write',
      'articles.write',
      'media.write',
      'testimonials.write',
      'messages.read',
      'messages.write',
      'quotes.read',
      'quotes.write',
      'settings.write',
      'logs.read',
    ],
    isSystem: true,
  },
  {
    name: 'editor',
    label: 'Éditeur',
    description: 'Rédige et publie les contenus : prestations, actualités, réalisations, médias.',
    permissions: [
      'dashboard.read',
      'services.read',
      'services.write',
      'pages.read',
      'pages.write',
      'hero.write',
      'projects.write',
      'articles.write',
      'media.write',
      'testimonials.write',
    ],
    isSystem: true,
  },
] as const;

export function hasPermission(
  role: { permissions?: unknown; name?: string } | null | undefined,
  permission: string
): boolean {
  if (!role) return false;
  const permissions = Array.isArray(role.permissions) ? (role.permissions as string[]) : [];
  if (permissions.includes('*') || role.name === 'super-admin') return true;
  if (permissions.includes(permission)) return true;
  const [group] = permission.split('.');
  return permissions.includes(`${group}.*`);
}
