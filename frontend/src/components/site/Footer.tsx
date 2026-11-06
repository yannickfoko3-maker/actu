import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Facebook, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Youtube } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';

const QUICK_LINKS = [
  { label: 'Qui sommes-nous', to: '/qui-sommes-nous' },
  { label: 'Nos activités', to: '/nos-activites' },
  { label: 'Nos réalisations', to: '/nos-realisations' },
  { label: 'Actualités & conseils', to: '/actualites' },
  { label: 'Demander un devis', to: '/devis' },
  { label: 'Contact', to: '/contact' },
];

export function Footer() {
  const { settings, navigation, email, phone, whatsapp, call } = useSite();

  const socials = [
    { key: 'facebook', url: settings['social.facebook'], Icon: Facebook, label: 'Facebook' },
    { key: 'linkedin', url: settings['social.linkedin'], Icon: Linkedin, label: 'LinkedIn' },
    { key: 'instagram', url: settings['social.instagram'], Icon: Instagram, label: 'Instagram' },
    { key: 'youtube', url: settings['social.youtube'], Icon: Youtube, label: 'YouTube' },
  ].filter((social) => social.url);

  return (
    <footer className="relative overflow-hidden bg-navy-gradient text-white">
      <div className="pointer-events-none absolute inset-0 surface-grid opacity-25" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-aces-blue/20 blur-3xl" aria-hidden="true" />

      <div className="container relative">
        {/* Bandeau haut */}
        <div className="flex flex-col gap-6 border-b border-white/10 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Un projet de sécurisation ou d’automatisation ?</p>
            <h2 className="mt-3 max-w-xl text-[26px] font-semibold leading-snug text-white sm:text-[30px]">
              Parlons de vos contraintes, nous construirons la solution adaptée.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/devis" className="btn-gold">
              Demander un devis
              <ArrowUpRight size={16} />
            </Link>
            <a href={whatsapp()} target="_blank" rel="noopener noreferrer" className="btn-outline">
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>
        </div>

        {/* Colonnes */}
        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="inline-flex rounded-xl bg-white px-3 py-2.5">
              <img
                src={settings['brand.logo'] || '/assets/brand/aces-logo.jpg'}
                alt="ACES Global Services"
                className="h-12 w-auto object-contain"
                loading="lazy"
              />
            </div>
            <p className="mt-5 font-display text-sm font-semibold text-aces-gold">
              {settings['company.tagline']}
            </p>
            <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-white/65">
              {settings['footer.about'] || settings['company.description']}
            </p>
            {socials.length > 0 ? (
              <div className="mt-6 flex gap-2.5">
                {socials.map(({ key, url, Icon, label }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 bg-white/5 text-white/70 transition-colors hover:border-aces-gold hover:text-aces-gold"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/50">Nos prestations</h3>
            <ul className="mt-5 space-y-2.5">
              {navigation.slice(0, 6).map((service) => (
                <li key={service.slug}>
                  <Link
                    to={`/nos-activites/${service.slug}`}
                    className="text-[13.5px] text-white/70 transition-colors hover:text-aces-gold"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/nos-activites"
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-aces-gold hover:text-white"
                >
                  Toutes les prestations
                  <ArrowUpRight size={13} />
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/50">Navigation</h3>
            <ul className="mt-5 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[13.5px] text-white/70 transition-colors hover:text-aces-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/50">Nous joindre</h3>
            <ul className="mt-5 space-y-4 text-[13.5px]">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-aces-gold" />
                <span className="text-white/70">
                  {settings['company.address']}
                  <br />
                  {settings['company.city']}
                  {settings['company.country'] ? `, ${settings['company.country']}` : ''}
                </span>
              </li>
              <li>
                <a href={call()} className="flex items-center gap-3 text-white/70 transition-colors hover:text-white">
                  <Phone size={16} className="shrink-0 text-aces-gold" />
                  {phone}
                </a>
              </li>
              <li>
                <a
                  href={whatsapp()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white/70 transition-colors hover:text-white"
                >
                  <MessageCircle size={16} className="shrink-0 text-aces-gold" />
                  WhatsApp : {phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 break-all text-white/70 transition-colors hover:text-white"
                >
                  <Mail size={16} className="shrink-0 text-aces-gold" />
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Clock size={16} className="shrink-0 text-aces-gold" />
                {settings['company.hours']}
              </li>
            </ul>
          </div>
        </div>

        {/* Bas de page */}
        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-[12.5px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings['company.legalName'] || 'ACES Global Services'}. Tous droits
            réservés.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/mentions-legales" className="transition-colors hover:text-white">
              Mentions légales
            </Link>
            <Link to="/politique-de-confidentialite" className="transition-colors hover:text-white">
              Politique de confidentialité
            </Link>
            <Link to="/admin" className="transition-colors hover:text-white">
              Espace administration
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
