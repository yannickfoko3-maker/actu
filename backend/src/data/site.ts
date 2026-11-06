/**
 * Paramètres du site, diapositives du carrousel et pages institutionnelles.
 * Tout est modifiable depuis le back-office (/admin).
 */

export interface SeedSetting {
  key: string;
  value: string;
  group: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'url' | 'email' | 'tel' | 'json';
}

export const siteSettings: SeedSetting[] = [
  // Identité
  { key: 'company.name', value: 'ACES Global Services', group: 'Identité', label: 'Nom de l’entreprise', type: 'text' },
  { key: 'company.legalName', value: 'ACES Global Services RCA', group: 'Identité', label: 'Raison sociale complète', type: 'text' },
  {
    key: 'company.tagline',
    value: 'Votre sécurité, notre priorité !',
    group: 'Identité',
    label: 'Slogan',
    type: 'text',
  },
  {
    key: 'company.baseline',
    value: 'Automatisation – Communication – Énergie et Sécurité',
    group: 'Identité',
    label: 'Signature d’activité',
    type: 'text',
  },
  {
    key: 'company.description',
    value:
      "ACES Global Services est une entreprise spécialisée dans l’automatisation, la communication, l’énergie et la sécurité. Nous concevons, installons et maintenons des solutions techniques fiables pour les particuliers, les entreprises et les institutions.",
    group: 'Identité',
    label: 'Présentation courte',
    type: 'textarea',
  },
  // Coordonnées
  { key: 'company.phone', value: '+242 06 539 0297', group: 'Coordonnées', label: 'Téléphone affiché', type: 'tel' },
  { key: 'company.phoneHref', value: '+242065390297', group: 'Coordonnées', label: 'Téléphone (format international)', type: 'tel' },
  { key: 'company.phone2', value: '', group: 'Coordonnées', label: 'Téléphone secondaire', type: 'tel' },
  { key: 'company.whatsapp', value: '242065390297', group: 'Coordonnées', label: 'Numéro WhatsApp (sans + ni espaces)', type: 'text' },
  { key: 'company.email', value: 'aces.globalservices@gmail.com', group: 'Coordonnées', label: 'Adresse e-mail', type: 'email' },
  { key: 'company.address', value: 'N°12 Rue Koudéka, Batignolles – La Frontière', group: 'Coordonnées', label: 'Adresse', type: 'text' },
  { key: 'company.city', value: 'Bangui', group: 'Coordonnées', label: 'Ville', type: 'text' },
  { key: 'company.country', value: 'République Centrafricaine', group: 'Coordonnées', label: 'Pays', type: 'text' },
  { key: 'company.hours', value: 'Lundi – Samedi : 08h00 – 18h00', group: 'Coordonnées', label: 'Horaires', type: 'text' },
  {
    key: 'company.whatsappMessage',
    value:
      'Bonjour ACES Global Services, je souhaite obtenir des informations sur vos prestations et demander un devis.',
    group: 'Coordonnées',
    label: 'Message WhatsApp par défaut',
    type: 'textarea',
  },
  {
    key: 'company.mapEmbedUrl',
    value:
      'https://www.openstreetmap.org/export/embed.html?bbox=18.5333%2C4.3433%2C18.5933%2C4.3933&layer=mapnik&marker=4.3683%2C18.5633',
    group: 'Coordonnées',
    label: 'URL d’intégration de la carte',
    type: 'url',
  },
  // Marque
  { key: 'brand.logo', value: '/assets/brand/aces-logo.jpg', group: 'Marque', label: 'Logo', type: 'image' },
  { key: 'brand.logoLight', value: '/assets/brand/aces-logo-transparent.png', group: 'Marque', label: 'Logo détouré', type: 'image' },
  { key: 'brand.favicon', value: '/favicon.png', group: 'Marque', label: 'Favicon', type: 'image' },
  // Réseaux sociaux
  { key: 'social.facebook', value: '', group: 'Réseaux sociaux', label: 'Facebook', type: 'url' },
  { key: 'social.linkedin', value: '', group: 'Réseaux sociaux', label: 'LinkedIn', type: 'url' },
  { key: 'social.instagram', value: '', group: 'Réseaux sociaux', label: 'Instagram', type: 'url' },
  { key: 'social.youtube', value: '', group: 'Réseaux sociaux', label: 'YouTube', type: 'url' },
  // SEO
  { key: 'seo.siteName', value: 'ACES Global Services', group: 'SEO', label: 'Nom du site (SEO)', type: 'text' },
  {
    key: 'seo.defaultTitle',
    value: 'ACES Global Services — Sécurité électronique, automatisation et énergie solaire',
    group: 'SEO',
    label: 'Titre par défaut',
    type: 'text',
  },
  {
    key: 'seo.defaultDescription',
    value:
      'ACES Global Services conçoit et installe vos solutions de sécurité électronique, de contrôle d’accès, de vidéosurveillance, d’automatisation et d’énergie solaire. Devis gratuit et accompagnement de A à Z.',
    group: 'SEO',
    label: 'Méta-description par défaut',
    type: 'textarea',
  },
  {
    key: 'seo.keywords',
    value:
      'ACES Global Services, sécurité électronique, vidéosurveillance, clôture électrique, panneaux solaires, contrôle d’accès, portails automatiques, alarme incendie, interphone, reconnaissance faciale, géolocalisation GPS',
    group: 'SEO',
    label: 'Mots-clés',
    type: 'textarea',
  },
  { key: 'seo.ogImage', value: '/assets/images/hero/hero-1.jpg', group: 'SEO', label: 'Image de partage (Open Graph)', type: 'image' },
  // Formulaires
  {
    key: 'forms.successMessage',
    value: 'Merci, votre message a bien été enregistré. Notre équipe vous répond sous 24 à 48 heures ouvrées.',
    group: 'Formulaires',
    label: 'Message de confirmation',
    type: 'textarea',
  },
  {
    key: 'forms.quoteSuccessMessage',
    value:
      'Merci, votre demande de devis a bien été reçue. Un conseiller ACES vous contacte sous 24 à 48 heures ouvrées.',
    group: 'Formulaires',
    label: 'Confirmation de devis',
    type: 'textarea',
  },
  // Pied de page
  {
    key: 'footer.about',
    value:
      "ACES Global Services accompagne particuliers, entreprises et institutions dans la conception, l’installation et la maintenance de leurs systèmes de sécurité, d’automatisation et d’énergie.",
    group: 'Pied de page',
    label: 'Texte du pied de page',
    type: 'textarea',
  },
  { key: 'legal.companyInfo', value: 'ACES Global Services — N°12 Rue Koudéka, Batignolles – La Frontière, Bangui, RCA.', group: 'Légal', label: 'Informations légales', type: 'textarea' },
];

export interface SeedHeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel: string;
  secondaryUrl: string;
  order: number;
  isActive: boolean;
}

export const heroSlides: SeedHeroSlide[] = [
  {
    id: 'hero-1',
    eyebrow: 'Sécurité électronique & automatisation',
    title: 'Votre sécurité, notre priorité !',
    subtitle:
      'Des solutions intelligentes pour protéger vos biens, vos équipes et vos activités, de l’étude à la maintenance.',
    image: '/assets/images/hero/hero-1.jpg',
    primaryLabel: 'Découvrir nos solutions',
    primaryUrl: '/nos-activites',
    secondaryLabel: 'Demander un devis',
    secondaryUrl: '/devis',
    order: 1,
    isActive: true,
  },
  {
    id: 'hero-2',
    eyebrow: 'Vidéosurveillance & contrôle d’accès',
    title: 'La technologie au service de votre tranquillité.',
    subtitle:
      'Caméras haute définition, enregistrement sécurisé et consultation à distance : gardez un œil sur l’essentiel.',
    image: '/assets/images/hero/hero-2.jpg',
    primaryLabel: 'Découvrir la vidéosurveillance',
    primaryUrl: '/nos-activites/videosurveillance',
    secondaryLabel: 'Demander un devis',
    secondaryUrl: '/devis',
    order: 2,
    isActive: true,
  },
  {
    id: 'hero-3',
    eyebrow: 'Énergie solaire',
    title: 'Une énergie plus intelligente, un avenir durable.',
    subtitle:
      'Panneaux solaires et stockage sur mesure pour produire votre électricité et travailler sans interruption.',
    image: '/assets/images/hero/hero-3.jpg',
    primaryLabel: 'Découvrir le solaire',
    primaryUrl: '/nos-activites/panneaux-solaires',
    secondaryLabel: 'Demander un devis',
    secondaryUrl: '/devis',
    order: 3,
    isActive: true,
  },
  {
    id: 'hero-4',
    eyebrow: 'Accès & périmètre',
    title: 'Sécurisez vos accès, maîtrisez vos installations.',
    subtitle:
      'Portails automatiques, clôtures électriques et interphonie : une protection cohérente, du portail au bureau.',
    image: '/assets/images/hero/hero-4.jpg',
    primaryLabel: 'Voir nos solutions d’accès',
    primaryUrl: '/nos-activites/portails-metalliques-automatiques',
    secondaryLabel: 'Demander un devis',
    secondaryUrl: '/devis',
    order: 4,
    isActive: true,
  },
];

export interface SeedPage {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  heroImage: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  status: 'PUBLISHED' | 'DRAFT';
  system: boolean;
}

export const pages: SeedPage[] = [
  {
    id: 'page-qui-sommes-nous',
    slug: 'qui-sommes-nous',
    title: 'Qui sommes-nous ?',
    subtitle:
      'Une équipe technique au service de la sécurité, de l’automatisation et de l’énergie.',
    heroImage: '/assets/images/about/entreprise.jpg',
    content: `
<p><strong>ACES Global Services</strong> est une entreprise spécialisée dans l’automatisation, la communication, l’énergie et la sécurité. Nous concevons, installons et maintenons des solutions techniques destinées à protéger les biens et les personnes, à fluidifier les accès et à garantir la continuité d’alimentation des équipements essentiels.</p>
<h2>Notre mission</h2>
<p>Mettre la technologie au service de la tranquillité de nos clients. Concrètement : comprendre un besoin, proposer une solution dimensionnée pour ce besoin — ni sous-équipée, ni surdimensionnée — puis l’installer proprement et l’accompagner dans le temps.</p>
<h2>Notre approche</h2>
<p>Chaque projet commence par une visite technique. Nous relevons les contraintes du site, discutons des usages réels et proposons une architecture claire, avec un devis détaillé. Cette méthode évite les mauvaises surprises : une caméra mal positionnée, une clôture sous-dimensionnée ou une installation solaire incapable de tenir la nuit.</p>
<h3>Nos domaines d’expertise</h3>
<ul>
<li>Sécurité périmétrique : clôtures électriques, portails automatiques, sas d’entrée.</li>
<li>Sécurité électronique : vidéosurveillance, alarme incendie, contrôle d’accès, reconnaissance faciale.</li>
<li>Communication et identification : interphonie, badges, gestion des identités.</li>
<li>Énergie : panneaux solaires, stockage, alimentation de secours.</li>
<li>Automatisation et suivi : automatismes, géolocalisation de flotte.</li>
</ul>
<h2>Nos valeurs</h2>
<h3>Fiabilité</h3>
<p>Un équipement de sécurité qui tombe en panne n’a aucune valeur. Nous privilégions des matériels éprouvés, une pose soignée et des contrôles réguliers.</p>
<h3>Transparence</h3>
<p>Devis détaillés, délais annoncés, explications accessibles. Nous préférons dire ce qui est réaliste plutôt que promettre l’impossible.</p>
<h3>Proximité</h3>
<p>Nos techniciens interviennent sur site, connaissent les contraintes locales et restent joignables après l’installation.</p>
<h2>Notre engagement client</h2>
<p>Conseil avant-vente, installation, mise en service, formation à l’usage, maintenance et assistance : nous accompagnons nos clients sur toute la durée de vie de leur installation.</p>`,
    seoTitle: 'Qui sommes-nous ? — ACES Global Services',
    seoDescription:
      'ACES Global Services : entreprise spécialisée en sécurité électronique, automatisation, communication et énergie solaire. Mission, valeurs et approche client.',
    status: 'PUBLISHED',
    system: true,
  },
  {
    id: 'page-mentions-legales',
    slug: 'mentions-legales',
    title: 'Mentions légales',
    subtitle: 'Informations légales relatives au site et à son éditeur.',
    heroImage: '/assets/images/about/supervision.jpg',
    content: `
<p>Les informations ci-dessous doivent être complétées et validées par ACES Global Services avant la mise en ligne définitive du site. Les champs entre crochets indiquent les éléments à confirmer.</p>
<h2>Éditeur du site</h2>
<p><strong>ACES Global Services</strong><br />
Adresse : N°12 Rue Koudéka, Batignolles – La Frontière, Bangui, République Centrafricaine<br />
Téléphone : +242 06 539 0297<br />
E-mail : aces.globalservices@gmail.com<br />
Forme juridique : [à compléter]<br />
Numéro d’immatriculation : [à compléter]<br />
Numéro fiscal : [à compléter]</p>
<h2>Responsable de la publication</h2>
<p>[Nom et fonction du responsable de la publication à compléter]</p>
<h2>Hébergement</h2>
<p>Ce site est hébergé par [nom de l’hébergeur, adresse, téléphone]. Une offre compatible avec Node.js et une base de données MySQL est requise.</p>
<h2>Propriété intellectuelle</h2>
<p>L’ensemble des contenus présents sur ce site (textes, visuels, logo, mise en page) est protégé. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable. Le logo et la charte graphique appartiennent à ACES Global Services.</p>
<p>Certaines photographies utilisées sur le site sont des images d’illustration et ne représentent pas nécessairement des installations réalisées par l’entreprise.</p>
<h2>Responsabilité</h2>
<p>Les informations publiées sont fournies à titre indicatif. ACES Global Services s’efforce de les maintenir à jour mais ne peut garantir l’exactitude permanente de l’ensemble des contenus. Les prestations font l’objet d’un devis et d’un contrat distincts.</p>
<h2>Droit applicable</h2>
<p>Le présent site est soumis au droit applicable en République Centrafricaine. En cas de litige, les tribunaux compétents sont ceux du siège de l’entreprise, sauf disposition légale contraire.</p>`,
    seoTitle: 'Mentions légales — ACES Global Services',
    seoDescription:
      'Mentions légales du site ACES Global Services : éditeur, responsable de publication, hébergement, propriété intellectuelle et responsabilité.',
    status: 'PUBLISHED',
    system: true,
  },
  {
    id: 'page-politique-confidentialite',
    slug: 'politique-de-confidentialite',
    title: 'Politique de confidentialité',
    subtitle: 'Comment nous collectons, utilisons et protégeons vos données.',
    heroImage: '/assets/images/about/technicien.jpg',
    content: `
<h2>Données collectées</h2>
<p>Les formulaires de contact et de demande de devis collectent uniquement les informations nécessaires au traitement de votre demande : nom, adresse e-mail, numéro de téléphone, ville, entreprise (facultative), prestation concernée, description de votre projet, budget indicatif et moyen de contact préféré.</p>
<h2>Finalité du traitement</h2>
<p>Ces données sont utilisées pour répondre à votre demande, établir un devis, assurer le suivi commercial et, le cas échéant, organiser une visite technique. Elles ne font l’objet d’aucune revente et ne sont pas utilisées à des fins publicitaires.</p>
<h2>Durée de conservation</h2>
<p>Les demandes de contact et de devis sont conservées pendant la durée nécessaire au suivi commercial, puis archivées ou supprimées. Vous pouvez demander leur suppression à tout moment.</p>
<h2>Cookies</h2>
<p>Le site public n’utilise pas de cookie publicitaire ni de traceur tiers. Des cookies strictement techniques peuvent être utilisés pour maintenir la session des administrateurs dans l’espace de gestion.</p>
<h2>Sécurité</h2>
<p>Les données sont stockées dans une base de données protégée, accessible uniquement aux personnes habilitées. Les mots de passe des administrateurs sont stockés sous forme hachée et les échanges avec l’espace d’administration sont protégés.</p>
<h2>Vos droits</h2>
<p>Vous pouvez demander l’accès, la rectification ou la suppression de vos données en écrivant à <strong>aces.globalservices@gmail.com</strong>. Nous répondons dans les meilleurs délais.</p>
<h2>Contact</h2>
<p>Pour toute question relative à cette politique : aces.globalservices@gmail.com — +242 06 539 0297.</p>`,
    seoTitle: 'Politique de confidentialité — ACES Global Services',
    seoDescription:
      'Politique de confidentialité du site ACES Global Services : données collectées, finalités, durée de conservation, cookies, sécurité et droits des personnes.',
    status: 'PUBLISHED',
    system: true,
  },
];
