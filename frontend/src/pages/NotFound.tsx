import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Phone } from 'lucide-react';
import { useSite } from '../contexts/SiteContext';
import { useSeo } from '../hooks/useSeo';

export function NotFoundContent({
  title = 'Page introuvable',
  description = 'La page que vous recherchez n’existe pas ou a été déplacée. Retournez à l’accueil pour poursuivre votre navigation.',
}: {
  title?: string;
  description?: string;
}) {
  const { call, phone } = useSite();

  return (
    <section className="relative overflow-hidden bg-navy py-24 sm:py-32">
      <div className="absolute inset-0 surface-grid opacity-20" aria-hidden="true" />
      <div className="container relative text-center">
        <p className="font-display text-[80px] font-semibold leading-none text-white/10 sm:text-[120px]">404</p>
        <h1 className="mt-2 text-display-sm text-white">{title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/65">{description}</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn-gold">
            <Home size={16} />
            Retour à l’accueil
          </Link>
          <Link to="/nos-activites" className="btn-outline">
            <ArrowLeft size={16} />
            Voir nos prestations
          </Link>
          <a href={call()} className="btn-outline">
            <Phone size={16} />
            {phone}
          </a>
        </div>
      </div>
    </section>
  );
}

export default function NotFound() {
  useSeo({ title: 'Page introuvable', noindex: true });
  return <NotFoundContent />;
}
