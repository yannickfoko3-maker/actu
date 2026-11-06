import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity } from 'lucide-react';
import { api, queryKeys } from '../../services/api';
import type { ActivityLog, Paginated } from '../../types';
import { EmptyState, LoadingBlock, PageHeader, Pagination, Panel, SearchInput, Table, Td } from '../components/ui';
import { ACTION_LABELS, cn, formatDateTime } from '../../utils';

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  update: 'bg-aces-blue/10 text-aces-blue border-aces-blue/20',
  delete: 'bg-red-50 text-red-600 border-red-200',
  login: 'bg-slate-100 text-slate-600 border-slate-200',
  logout: 'bg-slate-100 text-slate-500 border-slate-200',
  export: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function ActivityPage() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.activity({ search, action, page }),
    queryFn: () =>
      api.get<Paginated<ActivityLog>>(
        `/admin/activity-logs?limit=30&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}${
          action ? `&action=${action}` : ''
        }`
      ),
  });

  return (
    <>
      <PageHeader
        title="Journal d’activité"
        description="Historique des actions effectuées dans l’administration : connexions, créations, modifications et suppressions."
        breadcrumb={['Administration', 'Journal d’activité']}
      />

      <Panel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Rechercher une action…"
            className="sm:w-72"
          />
          <div className="flex flex-wrap gap-1.5">
            {[
              { value: '', label: 'Toutes' },
              { value: 'create', label: 'Créations' },
              { value: 'update', label: 'Modifications' },
              { value: 'delete', label: 'Suppressions' },
              { value: 'login', label: 'Connexions' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setAction(option.value);
                  setPage(1);
                }}
                className={cn('chip', action === option.value && 'chip-active')}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <LoadingBlock />
          ) : data && data.items.length > 0 ? (
            <>
              <Table head={['Action', 'Description', 'Utilisateur', 'Adresse IP', 'Date']}>
                {data.items.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <Td>
                      <span
                        className={cn(
                          'rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                          ACTION_COLORS[log.action] ?? 'border-slate-200 bg-slate-50 text-slate-600'
                        )}
                      >
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </Td>
                    <Td className="max-w-[420px] text-[12.5px] text-ink">{log.description}</Td>
                    <Td className="whitespace-nowrap text-[12px] text-slate-600">{log.userName}</Td>
                    <Td className="whitespace-nowrap text-[11.5px] text-slate-400">{log.ip || '—'}</Td>
                    <Td className="whitespace-nowrap text-[11.5px] text-slate-500">{formatDateTime(log.createdAt)}</Td>
                  </tr>
                ))}
              </Table>
              <Pagination pagination={data.pagination} onPage={setPage} />
            </>
          ) : (
            <EmptyState title="Aucune activité" description="Les actions réalisées apparaîtront ici." icon={<Activity size={18} />} />
          )}
        </div>
      </Panel>
    </>
  );
}
