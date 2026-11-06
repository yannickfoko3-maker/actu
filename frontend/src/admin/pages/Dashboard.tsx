import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  FolderKanban,
  Image,
  ListChecks,
  Mail,
  MessageSquare,
  Newspaper,
  Quote,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, queryKeys } from '../../services/api';
import type { DashboardStats } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader, Panel, Badge, LoadingBlock, EmptyState } from '../components/ui';
import { ACTION_LABELS, QUOTE_STATUS, cn, formatDateTime, formatShortDate } from '../../utils';

const STATUS_COLORS: Record<string, string> = {
  NEW: '#0873D1',
  IN_PROGRESS: '#E6AD20',
  DONE: '#10B981',
  ARCHIVED: '#94A3B8',
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  to,
  accent = 'bg-aces-blue/10 text-aces-blue',
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: typeof ListChecks;
  to: string;
  accent?: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-aces-blue/30 hover:shadow-soft"
    >
      <div className="flex items-start justify-between">
        <span className={cn('grid h-10 w-10 place-items-center rounded-lg', accent)}>
          <Icon size={18} />
        </span>
        <ArrowUpRight size={15} className="text-slate-300 transition-colors group-hover:text-aces-blue" />
      </div>
      <p className="mt-4 font-display text-[26px] font-semibold leading-none text-navy">{value}</p>
      <p className="mt-1.5 text-[12.5px] font-medium text-ink">{label}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-ink-soft">{hint}</p> : null}
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: () => api.get<DashboardStats>('/admin/stats'),
  });

  if (isLoading || !data) {
    return (
      <>
        <PageHeader title="Tableau de bord" description="Vue d’ensemble de votre site et de vos demandes." />
        <LoadingBlock />
      </>
    );
  }

  const { counts, charts, recent, activity, environment } = data;
  const chartData = charts.quotesPerMonth.map((item, index) => ({
    month: item.month,
    devis: item.value,
    messages: charts.messagesPerMonth[index]?.value ?? 0,
    articles: charts.articlesPerMonth[index]?.value ?? 0,
  }));

  return (
    <>
      <PageHeader
        title={`Bonjour ${user?.name?.split(' ')[0] ?? ''} 👋`}
        description="Voici l’état de votre site et les demandes reçues. Toutes les statistiques sont calculées à partir de la base de données."
        actions={
          <>
            <Link to="/" target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm">
              Voir le site
              <ArrowUpRight size={14} />
            </Link>
            <Link to="/admin/prestations/nouvelle" className="btn-primary btn-sm">
              Nouvelle prestation
            </Link>
          </>
        }
      />

      {environment.dataAdapter === 'memory' ? (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] text-amber-900">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <p>
            <strong>Mode démonstration actif.</strong> Les données sont enregistrées dans un fichier JSON local
            (DATA_ADAPTER=memory). Pour la production, utilisez MySQL avec Prisma (DATA_ADAPTER=prisma).
            {environment.mailConfigured ? '' : ' Les notifications e-mail sont désactivées : renseignez les variables SMTP pour les activer.'}
          </p>
        </div>
      ) : null}

      {/* Statistiques principales */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Nouvelles demandes de devis"
          value={counts.quotes.new}
          hint={`${counts.quotes.total} demande(s) au total`}
          icon={Sparkles}
          to="/admin/devis"
        />
        <StatCard
          label="Messages non lus"
          value={counts.messages.new}
          hint={`${counts.messages.total} message(s) au total`}
          icon={MessageSquare}
          to="/admin/messages"
          accent="bg-aces-gold/15 text-aces-gold"
        />
        <StatCard
          label="Prestations publiées"
          value={counts.services.published}
          hint={`${counts.services.total} prestation(s) rédigée(s)`}
          icon={ListChecks}
          to="/admin/prestations"
          accent="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          label="Articles publiés"
          value={counts.articles.published}
          hint={`${counts.articles.total} article(s) au total`}
          icon={Newspaper}
          to="/admin/actualites"
          accent="bg-indigo-100 text-indigo-600"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Réalisations" value={counts.projects.published} icon={FolderKanban} to="/admin/realisations" accent="bg-sky-100 text-sky-600" />
        <StatCard label="Diapositives actives" value={`${counts.slides.active}/${counts.slides.total}`} icon={Image} to="/admin/carrousel" accent="bg-purple-100 text-purple-600" />
        <StatCard label="Médias" value={counts.media.total} icon={Image} to="/admin/mediatheque" accent="bg-slate-100 text-slate-600" />
        <StatCard label="Témoignages publiés" value={counts.testimonials.total} icon={Quote} to="/admin/temoignages" accent="bg-rose-100 text-rose-600" />
      </div>

      {/* Graphiques */}
      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <Panel
          title="Évolution des demandes"
          description="Demandes de devis, messages et articles publiés sur les 6 derniers mois."
          className="xl:col-span-2"
        >
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="quotes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0873D1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0873D1" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="messages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E6AD20" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#E6AD20" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #E2E8F0',
                    fontSize: 12,
                    boxShadow: '0 10px 30px -12px rgba(6,43,99,0.35)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11.5 }} />
                <Area type="monotone" dataKey="devis" name="Devis" stroke="#0873D1" strokeWidth={2} fill="url(#quotes)" />
                <Area type="monotone" dataKey="messages" name="Messages" stroke="#E6AD20" strokeWidth={2} fill="url(#messages)" />
                <Area type="monotone" dataKey="articles" name="Articles" stroke="#10B981" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Répartition des devis" description="Par statut de traitement.">
          {counts.quotes.total === 0 ? (
            <EmptyState title="Aucune demande" description="Les demandes de devis apparaîtront ici." icon={<TrendingUp size={18} />} />
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.quotesByStatus.map((item) => ({
                      name: QUOTE_STATUS[item.status]?.label ?? item.status,
                      value: item.value,
                      status: item.status,
                    }))}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={3}
                  >
                    {charts.quotesByStatus.map((item) => (
                      <Cell key={item.status} fill={STATUS_COLORS[item.status] ?? '#94A3B8'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11.5 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Prestations les plus demandées" description="D’après les demandes de devis enregistrées.">
          {charts.quotesByService.length === 0 ? (
            <EmptyState title="Pas encore de données" description="Les demandes qualifiées alimenteront ce graphique." />
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.quotesByService} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={118}
                    tick={{ fontSize: 10.5, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }} />
                  <Bar dataKey="value" name="Demandes" fill="#0873D1" radius={[0, 6, 6, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel
          title="Dernières demandes de devis"
          actions={
            <Link to="/admin/devis" className="text-[11.5px] font-semibold text-aces-blue">
              Tout voir
            </Link>
          }
        >
          {recent.quotes.length === 0 ? (
            <EmptyState title="Aucune demande" description="Les demandes envoyées depuis le site apparaîtront ici." icon={<Sparkles size={18} />} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.quotes.map((quote) => (
                <li key={quote.id} className="py-2.5">
                  <Link to={`/admin/devis?open=${quote.id}`} className="flex items-start gap-3">
                    <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-aces-blue/10 text-[10px] font-semibold text-aces-blue">
                      {quote.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium text-navy">{quote.serviceTitle}</span>
                      <span className="block truncate text-[11px] text-ink-soft">
                        {quote.name} · {quote.city} · {formatShortDate(quote.createdAt)}
                      </span>
                    </span>
                    <Badge className={QUOTE_STATUS[quote.status]?.className}>
                      {QUOTE_STATUS[quote.status]?.label}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Historique récent"
          description="Dernières actions d’administration."
          actions={
            <Link to="/admin/journal" className="text-[11.5px] font-semibold text-aces-blue">
              Journal
            </Link>
          }
        >
          {activity.length === 0 ? (
            <EmptyState title="Aucune activité" icon={<Activity size={18} />} />
          ) : (
            <ul className="space-y-3">
              {activity.slice(0, 6).map((log) => (
                <li key={log.id} className="flex items-start gap-3">
                  <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
                    {log.action === 'login' || log.action === 'logout' ? <Mail size={11} /> : <Activity size={11} />}
                  </span>
                  <span>
                    <span className="block text-[12px] text-ink">{log.description}</span>
                    <span className="block text-[10.5px] text-slate-400">
                      {ACTION_LABELS[log.action] ?? log.action} · {formatDateTime(log.createdAt)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Panel title="Derniers messages" description="Formulaire de contact du site.">
          {recent.messages.length === 0 ? (
            <EmptyState title="Aucun message" description="Les messages du formulaire de contact apparaîtront ici." icon={<MessageSquare size={18} />} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.messages.map((message) => (
                <li key={message.id}>
                  <Link to="/admin/messages" className="flex items-start gap-3 py-3 transition-colors hover:bg-slate-50">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-aces-gold/15 text-[10px] font-semibold text-aces-gold">
                      {message.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium text-navy">{message.subject}</span>
                      <span className="block truncate text-[11px] text-ink-soft">
                        {message.name} · {formatShortDate(message.createdAt)}
                      </span>
                    </span>
                    {message.status === 'NEW' ? <Badge className="bg-aces-blue/10 text-aces-blue">Non lu</Badge> : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Configuration de l’environnement" description="État des services techniques.">
          <ul className="space-y-3 text-[12.5px]">
            <li className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
              <span className="text-ink">Source de données</span>
              <Badge className={environment.dataAdapter === 'prisma' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                {environment.dataAdapter === 'prisma' ? 'MySQL / Prisma' : 'JSON (démonstration)'}
              </Badge>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
              <span className="text-ink">Notifications e-mail</span>
              <Badge className={environment.mailConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                {environment.mailConfigured ? 'SMTP configuré' : 'SMTP non configuré'}
              </Badge>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
              <span className="text-ink">Utilisateurs administrateurs</span>
              <Badge>{counts.users.total}</Badge>
            </li>
          </ul>
          <p className="mt-4 text-[11.5px] leading-relaxed text-ink-soft">
            Les paramètres du site (coordonnées, logo, réseaux sociaux, SEO) sont modifiables dans{' '}
            <Link to="/admin/parametres" className="font-semibold text-aces-blue">
              Paramètres
            </Link>
            .
          </p>
        </Panel>
      </div>
    </>
  );
}
