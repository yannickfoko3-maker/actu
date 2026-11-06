import { Plus, Trash2 } from 'lucide-react';
import { cn } from '../../utils';

/** Liste de chaînes éditables (avantages, applications, équipements…). */
export function StringList({
  label,
  hint,
  items,
  onChange,
  placeholder = 'Ajouter une entrée…',
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-slate-100 text-[11px] font-semibold text-slate-500">
              {index + 1}
            </span>
            <input
              className="input py-2 text-[13px]"
              value={item}
              placeholder={placeholder}
              onChange={(event) => {
                const next = [...items];
                next[index] = event.target.value;
                onChange(next);
              }}
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label="Supprimer cette entrée"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...items, ''])} className="btn-ghost btn-sm">
          <Plus size={14} />
          Ajouter
        </button>
      </div>
      {hint ? <p className="help">{hint}</p> : null}
    </div>
  );
}

/** Liste de paires (titre + description) : caractéristiques, étapes, FAQ. */
export function PairList<T extends object>({
  label,
  items,
  onChange,
  firstKey,
  secondKey,
  firstPlaceholder,
  secondPlaceholder,
  secondAsTextarea,
  addLabel = 'Ajouter',
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  firstKey: string;
  secondKey: string;
  firstPlaceholder: string;
  secondPlaceholder: string;
  secondAsTextarea?: boolean;
  addLabel?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
            <div className="flex items-start gap-2">
              <input
                className="input py-2 text-[13px]"
                value={(item as Record<string, string>)[firstKey] ?? ''}
                placeholder={firstPlaceholder}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = { ...item, [firstKey]: event.target.value } as T;
                  onChange(next);
                }}
              />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Supprimer cette ligne"
              >
                <Trash2 size={14} />
              </button>
            </div>
            {secondAsTextarea ? (
              <textarea
                className={cn('input mt-2 resize-none py-2 text-[12.5px]')}
                rows={3}
                value={(item as Record<string, string>)[secondKey] ?? ''}
                placeholder={secondPlaceholder}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = { ...item, [secondKey]: event.target.value } as T;
                  onChange(next);
                }}
              />
            ) : (
              <input
                className="input mt-2 py-2 text-[12.5px]"
                value={(item as Record<string, string>)[secondKey] ?? ''}
                placeholder={secondPlaceholder}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = { ...item, [secondKey]: event.target.value } as T;
                  onChange(next);
                }}
              />
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, { [firstKey]: '', [secondKey]: '' } as T])}
          className="btn-ghost btn-sm"
        >
          <Plus size={14} />
          {addLabel}
        </button>
      </div>
    </div>
  );
}
