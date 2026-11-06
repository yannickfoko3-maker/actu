import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ApiRequestError } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../utils';

const schema = z.object({
  email: z.string().email('Adresse e-mail invalide.'),
  password: z.string().min(6, 'Mot de passe requis.'),
});

type Values = z.infer<typeof schema>;

export function AdminLogin() {
  const { login } = useAuth();
  const { success } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: Values) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
      success('Connexion réussie. Bienvenue !');
    } catch (error) {
      setServerError(
        error instanceof ApiRequestError ? error.message : 'Connexion impossible. Vérifiez vos identifiants.'
      );
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panneau gauche */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy-gradient p-10 lg:flex">
        <div className="absolute inset-0 surface-grid opacity-20" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-aces-blue/25 blur-3xl" />

        <div className="relative">
          <div className="inline-flex rounded-xl bg-white px-3 py-2.5">
            <img src="/assets/brand/aces-logo.jpg" alt="ACES Global Services" className="h-12 w-auto" />
          </div>
        </div>

        <div className="relative max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-aces-gold">
            Espace d’administration
          </p>
          <h1 className="mt-4 font-display text-[34px] font-semibold leading-tight text-white">
            Gérez votre site,
            <br />
            vos contenus et vos demandes.
          </h1>
          <ul className="mt-8 space-y-3 text-[13.5px] text-white/70">
            {[
              'Prestations, pages, réalisations et actualités',
              'Carrousel d’accueil et médiathèque',
              'Demandes de devis et messages centralisés',
              'Paramètres du site et coordonnées',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-aces-gold">
                  <ShieldCheck size={13} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[11.5px] text-white/40">
          © {new Date().getFullYear()} ACES Global Services — Votre sécurité, notre priorité !
        </p>
      </div>

      {/* Formulaire */}
      <div className="flex flex-col justify-center bg-white px-5 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft transition-colors hover:text-aces-blue"
          >
            <ArrowLeft size={14} />
            Retour au site
          </Link>

          <div className="mt-8 lg:hidden">
            <img src="/assets/brand/aces-logo.jpg" alt="ACES Global Services" className="h-14 w-auto" />
          </div>

          <h2 className="mt-8 font-display text-[24px] font-semibold text-navy">Connexion</h2>
          <p className="mt-1.5 text-[13px] text-ink-soft">
            Accédez au tableau de bord pour gérer les contenus du site.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
            <div>
              <label className="label" htmlFor="login-email">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  className={cn('input pl-10', errors.email && 'input-error')}
                  placeholder="vous@aces-globalservices.com"
                  {...register('email')}
                />
              </div>
              {errors.email ? <p className="error-text">{errors.email.message}</p> : null}
            </div>

            <div>
              <label className="label" htmlFor="login-password">
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={cn('input px-10', errors.password && 'input-error')}
                  placeholder="••••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password ? <p className="error-text">{errors.password.message}</p> : null}
            </div>

            {serverError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] text-red-600">
                {serverError}
              </p>
            ) : null}

            <button type="submit" className="btn-primary w-full py-3" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          {import.meta.env.DEV ? (
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11.5px] leading-relaxed text-ink-soft">
              <p className="font-semibold text-navy">Compte de démonstration</p>
              <p className="mt-1">
                admin@aces-globalservices.com
                <br />
                AcesAdmin2025!
              </p>
              <p className="mt-1 text-[10.5px] text-slate-400">
                Modifiez ce mot de passe après la première connexion.
              </p>
            </div>
          ) : null}

          <p className="mt-6 text-center text-[11px] text-slate-400">
            Les tentatives de connexion sont limitées et journalisées.
          </p>
        </div>
      </div>
    </div>
  );
}
