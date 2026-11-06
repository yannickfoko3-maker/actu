import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils';

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, tone = 'light' }: { items: Crumb[]; tone?: 'light' | 'dark' }) {
  return (
    <nav aria-label="Fil d’Ariane" className="w-full">
      <ol
        className={cn(
          'flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]',
          tone === 'dark' ? 'text-white/60' : 'text-ink-soft'
        )}
      >
        <li>
          <Link
            to="/"
            className={cn(
              'inline-flex items-center gap-1.5 transition-colors',
              tone === 'dark' ? 'hover:text-white' : 'hover:text-aces-blue'
            )}
          >
            <Home size={13} />
            <span>Accueil</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            <ChevronRight size={13} className={tone === 'dark' ? 'text-white/30' : 'text-slate-300'} />
            {item.href && index < items.length - 1 ? (
              <Link
                to={item.href}
                className={cn('transition-colors', tone === 'dark' ? 'hover:text-white' : 'hover:text-aces-blue')}
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current="page"
                className={cn('font-medium', tone === 'dark' ? 'text-white/90' : 'text-navy')}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
