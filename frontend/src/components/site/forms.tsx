import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, CheckCircle2, Loader2, MessageCircle, Send } from 'lucide-react';
import { ApiRequestError, api } from '../../services/api';
import { useSite } from '../../contexts/SiteContext';
import { useToast } from '../../contexts/ToastContext';
import type { ServiceSummary } from '../../types';
import { cn } from '../../utils';

const phoneRegex = /^[+0-9()\s.-]{6,25}$/;

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Indiquez votre nom complet.'),
  email: z.string().trim().email('Adresse e-mail invalide.'),
  phone: z.string().trim().regex(phoneRegex, 'Numéro de téléphone invalide.'),
  subject: z.string().trim().min(3, 'Précisez le sujet de votre message.'),
  message: z.string().trim().min(10, 'Votre message doit contenir au moins 10 caractères.'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Votre consentement est nécessaire.' }) }),
});

type ContactValues = z.infer<typeof contactSchema>;

const quoteSchema = z.object({
  name: z.string().trim().min(2, 'Indiquez votre nom complet.'),
  company: z.string().trim().optional(),
  email: z.string().trim().email('Adresse e-mail invalide.'),
  phone: z.string().trim().regex(phoneRegex, 'Numéro de téléphone invalide.'),
  city: z.string().trim().min(2, 'Indiquez votre ville.'),
  serviceSlug: z.string().min(1, 'Sélectionnez une prestation.'),
  projectDescription: z.string().trim().min(20, 'Décrivez votre projet en quelques mots (20 caractères minimum).'),
  budget: z.string().optional(),
  preferredContact: z.enum(['phone', 'email', 'whatsapp']),
  consent: z.literal(true, { errorMap: () => ({ message: 'Votre consentement est nécessaire.' }) }),
});

type QuoteValues = z.infer<typeof quoteSchema>;

const BUDGETS = [
  'Moins de 500 000 FCFA',
  '500 000 – 1 000 000 FCFA',
  '1 000 000 – 2 500 000 FCFA',
  '2 500 000 – 5 000 000 FCFA',
  'Plus de 5 000 000 FCFA',
  'À définir ensemble',
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="error-text">{message}</p>;
}

function SuccessPanel({
  title,
  message,
  onReset,
}: {
  title: string;
  message: string;
  onReset: () => void;
}) {
  const { whatsapp } = useSite();
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 size={28} />
      </span>
      <h3 className="mt-5 font-display text-lg font-semibold text-navy">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{message}</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <a href={whatsapp()} target="_blank" rel="noopener noreferrer" className="btn-primary">
          <MessageCircle size={16} />
          Continuer sur WhatsApp
        </a>
        <button type="button" onClick={onReset} className="btn-ghost">
          Envoyer une autre demande
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* Formulaire de contact                                                      */
/* ------------------------------------------------------------------------- */
export function ContactForm({ className }: { className?: string }) {
  const { setting } = useSite();
  const { error: toastError } = useToast();
  const [success, setSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '', consent: false as unknown as true },
  });

  const onSubmit = async (values: ContactValues) => {
    setServerError(null);
    try {
      const response = await api.post<{ message: string }>('/public/messages', values);
      setSuccess(response.message || setting('forms.successMessage'));
      reset();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.details?.length) {
          error.details.forEach((detail) => {
            if (detail.field in values) setError(detail.field as keyof ContactValues, { message: detail.message });
          });
        }
        setServerError(error.message);
        toastError(error.message);
      } else {
        setServerError('Une erreur est survenue. Merci de réessayer.');
      }
    }
  };

  if (success) {
    return <SuccessPanel title="Message envoyé" message={success} onReset={() => setSuccess(null)} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-5', className)} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="contact-name">
            Nom et prénom <span className="text-aces-gold">*</span>
          </label>
          <input
            id="contact-name"
            className={cn('input', errors.name && 'input-error')}
            placeholder="Ex. : Marie Koudou"
            autoComplete="name"
            {...register('name')}
          />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <label className="label" htmlFor="contact-phone">
            Téléphone <span className="text-aces-gold">*</span>
          </label>
          <input
            id="contact-phone"
            type="tel"
            className={cn('input', errors.phone && 'input-error')}
            placeholder="+242 06 00 00 00"
            autoComplete="tel"
            {...register('phone')}
          />
          <FieldError message={errors.phone?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="contact-email">
            E-mail <span className="text-aces-gold">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            className={cn('input', errors.email && 'input-error')}
            placeholder="vous@exemple.com"
            autoComplete="email"
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <label className="label" htmlFor="contact-subject">
            Sujet <span className="text-aces-gold">*</span>
          </label>
          <input
            id="contact-subject"
            className={cn('input', errors.subject && 'input-error')}
            placeholder="Ex. : installation de caméras"
            {...register('subject')}
          />
          <FieldError message={errors.subject?.message} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="contact-message">
          Message <span className="text-aces-gold">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={5}
          className={cn('input resize-none', errors.message && 'input-error')}
          placeholder="Décrivez votre besoin, votre site et vos contraintes…"
          {...register('message')}
        />
        <FieldError message={errors.message?.message} />
      </div>

      <label className="flex items-start gap-3 text-[12.5px] leading-relaxed text-ink-soft">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-aces-blue focus:ring-aces-blue"
          {...register('consent')}
        />
        <span>
          J’accepte que mes informations soient utilisées pour traiter ma demande, conformément à la{' '}
          <Link to="/politique-de-confidentialite" className="text-aces-blue underline underline-offset-2">
            politique de confidentialité
          </Link>
          .
        </span>
      </label>

      {/* Piège anti-robot (invisible pour les humains) */}
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" name="honeypot" />

      {serverError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">{serverError}</p>
      ) : null}

      <button type="submit" className="btn-primary w-full py-3.5" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : <Send size={16} />}
        {isSubmitting ? 'Envoi en cours…' : 'Envoyer le message'}
      </button>
      <p className="text-center text-[11.5px] text-ink-soft">
        Réponse sous 24 à 48 heures ouvrées. Aucune donnée n’est transmise à des tiers.
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------------- */
/* Formulaire de demande de devis                                             */
/* ------------------------------------------------------------------------- */
export function QuoteForm({
  services,
  defaultServiceSlug,
  className,
}: {
  services: ServiceSummary[];
  defaultServiceSlug?: string;
  className?: string;
}) {
  const { setting } = useSite();
  const { error: toastError } = useToast();
  const [success, setSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<QuoteValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      city: '',
      serviceSlug: defaultServiceSlug ?? '',
      projectDescription: '',
      budget: '',
      preferredContact: 'phone',
      consent: false as unknown as true,
    },
  });

  const onSubmit = async (values: QuoteValues) => {
    setServerError(null);
    const selected = services.find((service) => service.slug === values.serviceSlug);
    try {
      const response = await api.post<{ message: string }>('/public/quotes', {
        ...values,
        serviceTitle: selected?.title ?? values.serviceSlug,
      });
      setSuccess(response.message || setting('forms.quoteSuccessMessage'));
      reset({
        name: '',
        company: '',
        email: '',
        phone: '',
        city: '',
        serviceSlug: defaultServiceSlug ?? '',
        projectDescription: '',
        budget: '',
        preferredContact: 'phone',
        consent: false as unknown as true,
      });
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.details?.length) {
          error.details.forEach((detail) => {
            if (detail.field in values) setError(detail.field as keyof QuoteValues, { message: detail.message });
          });
        }
        setServerError(error.message);
        toastError(error.message);
      } else {
        setServerError('Une erreur est survenue. Merci de réessayer.');
      }
    }
  };

  if (success) {
    return (
      <SuccessPanel
        title="Demande de devis reçue"
        message={success}
        onReset={() => setSuccess(null)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-5', className)} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="quote-name">
            Nom et prénom <span className="text-aces-gold">*</span>
          </label>
          <input
            id="quote-name"
            className={cn('input', errors.name && 'input-error')}
            autoComplete="name"
            {...register('name')}
          />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <label className="label" htmlFor="quote-company">
            Entreprise <span className="text-ink-soft/60">(facultatif)</span>
          </label>
          <input id="quote-company" className="input" autoComplete="organization" {...register('company')} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="quote-email">
            E-mail <span className="text-aces-gold">*</span>
          </label>
          <input
            id="quote-email"
            type="email"
            className={cn('input', errors.email && 'input-error')}
            autoComplete="email"
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <label className="label" htmlFor="quote-phone">
            Téléphone <span className="text-aces-gold">*</span>
          </label>
          <input
            id="quote-phone"
            type="tel"
            className={cn('input', errors.phone && 'input-error')}
            autoComplete="tel"
            {...register('phone')}
          />
          <FieldError message={errors.phone?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="quote-city">
            Ville <span className="text-aces-gold">*</span>
          </label>
          <input
            id="quote-city"
            className={cn('input', errors.city && 'input-error')}
            autoComplete="address-level2"
            {...register('city')}
          />
          <FieldError message={errors.city?.message} />
        </div>
        <div>
          <label className="label" htmlFor="quote-service">
            Prestation concernée <span className="text-aces-gold">*</span>
          </label>
          <select
            id="quote-service"
            className={cn('input', errors.serviceSlug && 'input-error')}
            {...register('serviceSlug')}
          >
            <option value="">Sélectionnez une prestation…</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.title}
              </option>
            ))}
            <option value="autre">Autre / plusieurs prestations</option>
          </select>
          <FieldError message={errors.serviceSlug?.message} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="quote-description">
          Description du projet <span className="text-aces-gold">*</span>
        </label>
        <textarea
          id="quote-description"
          rows={5}
          className={cn('input resize-none', errors.projectDescription && 'input-error')}
          placeholder="Type de site, surface ou périmètre, nombre de points à équiper, délai souhaité…"
          {...register('projectDescription')}
        />
        <FieldError message={errors.projectDescription?.message} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="quote-budget">
            Budget estimatif <span className="text-ink-soft/60">(facultatif)</span>
          </label>
          <select id="quote-budget" className="input" {...register('budget')}>
            <option value="">Non précisé</option>
            {BUDGETS.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="label">Moyen de contact préféré</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'phone', label: 'Téléphone' },
              { value: 'whatsapp', label: 'WhatsApp' },
              { value: 'email', label: 'E-mail' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-2 py-3 text-[12px] font-medium text-ink-soft transition-colors has-[:checked]:border-aces-blue has-[:checked]:bg-aces-blue/5 has-[:checked]:text-aces-blue"
              >
                <input
                  type="radio"
                  value={option.value}
                  className="h-3.5 w-3.5 text-aces-blue focus:ring-aces-blue"
                  {...register('preferredContact')}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <label className="flex items-start gap-3 text-[12.5px] leading-relaxed text-ink-soft">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-aces-blue focus:ring-aces-blue"
          {...register('consent')}
        />
        <span>
          J’accepte d’être contacté au sujet de ma demande et que mes informations soient traitées conformément à la{' '}
          <Link to="/politique-de-confidentialite" className="text-aces-blue underline underline-offset-2">
            politique de confidentialité
          </Link>
          . <span className="text-aces-gold">*</span>
        </span>
      </label>
      <FieldError message={errors.consent?.message} />

      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" name="honeypot" />

      {serverError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">{serverError}</p>
      ) : null}

      <button type="submit" className="btn-gold w-full py-3.5" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}
        {isSubmitting ? 'Envoi en cours…' : 'Envoyer ma demande de devis'}
      </button>
      <p className="text-center text-[11.5px] text-ink-soft">
        Devis gratuit et sans engagement. Réponse sous 24 à 48 heures ouvrées.
      </p>
    </form>
  );
}
