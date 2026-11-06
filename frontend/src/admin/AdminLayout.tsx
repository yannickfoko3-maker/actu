import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Bell,
  ChevronDown,
  ExternalLink,
  FileText,
  FolderKanban,
  Image,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  MessageSquare,
  Newspaper,
  PanelLeftClose,
  PanelLeft,
  Quote,
  Search,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api, queryKeys } from '../services/api';
import type { DashboardStats } from '../types';
import { cn, initials } from '../utils';

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  permission?: string;
  badge?: number;
  end?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function AdminLayout() {
  const { user, logout, can } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: stats } = useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: () => api.get<DashboardStats>('/admin/stats'),
    staleTime: 30_000,
  });

  useEffect(() => {
    setMobileOpen(false);
    setUserMenu(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  const groups = useMemo<NavGroup[]>(() => {
    const all: NavGroup[] = [
      {
        label: 'Général',
        items: [
          { label: 'Tableau de bord', to: '/admin', icon: LayoutDashboard, permission: 'dashboard.read', end: true },
        ],
      },
      {
        label: 'Contenus',
        items: [
          { label: 'Prestations', to: '/admin/prestations', icon: ListChecks, permission: 'services.read' },
          { label: 'Carrousel d’accueil', to: '/admin/carrousel', icon: Sliders, permission: 'hero.write' },
          { label: 'Pages', to: '/admin/pages', icon: FileText, permission: 'pages.read' },
          { label: 'Réalisations', to: '/admin/realisations', icon: FolderKanban, permission: 'projects.write' },
          { label: 'Actualités', to: '/admin/actualites', icon: Newspaper, permission: 'articles.write' },
          { label: 'Médiathèque', to: '/admin/mediatheque', icon: Image, permission: 'media.write' },
          { label: 'Témoignages', to: '/admin/temoignages', icon: Quote, permission: 'testimonials.write' },
        ],
      },
      {
        label: 'Commercial',
        items: [
          {
            label: 'Demandes de devis',
            to: '/admin/devis',
            icon: Sparkles,
            permission: 'quotes.read',
            badge: stats?.counts.quotes.new,
          },
          {
            label: 'Messages',
            to: '/admin/messages',
            icon: MessageSquare,
            permission: 'messages.read',
            badge: stats?.counts.messages.new,
          },
        ],
      },
      {
        label: 'Administration',
        items: [
          { label: 'Paramètres', to: '/admin/parametres', icon: Settings, permission: 'settings.write' },
          { label: 'Utilisateurs & rôles', to: '/admin/utilisateurs', icon: Users, permission: 'users.write' },
          { label: 'Journal d’activité', to: '/admin/journal', icon: Activity, permission: 'logs.read' },
        ],
      },
    ];

    return all
      .map((group) => ({ ...group, items: group.items.filter((item) => !item.permission || can(item.permission)) }))
      .filter((group) => group.items.length > 0);
  }, [can, stats]);

  const activeLabel = useMemo(() => {
    for (const group of groups) {
      for (const item of group.items) {
        if (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)) return item.label;
      }
    }
    return 'Administration';
  }, [groups, location.pathname]);

  const handleLogout = async () => {
    await logout();
    success('Vous êtes déconnecté.');
    navigate('/admin');
  };

  const notifications = [
    ...(stats?.recent.quotes ?? []).slice(0, 3).map((quote) => ({
      id: quote.id,
      title: `Devis — ${quote.serviceTitle}`,
      text: `${quote.name} · ${quote.city}`,
      to: '/admin/devis',
      icon: Sparkles,
    })),
    ...(stats?.recent.messages ?? []).slice(0, 3).map((message) => ({
      id: message.id,
      title: message.subject,
      text: `${message.name}`,
      to: '/admin/messages',
      icon: MessageSquare,
    })),
  ].slice(0, 5);

  const unread = (stats?.counts.quotes.new ?? 0) + (stats?.counts.messages.new ?? 0);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className={cn('flex items-center gap-3 border-b border-white/10 px-4 py-4', collapsed && 'justify-center px-2')}>
        <Link to="/admin" className="flex items-center gap-2.5 overflow-hidden">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-aces-gold">
            <ShieldCheck size={18} />
          </span>
          {!collapsed ? (
            <span className="leading-tight">
              <span className="block font-display text-[13px] font-semibold text-white">ACES Admin</span>
              <span className="block text-[10px] uppercase tracking-[0.16em] text-white/40">Espace de gestion</span>
            </span>
          ) : null}
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Navigation de l’administration">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                {group.label}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
                        isActive
                          ? 'bg-white/12 text-white'
                          : 'text-white/60 hover:bg-white/5 hover:text-white',
                        collapsed && 'justify-center px-2'
                      )
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon size={17} className="shrink-0" />
                    {!collapsed ? (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge ? (
                          <span className="rounded-full bg-aces-gold px-1.5 py-0.5 text-[10px] font-semibold text-navy">
                            {item.badge}
                          </span>
                        ) : null}
                      </>
                    ) : item.badge ? (
                      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-aces-gold" />
                    ) : null}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] text-white/60 transition-colors hover:bg-white/5 hover:text-white',
            collapsed && 'justify-center'
          )}
        >
          <ExternalLink size={15} />
          {!collapsed ? 'Voir le site public' : null}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className={cn(
            'mt-1 hidden w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] text-white/40 transition-colors hover:bg-white/5 hover:text-white lg:flex',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
          {!collapsed ? 'Réduire le menu' : null}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden bg-navy transition-all duration-300 lg:block',
          collapsed ? 'w-[76px]' : 'w-[248px]'
        )}
      >
        {sidebar}
      </aside>

      {/* Drawer mobile */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[260px] bg-navy">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white"
              aria-label="Fermer le menu"
            >
              <X size={16} />
            </button>
            {sidebar}
          </div>
        </div>
      ) : null}

      <div className={cn('flex min-h-screen flex-col transition-all duration-300', collapsed ? 'lg:pl-[76px]' : 'lg:pl-[248px]')}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-navy lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu size={17} />
            </button>

            <div className="hidden sm:block">
              <p className="text-[10.5px] uppercase tracking-[0.14em] text-slate-400">Administration</p>
              <p className="font-display text-[14px] font-semibold text-navy">{activeLabel}</p>
            </div>

            <form
              className="relative ml-auto hidden w-64 md:block"
              onSubmit={(event) => {
                event.preventDefault();
                if (search.trim()) navigate(`/admin/prestations?search=${encodeURIComponent(search.trim())}`);
              }}
            >
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-[12.5px] focus:border-aces-blue focus:bg-white focus:outline-none"
                placeholder="Rechercher une prestation…"
                aria-label="Recherche rapide"
              />
            </form>

            <div className="relative ml-auto md:ml-0">
              <button
                type="button"
                onClick={() => setNotificationsOpen((value) => !value)}
                className="relative grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-navy transition-colors hover:border-aces-blue hover:text-aces-blue"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell size={16} />
                {unread > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-aces-gold px-1 text-[9.5px] font-bold text-navy">
                    {unread}
                  </span>
                ) : null}
              </button>

              {notificationsOpen ? (
                <div className="absolute right-0 top-11 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-[12.5px] font-semibold text-navy">Notifications</p>
                    <p className="text-[11px] text-ink-soft">{unread} élément(s) à traiter</p>
                  </div>
                  <ul className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="px-4 py-8 text-center text-[12px] text-ink-soft">Aucune notification.</li>
                    ) : (
                      notifications.map((notification) => (
                        <li key={notification.id}>
                          <Link
                            to={notification.to}
                            className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                          >
                            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-aces-blue/10 text-aces-blue">
                              <notification.icon size={13} />
                            </span>
                            <span>
                              <span className="block truncate text-[12px] font-medium text-navy">
                                {notification.title}
                              </span>
                              <span className="block text-[11px] text-ink-soft">{notification.text}</span>
                            </span>
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenu((value) => !value)}
                className="flex items-center gap-2.5 rounded-lg border border-slate-200 py-1.5 pl-1.5 pr-2.5 transition-colors hover:border-aces-blue"
                aria-expanded={userMenu}
              >
                <span className="grid h-7 w-7 place-items-center rounded-md bg-navy text-[11px] font-semibold text-white">
                  {initials(user?.name ?? 'A')}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-[12px] font-semibold leading-tight text-navy">{user?.name}</span>
                  <span className="block text-[10px] leading-tight text-ink-soft">{user?.role.label}</span>
                </span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              {userMenu ? (
                <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-[12.5px] font-semibold text-navy">{user?.name}</p>
                    <p className="truncate text-[11px] text-ink-soft">{user?.email}</p>
                  </div>
                  <Link
                    to="/admin/profil"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] text-ink transition-colors hover:bg-slate-50"
                  >
                    <Users size={14} className="text-aces-blue" />
                    Mon profil
                  </Link>
                  <Link
                    to="/"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] text-ink transition-colors hover:bg-slate-50"
                  >
                    <ExternalLink size={14} className="text-aces-blue" />
                    Voir le site
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2.5 text-left text-[12.5px] text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={14} />
                    Se déconnecter
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>

        <footer className="border-t border-slate-200 px-6 py-4 text-[11.5px] text-slate-400">
          ACES Global Services — espace d’administration · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
