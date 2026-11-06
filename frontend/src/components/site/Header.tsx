import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  X,
} from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { ServiceIcon } from '../ui/ServiceIcon';
import { cn } from '../../utils';

const MAIN_LINKS = [
  { label: 'Accueil', to: '/' },
  { label: 'Qui sommes-nous', to: '/qui-sommes-nous' },
  { label: 'Nos activités', to: '/nos-activites', mega: true },
  { label: 'Nos réalisations', to: '/nos-realisations' },
  { label: 'Actualités', to: '/actualites' },
  { label: 'Contact', to: '/contact' },
];

export function Header() {
  const { settings, navigation, phone, email, whatsapp, call } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const openMega = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };

  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setMegaOpen(false), 140);
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors',
      isActive ? 'text-aces-blue' : 'text-navy/80 hover:text-aces-blue'
    );

  return (
    <header className="sticky top-0 z-[90] w-full">
      {/* Barre d'informations */}
      <div className="hidden bg-navy text-white lg:block">
        <div className="container flex h-10 items-center justify-between text-[12px]">
          <div className="flex items-center gap-6">
            <a href={call()} className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white">
              <Phone size={13} className="text-aces-gold" />
              {phone}
            </a>
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white"
            >
              <Mail size={13} className="text-aces-gold" />
              {email}
            </a>
            <span className="inline-flex items-center gap-2 text-white/60">
              <MapPin size={13} className="text-aces-gold" />
              {settings['company.address']}
              {settings['company.city'] ? `, ${settings['company.city']}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-2 text-white/60">
              <Clock size={13} className="text-aces-gold" />
              {settings['company.hours']}
            </span>
            <a
              href={whatsapp()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-medium text-white transition-colors hover:bg-white/20"
            >
              <MessageCircle size={12} />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Barre principale */}
      <div
        className={cn(
          'border-b border-slate-200/70 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 transition-all duration-300',
          scrolled ? 'shadow-[0_10px_30px_-24px_rgba(6,43,99,0.55)]' : 'shadow-none'
        )}
      >
        <div className={cn('container flex items-center justify-between gap-6 transition-all duration-300', scrolled ? 'h-[68px]' : 'h-[80px]')}>
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="ACES Global Services — Accueil">
            <img
              src={settings['brand.logo'] || '/assets/brand/aces-logo.jpg'}
              alt="ACES Global Services"
              className={cn('w-auto object-contain transition-all duration-300', scrolled ? 'h-11' : 'h-[52px]')}
              width={220}
              height={130}
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
            {MAIN_LINKS.map((link) =>
              link.mega ? (
                <div
                  key={link.to}
                  className="relative"
                  onMouseEnter={openMega}
                  onMouseLeave={scheduleClose}
                >
                  <NavLink
                    to={link.to}
                    className={navItemClass}
                    onFocus={openMega}
                    aria-haspopup="true"
                    aria-expanded={megaOpen}
                  >
                    {link.label}
                    <ChevronDown
                      size={14}
                      className={cn('transition-transform duration-300', megaOpen && 'rotate-180')}
                    />
                  </NavLink>

                  <AnimatePresence>
                    {megaOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute left-1/2 top-full w-[760px] -translate-x-1/2 pt-3"
                      >
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
                          <div className="grid grid-cols-5">
                            <div className="col-span-3 grid grid-cols-2 gap-1 p-4">
                              {navigation.map((service) => (
                                <Link
                                  key={service.slug}
                                  to={`/nos-activites/${service.slug}`}
                                  className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-aces-mist"
                                >
                                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-aces-blue/10 text-aces-blue transition-colors group-hover:bg-aces-blue group-hover:text-white">
                                    <ServiceIcon name={service.icon} size={16} />
                                  </span>
                                  <span>
                                    <span className="block text-[13px] font-semibold text-navy">
                                      {service.title}
                                    </span>
                                    <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-soft">
                                      {service.tagline}
                                    </span>
                                  </span>
                                </Link>
                              ))}
                            </div>
                            <div className="col-span-2 relative flex flex-col justify-between overflow-hidden bg-navy-gradient p-6 text-white">
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-aces-gold">
                                  ACES Global Services
                                </p>
                                <p className="mt-2 font-display text-lg font-semibold leading-snug">
                                  {settings['company.tagline']}
                                </p>
                                <p className="mt-2 text-[12.5px] leading-relaxed text-white/70">
                                  Conseil, installation, maintenance et assistance sur l’ensemble de nos
                                  prestations.
                                </p>
                              </div>
                              <Link
                                to="/nos-activites"
                                className="mt-5 inline-flex items-center gap-2 text-[12.5px] font-semibold text-aces-gold hover:text-white"
                              >
                                Voir toutes les prestations
                                <ArrowRight size={14} />
                              </Link>
                              <span className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-aces-blue/30 blur-2xl" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink key={link.to} to={link.to} className={navItemClass} end={link.to === '/'}>
                  {link.label}
                </NavLink>
              )
            )}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={call()}
              className="hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-[13px] font-semibold text-navy transition-colors hover:border-aces-blue hover:text-aces-blue xl:inline-flex"
            >
              <Phone size={14} className="text-aces-blue" />
              {phone}
            </a>
            <Link to="/devis" className="btn-gold hidden px-5 py-2.5 text-[13px] sm:inline-flex">
              Demander un devis
              <ArrowRight size={15} />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-navy transition-colors hover:border-aces-blue hover:text-aces-blue lg:hidden"
              aria-label="Ouvrir le menu"
              aria-expanded={mobileOpen}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-[100] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-0 flex h-full w-[min(92vw,400px)] flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <img
                  src={settings['brand.logo'] || '/assets/brand/aces-logo.jpg'}
                  alt="ACES Global Services"
                  className="h-11 w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-navy"
                  aria-label="Fermer le menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <nav aria-label="Navigation mobile" className="flex flex-col">
                  {MAIN_LINKS.map((link) =>
                    link.mega ? (
                      <div key={link.to} className="border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <Link
                            to={link.to}
                            className="flex-1 py-3.5 font-display text-[15px] font-semibold text-navy"
                          >
                            {link.label}
                          </Link>
                          <button
                            type="button"
                            onClick={() => setMobileServicesOpen((value) => !value)}
                            className="grid h-9 w-9 place-items-center rounded-lg text-aces-blue"
                            aria-label="Afficher les prestations"
                            aria-expanded={mobileServicesOpen}
                          >
                            <ChevronDown
                              size={18}
                              className={cn('transition-transform', mobileServicesOpen && 'rotate-180')}
                            />
                          </button>
                        </div>
                        {mobileServicesOpen ? (
                          <div className="pb-3">
                            {navigation.map((service) => (
                              <Link
                                key={service.slug}
                                to={`/nos-activites/${service.slug}`}
                                className="flex items-center gap-3 rounded-lg px-2 py-2 text-[13.5px] text-ink-soft transition-colors hover:bg-aces-mist hover:text-navy"
                              >
                                <ServiceIcon name={service.icon} size={15} className="text-aces-blue" />
                                {service.title}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === '/'}
                        className={({ isActive }) =>
                          cn(
                            'border-b border-slate-100 py-3.5 font-display text-[15px] font-semibold transition-colors',
                            isActive ? 'text-aces-blue' : 'text-navy'
                          )
                        }
                      >
                        {link.label}
                      </NavLink>
                    )
                  )}
                </nav>

                <div className="mt-6 space-y-3">
                  <Link to="/devis" className="btn-gold w-full">
                    Demander un devis
                    <ArrowRight size={16} />
                  </Link>
                  <a href={whatsapp()} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full">
                    <MessageCircle size={16} className="text-[#25D366]" />
                    Discuter sur WhatsApp
                  </a>
                </div>

                <div className="mt-6 space-y-2.5 rounded-xl bg-aces-mist p-4 text-[13px] text-ink-soft">
                  <a href={call()} className="flex items-center gap-2.5">
                    <Phone size={14} className="text-aces-blue" /> {phone}
                  </a>
                  <a href={`mailto:${email}`} className="flex items-center gap-2.5 break-all">
                    <Mail size={14} className="text-aces-blue" /> {email}
                  </a>
                  <p className="flex items-start gap-2.5">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-aces-blue" />
                    {settings['company.address']}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
