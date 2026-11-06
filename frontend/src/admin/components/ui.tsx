import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, Search, X } from 'lucide-react';
import { cn } from '../../utils';

/* ------------------------------------------------------------------------- */
/* En-tête de page                                                            */
/* ------------------------------------------------------------------------- */
export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumb?: string[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {breadcrumb?.length ? (
          <p className="mb-1.5 text-[11.5px] text-slate-400">{breadcrumb.join(' / ')}</p>
        ) : null}
        <h1 className="font-display text-[22px] font-semibold text-navy sm:text-[26px]">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-[13px] text-ink-soft">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* Cartes et champs                                                           */
/* ------------------------------------------------------------------------- */
export function Panel({
  title,
  description,
  children,
  actions,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-white', className)}>
      {title ? (
        <header className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-[14.5px] font-semibold text-navy">{title}</h2>
            {description ? <p className="mt-0.5 text-[12px] text-ink-soft">{description}</p> : null}
          </div>
          {actions}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  required,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">
        {label} {required ? <span className="text-aces-gold">*</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="help">{hint}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3">
      <span>
        <span className="block text-[13px] font-medium text-navy">{label}</span>
        {description ? <span className="mt-0.5 block text-[11.5px] text-ink-soft">{description}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-aces-blue' : 'bg-slate-300'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all',
            checked ? 'left-[22px]' : 'left-0.5'
          )}
        />
      </button>
    </label>
  );
}

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
        'border-slate-200 bg-slate-50 text-slate-600',
        className
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------------- */
/* États                                                                      */
/* ------------------------------------------------------------------------- */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 size={20} className={cn('animate-spin text-aces-blue', className)} />;
}

export function LoadingBlock({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-16 text-[13px] text-ink-soft">
      <Spinner />
      {label}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-14 text-center">
      {icon ? <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-white text-aces-blue shadow-sm">{icon}</div> : null}
      <p className="font-display text-[14.5px] font-semibold text-navy">{title}</p>
      {description ? <p className="mx-auto mt-1.5 max-w-md text-[12.5px] text-ink-soft">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* Modal & confirmation                                                       */
/* ------------------------------------------------------------------------- */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[150] flex items-end justify-center bg-navy/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className={cn(
              'flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl',
              size === 'sm' ? 'sm:max-w-md' : size === 'lg' ? 'sm:max-w-4xl' : 'sm:max-w-2xl'
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-display text-[15.5px] font-semibold text-navy">{title}</h2>
                {description ? <p className="mt-0.5 text-[12px] text-ink-soft">{description}</p> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Fermer"
              >
                <X size={17} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer ? <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3.5">{footer}</footer> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Supprimer',
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className="btn-ghost btn-sm" onClick={onCancel}>
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? <Spinner className="text-white" /> : null}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-[13.5px] leading-relaxed text-ink-soft">{message}</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------------- */
/* Barre de recherche & pagination                                            */
/* ------------------------------------------------------------------------- */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Rechercher…',
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        className="input py-2.5 pl-9 text-[13px]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}

export function Pagination({
  pagination,
  onPage,
}: {
  pagination?: { page: number; totalPages: number; total: number };
  onPage: (page: number) => void;
}) {
  if (!pagination || pagination.totalPages <= 1) {
    return pagination ? (
      <p className="mt-4 text-[12px] text-slate-400">{pagination.total} élément(s)</p>
    ) : null;
  }

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-[12px] text-slate-400">
        Page {pagination.page} sur {pagination.totalPages} — {pagination.total} élément(s)
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-ghost btn-sm"
          onClick={() => onPage(Math.max(1, pagination.page - 1))}
          disabled={pagination.page <= 1}
        >
          <ChevronLeft size={14} />
          Précédent
        </button>
        <button
          type="button"
          className="btn-ghost btn-sm"
          onClick={() => onPage(Math.min(pagination.totalPages, pagination.page + 1))}
          disabled={pagination.page >= pagination.totalPages}
        >
          Suivant
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* Tableaux                                                                   */
/* ------------------------------------------------------------------------- */
export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200">
            {head.map((label) => (
              <th
                key={label}
                className="whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('px-3 py-3 text-[13px] text-ink', className)}>{children}</td>;
}
