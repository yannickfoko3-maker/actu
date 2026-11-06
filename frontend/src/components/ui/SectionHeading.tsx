import type { ReactNode } from 'react';
import { cn } from '../../utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
  className?: string;
  children?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5',
        align === 'center' && 'items-center text-center',
        className
      )}
    >
      {eyebrow ? (
        <span className={cn('eyebrow eyebrow-line', align === 'center' && 'justify-center')}>{eyebrow}</span>
      ) : null}
      <h2
        className={cn(
          'text-display-sm sm:text-display',
          tone === 'light' ? 'text-white' : 'text-navy',
          align === 'center' ? 'max-w-3xl' : 'max-w-2xl'
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'max-w-2xl text-[15.5px] leading-relaxed sm:text-base',
            tone === 'light' ? 'text-white/70' : 'text-ink-soft',
            align === 'center' && 'mx-auto'
          )}
        >
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}
