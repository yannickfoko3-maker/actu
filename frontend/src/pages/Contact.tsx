import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useSeo } from '../hooks/useSeo';
import { useSite } from '../contexts/SiteContext';
import { PageHero } from '../components/site/PageHero';
import { ContactForm } from '../components/site/forms';
import { Reveal } from '../components/ui/Reveal';

export default function Contact() {
  const { settings, phone, email, whatsapp, call } = useSite();

  useSeo({
    title: 'Contact — Parlons de votre projet',
    description:
      'Contactez ACES Global Services : téléphone, WhatsApp, e-mail et formulaire. N°12 Rue Koudéka, Batignolles – La Frontière. Réponse sous 24 à 48 heures ouvrées.',
    image: '/assets/images/hero/hero-5.jpg',
    canonicalPath: '/contact',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact ACES Global Services',
      mainEntity: {
        '@type': 'LocalBusiness',
        name: settings['company.name'],
        telephone: settings['company.phone'],
        email: settings['company.email'],
        address: {
          '@type': 'PostalAddress',
          streetAddress: settings['company.address'],
          addressLocality: settings['company.city'],
          addressCountry: 'CF',
        },
      },
    },
  });

  const channels = [
    {
      icon: Phone,
      label: 'Téléphone',
      value: phone,
      href: call(),
      description: 'Du lundi au samedi, 08h00 – 18h00',
      accent: 'text-aces-blue bg-aces-blue/10',
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: phone,
      href: whatsapp(),
      description: 'Réponse rapide, photos acceptées',
      accent: 'text-[#128C7E] bg-[#25D366]/10',
      external: true,
    },
    {
      icon: Mail,
      label: 'E-mail',
      value: email,
      href: `mailto:${email}`,
      description: 'Réponse sous 24 à 48 h ouvrées',
      accent: 'text-aces-gold bg-aces-gold/10',
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Parlons de votre projet"
        subtitle="Une question, une visite technique à programmer, un devis à demander ? Notre équipe vous répond rapidement."
        image="/assets/images/hero/hero-5.jpg"
        breadcrumbs={[{ label: 'Contact' }]}
        size="compact"
      />

      <section className="section bg-white">
        <div className="container">
          <div className="grid gap-4 sm:grid-cols-3">
            {channels.map((channel, index) => (
              <Reveal key={channel.label} delay={index * 0.05}>
                <a
                  href={channel.href}
                  {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="card card-hover flex h-full items-start gap-4 p-5"
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${channel.accent}`}>
                    <channel.icon size={19} />
                  </span>
                  <span>
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                      {channel.label}
                    </span>
                    <span className="mt-1 block break-all text-[14px] font-semibold text-navy">
                      {channel.value}
                    </span>
                    <span className="mt-1 block text-[12px] text-ink-soft">{channel.description}</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <div className="card p-6 sm:p-8">
                <h2 className="font-display text-xl font-semibold text-navy">Envoyez-nous un message</h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                  Renseignez les champs ci-dessous : plus votre demande est précise, plus notre réponse sera utile.
                </p>
                <div className="mt-7">
                  <ContactForm />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="space-y-5">
                <div className="card p-6">
                  <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold text-navy">
                    <MapPin size={17} className="text-aces-blue" />
                    Notre adresse
                  </h2>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
                    {settings['company.address']}
                    <br />
                    {settings['company.city']}
                    {settings['company.country'] ? `, ${settings['company.country']}` : ''}
                  </p>
                  <p className="mt-4 flex items-center gap-2 text-[12.5px] text-ink-soft">
                    <Clock size={14} className="text-aces-blue" />
                    {settings['company.hours']}
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  {settings['company.mapEmbedUrl'] ? (
                    <iframe
                      title="Localisation d’ACES Global Services"
                      src={settings['company.mapEmbedUrl']}
                      className="h-[300px] w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="grid h-[300px] place-items-center bg-aces-mist text-[13px] text-ink-soft">
                      Carte non configurée
                    </div>
                  )}
                </div>
                <p className="text-[11.5px] leading-relaxed text-ink-soft">
                  L’adresse et la carte sont modifiables depuis l’espace d’administration (Paramètres → Coordonnées).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
