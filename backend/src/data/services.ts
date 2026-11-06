/**
 * Contenus de référence des onze prestations ACES Global Services.
 * Ces textes sont rédigés pour être repris tels quels sur le site public
 * et restent modifiables depuis le back-office.
 */

export interface SeedService {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  shortDescription: string;
  description: string;
  icon: string;
  heroImage: string;
  coverImage: string;
  benefits: string[];
  features: { title: string; description: string }[];
  applications: string[];
  process: { title: string; description: string }[];
  equipment: string[];
  faqs: { question: string; answer: string }[];
  seoTitle: string;
  seoDescription: string;
  order: number;
  isPublished: boolean;
  images: { url: string; alt: string }[];
}

export const services: SeedService[] = [
  {
    id: 'svc-cloture-electrique',
    slug: 'cloture-electrique',
    title: 'Clôture électrique',
    tagline: 'Une barrière dissuasive, active jour et nuit',
    shortDescription:
      'Installation, entretien et réparation de clôtures électriques haute tension pour périmètres résidentiels, professionnels et industriels.',
    description: `
<p>La clôture électrique est la première ligne de défense d'un périmètre. Elle transforme un mur ou un grillage en une barrière active qui dissuade l'intrusion avant même que celle-ci ne soit tentée, puis alerte immédiatement en cas de contact ou de coupure.</p>
<h2>Un périmètre réellement protégé</h2>
<p>ACES Global Services Congo conçoit des clôtures électriques dimensionnées selon la longueur du périmètre, la nature du support (mur maçonné, grillage, poteaux métalliques) et le niveau de risque du site. Chaque installation est équipée d'une centrale électronique calibrée, de câbles isolés haute tension, d'isolateurs étanches et d'une signalétique normalisée.</p>
<h2>Dissuasion, détection, réaction</h2>
<p>La clôture ne se contente pas de repousser : elle détecte. Toute coupure de câble, court-circuit ou tentative de franchissement déclenche une alarme locale et, si le site est équipé d'un système de supervision, une remontée d'information sur le poste de contrôle ou le téléphone du responsable.</p>
<h3>Un entretien régulier, gage de fiabilité</h3>
<p>Une clôture électrique se vérifie : tension, état des isolateurs, végétation au contact, connexions et batteries de secours. Nos contrats d'entretien prévoient des passages programmés et une intervention rapide en cas de panne, pour que la protection ne s'interrompe jamais.</p>`,
    icon: 'zap',
    heroImage: '/assets/images/services/cloture-electrique.jpg',
    coverImage: '/assets/images/services/cloture-electrique.jpg',
    benefits: [
      'Dissuasion immédiate et visible des tentatives d’intrusion',
      'Détection des coupures, court-circuits et franchissements',
      'Alimentation sécurisée avec batterie de secours',
      'Signalétique et installation conformes aux règles de sécurité',
      'Entretien préventif et dépannage rapide',
    ],
    features: [
      {
        title: 'Centrale électronique calibrée',
        description:
          'Chaque zone est réglée en tension et en sensibilité selon la configuration du périmètre et la présence d’animaux.',
      },
      {
        title: 'Câblage haute tension étanche',
        description:
          'Câbles isolés, isolateurs renforcés et raccordements protégés contre l’humidité et les variations de température.',
      },
      {
        title: 'Remontée d’alarme',
        description:
          'Contact sec pour sirène, clignotant ou transmission vers une centrale d’alarme et un système de supervision.',
      },
      {
        title: 'Intégration aux autres systèmes',
        description:
          'Coordination avec la vidéosurveillance, l’éclairage périmétrique et le contrôle d’accès des portails.',
      },
    ],
    applications: [
      'Villas et résidences privées',
      'Immeubles d’habitation et résidences sécurisées',
      'Entrepôts et plateformes logistiques',
      'Bureaux, banques et agences',
      'Écoles et établissements de santé',
      'Sites industriels et dépôts de carburant',
    ],
    process: [
      { title: 'Visite technique', description: 'Relevé du périmètre, des supports et des points faibles existants.' },
      { title: 'Étude et chiffrage', description: 'Dimensionnement des zones, de la centrale et des accessoires.' },
      { title: 'Installation', description: 'Pose des supports, câblage, réglages et mise sous tension contrôlée.' },
      { title: 'Mise en service', description: 'Tests de déclenchement, formation des utilisateurs et remise du dossier technique.' },
    ],
    equipment: [
      'Centrales de clôture électrique multipolaires',
      'Isolateurs, tendeurs et fils inox ou galvanisé',
      'Supports et poteaux renforcés',
      'Sirènes et clignotants d’extérieur',
      'Panneaux de signalisation réglementaires',
      'Batteries de secours 12 V',
    ],
    faqs: [
      {
        question: 'Une clôture électrique est-elle dangereuse pour les personnes ?',
        answer:
          'Une installation correctement dimensionnée délivre des impulsions brèves et de faible énergie, conçues pour dissuader sans mettre en danger. Nous utilisons des centrales certifiées, posons systématiquement la signalétique réglementaire et respectons les règles d’installation en vigueur.',
      },
      {
        question: 'Quelle longueur de périmètre peut être protégée ?',
        answer:
          'Une centrale alimente généralement plusieurs centaines de mètres. Au-delà, nous découpons le site en zones avec plusieurs centrales synchronisées, ce qui facilite aussi la localisation des défauts.',
      },
      {
        question: 'Que se passe-t-il en cas de coupure de courant ?',
        answer:
          'La centrale est équipée d’une batterie de secours qui maintient la protection active pendant plusieurs heures. Un signal de défaut batterie peut être remonté au poste de supervision.',
      },
      {
        question: 'Proposez-vous l’entretien d’une installation existante ?',
        answer:
          'Oui. Nous intervenons sur des installations tierces pour le diagnostic, la remise en conformité, le remplacement de centrale ou le dépannage après sinistre.',
      },
      {
        question: 'La végétation peut-elle déclencher l’alarme ?',
        answer:
          'Oui, une branche au contact d’un fil provoque une fuite à la terre. Le contrat d’entretien comprend le contrôle du débroussaillage et le réglage de la sensibilité.',
      },
    ],
    seoTitle: 'Clôture électrique au Congo | Installation et entretien — ACES Global Services',
    seoDescription:
      'Installation, entretien et réparation de clôtures électriques pour villas, entreprises et sites industriels. Dissuasion, détection et maintenance par ACES Global Services Congo.',
    order: 1,
    isPublished: true,
    images: [
      { url: '/assets/images/services/cloture-electrique.jpg', alt: 'Clôture électrique installée sur un mur de périmètre' },
      { url: '/assets/images/services/cloture-electrique-2.jpg', alt: 'Fils haute tension et isolateurs d’une clôture électrique' },
      { url: '/assets/images/misc/cloture.jpg', alt: 'Périmètre protégé par une clôture dissuasive' },
    ],
  },
  {
    id: 'svc-videosurveillance',
    slug: 'videosurveillance',
    title: 'Vidéosurveillance',
    tagline: 'Voir, comprendre, réagir',
    shortDescription:
      'Caméras IP et analogiques, enregistrement local et contrôle à distance : une surveillance continue de vos espaces sensibles.',
    description: `
<p>La vidéosurveillance ne sert pas seulement à enregistrer : elle permet de comprendre ce qui se passe, de vérifier une alarme en quelques secondes et de fournir des images exploitables en cas d'incident. Encore faut-il que le système soit correctement étudié.</p>
<h2>Une étude avant les caméras</h2>
<p>Nous commençons par les angles : entrées, cours, couloirs, parkings, zones de stockage, caisses, issues de secours. Le nombre de caméras, leur résolution, leur focale et leur hauteur de pose découlent de cette analyse. Une caméra mal placée reste chère, même lorsqu'elle est performante.</p>
<h2>Enregistrement et consultation à distance</h2>
<p>Les images sont enregistrées sur un enregistreur NVR ou DVR dimensionné selon le nombre de flux et la durée de conservation souhaitée. Vous pouvez consulter en direct et relire les séquences depuis un smartphone, une tablette ou un poste fixe, où que vous soyez.</p>
<h3>Alimentation et continuité de service</h3>
<p>Sur les sites exposés aux coupures, nous associons les caméras à une alimentation solaire ou à un onduleur afin que la surveillance reste opérationnelle. Les équipements sont protégés contre les surtensions et les intrusions dans les armoires techniques.</p>`,
    icon: 'cctv',
    heroImage: '/assets/images/services/videosurveillance.jpg',
    coverImage: '/assets/images/services/videosurveillance.jpg',
    benefits: [
      'Vision nocturne et images nettes de jour comme de nuit',
      'Consultation en direct depuis smartphone, tablette ou PC',
      'Enregistrement continu ou déclenché sur détection',
      'Notifications en cas de mouvement dans une zone sensible',
      'Architecture évolutive, jusqu’à plusieurs dizaines de caméras',
    ],
    features: [
      {
        title: 'Caméras 2 à 8 Mégapixels',
        description:
          'Dômes, bullets et PTZ selon l’usage, avec vision couleur de nuit, détection de mouvement et étanchéité IP66/IP67.',
      },
      {
        title: 'Enregistreur dimensionné',
        description:
          'NVR/DVR avec disques de surveillance, calcul de la durée de conservation et configuration des règles d’enregistrement.',
      },
      {
        title: 'Accès mobile sécurisé',
        description:
          'Application mobile, comptes utilisateurs distincts et consultation chiffrée, sans exposition du flux sur internet.',
      },
      {
        title: 'Alimentation autonome',
        description:
          'Onduleur ou kit solaire pour maintenir la surveillance pendant les coupures de courant.',
      },
    ],
    applications: [
      'Villas, résidences et immeubles',
      'Commerces, boutiques et restaurants',
      'Bureaux, banques et institutions',
      'Entrepôts et zones de chargement',
      'Parkings et cours de passage',
      'Chantiers et sites temporaires',
    ],
    process: [
      { title: 'Audit des zones', description: 'Identification des points critiques et des angles morts.' },
      { title: 'Plan de pose', description: 'Choix des caméras, des hauteurs et du tracé des câbles.' },
      { title: 'Installation', description: 'Pose, câblage structuré, configuration de l’enregistreur et des accès.' },
      { title: 'Recette et formation', description: 'Vérification des images, des alertes et formation à la consultation.' },
    ],
    equipment: [
      'Caméras IP et analogiques haute définition',
      'Caméras dômes, bullets et motorisées PTZ',
      'Enregistreurs NVR / DVR',
      'Disques durs de surveillance',
      'Commutateurs PoE et câblage structuré',
      'Onduleurs et alimentations secourues',
    ],
    faqs: [
      {
        question: 'Combien de caméras faut-il pour une villa ?',
        answer:
          'Pour une villa standard, 4 à 8 caméras couvrent généralement l’entrée, la cour, le portail et les façades. Le nombre exact dépend de la surface, des recoins et du niveau de risque.',
      },
      {
        question: 'Pendant combien de temps les images sont-elles conservées ?',
        answer:
          'Entre 15 et 60 jours selon la capacité de stockage, le nombre de caméras et la résolution. Nous calculons ce paramètre avec vous avant l’installation.',
      },
      {
        question: 'Puis-je voir mes caméras depuis l’étranger ?',
        answer:
          'Oui, via l’application mobile sécurisée. Chaque utilisateur dispose de son propre compte et de droits adaptés.',
      },
      {
        question: 'La vidéosurveillance fonctionne-t-elle la nuit ?',
        answer:
          'Les caméras que nous installons disposent d’une vision nocturne infrarouge ou couleur basse lumière, avec une portée adaptée à l’emplacement.',
      },
      {
        question: 'Peut-on relier la vidéosurveillance à une alarme ?',
        answer:
          'Oui. Une alarme intrusion, une clôture électrique ou un détecteur peut déclencher un enregistrement renforcé et une notification avec images.',
      },
    ],
    seoTitle: 'Installation de vidéosurveillance au Congo | Caméras IP — ACES Global Services',
    seoDescription:
      'Installation de caméras de surveillance, NVR et accès mobile pour maisons, commerces et entreprises. Étude, pose, configuration et maintenance par ACES Global Services Congo.',
    order: 2,
    isPublished: true,
    images: [
      { url: '/assets/images/services/videosurveillance.jpg', alt: 'Caméra de surveillance installée en façade' },
      { url: '/assets/images/services/videosurveillance-2.jpg', alt: 'Technicien installant une caméra sur un bâtiment' },
      { url: '/assets/images/about/supervision.jpg', alt: 'Poste de supervision avec écrans de vidéosurveillance' },
    ],
  },
  {
    id: 'svc-panneaux-solaires',
    slug: 'panneaux-solaires',
    title: 'Panneaux solaires',
    tagline: 'Une énergie propre, autonome et maîtrisée',
    shortDescription:
      'Dimensionnement, installation et maintenance de systèmes photovoltaïques avec stockage pour maisons, bureaux et sites isolés.',
    description: `
<p>Les coupures de courant et la hausse des coûts de l'énergie pèsent directement sur l'activité des entreprises et le confort des familles. Une installation solaire correctement dimensionnée apporte une réponse durable : elle produit, stocke et restitue l'électricité au moment où vous en avez besoin.</p>
<h2>Dimensionner avant d'acheter</h2>
<p>Un kit solaire ne se choisit pas au hasard. Nous relevons vos consommations, identifions les équipements prioritaires (réfrigération, éclairage, informatique, caméras, portail), puis déterminons la puissance des panneaux, la capacité des batteries et la taille de l'onduleur.</p>
<h2>Autonomie et continuité</h2>
<p>Selon votre besoin, nous installons une installation autonome avec batteries, une installation avec appoint du réseau, ou un système hybride qui bascule automatiquement. La priorité est la continuité : éclairage, sécurité et équipements essentiels restent alimentés.</p>
<h3>Un suivi dans la durée</h3>
<p>Les panneaux, onduleurs et batteries demandent un contrôle régulier : nettoyage, serrage des connexions, vérification de la production et de l'état de charge. Nos contrats de maintenance incluent ces passages et le remplacement des éléments usés.</p>`,
    icon: 'sun',
    heroImage: '/assets/images/services/panneaux-solaires.jpg',
    coverImage: '/assets/images/services/panneaux-solaires.jpg',
    benefits: [
      'Réduction immédiate de la facture d’électricité',
      'Continuité d’alimentation pendant les coupures',
      'Énergie silencieuse et sans carburant',
      'Durée de vie de 20 à 25 ans pour les panneaux',
      'Solution adaptée aux sites isolés',
    ],
    features: [
      {
        title: 'Étude de consommation',
        description:
          'Bilan de puissance jour et nuit, identification des usages prioritaires et calcul du besoin de stockage.',
      },
      {
        title: 'Panneaux et onduleurs de marque',
        description:
          'Modules monocristallins, onduleurs hybrides et régulateurs MPPT pour un rendement optimal.',
      },
      {
        title: 'Stockage sur mesure',
        description:
          'Batteries lithium ou plomb selon le budget, avec coffret de protection et ventilation.',
      },
      {
        title: 'Pose soignée',
        description:
          'Structures de fixation, étanchéité de toiture, câblage protégé et mise à la terre.',
      },
    ],
    applications: [
      'Maisons et villas',
      'Bureaux et commerces',
      'Bâtiments de sécurité (caméras, portails, alarmes)',
      'Sites isolés et zones rurales',
      'Kits de secours pour équipements critiques',
      'Éclairage extérieur et périmétrique',
    ],
    process: [
      { title: 'Bilan énergétique', description: 'Relevé des équipements, des puissances et des habitudes de consommation.' },
      { title: 'Étude technique', description: 'Choix des panneaux, de l’onduleur, des batteries et des protections.' },
      { title: 'Installation', description: 'Pose des modules, câblage, coffrets et raccordement.' },
      { title: 'Mise en service', description: 'Tests de production, réglages et explication des indicateurs de suivi.' },
    ],
    equipment: [
      'Panneaux photovoltaïques monocristallins',
      'Onduleurs hybrides et régulateurs MPPT',
      'Batteries lithium ou plomb étanches',
      'Coffrets de protection DC/AC',
      'Structures de fixation toiture et sol',
      'Compteurs et moniteurs de production',
    ],
    faqs: [
      {
        question: 'Quel budget prévoir pour une installation solaire ?',
        answer:
          'Le budget dépend de la puissance et du stockage. Une petite installation de secours pour éclairage et sécurité n’a pas le même coût qu’une installation autonome complète. Nous établissons un devis détaillé après le bilan énergétique.',
      },
      {
        question: 'Combien de temps durent les batteries ?',
        answer:
          'Une batterie lithium dure généralement 6 à 10 ans, une batterie plomb 3 à 5 ans, selon la profondeur de décharge et les conditions d’installation.',
      },
      {
        question: 'Les panneaux fonctionnent-ils par temps couvert ?',
        answer:
          'Ils produisent moins, mais continuent de produire. Le dimensionnement tient compte de l’ensoleillement moyen de votre région.',
      },
      {
        question: 'L’installation peut-elle alimenter la climatisation ?',
        answer:
          'Oui, si la puissance est calculée en conséquence. La climatisation est l’un des postes les plus gourmands : elle est intégrée dès l’étude.',
      },
      {
        question: 'Proposez-vous l’entretien des installations ?',
        answer:
          'Oui : nettoyage des modules, contrôle des connexions et des protections, vérification de la production et remplacement des pièces d’usure.',
      },
    ],
    seoTitle: 'Panneaux solaires au Congo | Installation photovoltaïque — ACES Global Services',
    seoDescription:
      'Installation de panneaux solaires et de systèmes photovoltaïques avec batteries pour maisons, bureaux et sites isolés. Étude, pose et maintenance par ACES Global Services Congo.',
    order: 3,
    isPublished: true,
    images: [
      { url: '/assets/images/services/panneaux-solaires.jpg', alt: 'Panneaux solaires installés sur une toiture' },
      { url: '/assets/images/services/panneaux-solaires-2.jpg', alt: 'Onduleurs et batteries d’une installation solaire' },
      { url: '/assets/images/services/panneaux-solaires-3.jpg', alt: 'Technicien raccordant un onduleur solaire' },
    ],
  },
  {
    id: 'svc-controle-acces',
    slug: 'controle-acces',
    title: 'Contrôle d’accès',
    tagline: 'Seules les personnes autorisées entrent',
    shortDescription:
      'Gestion des accès par badge, code, empreinte ou carte RFID pour bureaux, résidences et sites sensibles.',
    description: `
<p>Une porte fermée n'est pas une porte contrôlée. Le contrôle d'accès consiste à décider qui entre, où, quand et pendant combien de temps — puis à conserver la trace de chaque passage.</p>
<h2>Un accès par personne, par zone, par horaire</h2>
<p>Nous installons des lecteurs de badges, claviers à code, lecteurs biométriques et serrures connectées, reliés à un contrôleur qui applique vos règles. Un technicien accède à la salle technique, un visiteur à l'accueil uniquement, un prestataire à des horaires définis.</p>
<h2>Traçabilité et gestion centralisée</h2>
<p>Chaque passage est horodaté. En cas d'incident, vous pouvez consulter l'historique, désactiver un badge perdu en quelques secondes et générer des rapports de présence. La gestion se fait depuis un logiciel ou une interface web, sans intervention technique.</p>
<h3>Intégration avec vos autres équipements</h3>
<p>Le contrôle d'accès se coordonne avec la vidéosurveillance, l'interphonie, le portail automatique et l'alarme incendie : à l'ouverture d'une porte, une caméra peut enregistrer et l'éclairage s'allumer automatiquement.</p>`,
    icon: 'key-round',
    heroImage: '/assets/images/services/controle-acces.jpg',
    coverImage: '/assets/images/services/controle-acces.jpg',
    benefits: [
      'Fin des clés perdues ou dupliquées',
      'Droits d’accès par zone et par plage horaire',
      'Historique horodaté de tous les passages',
      'Désactivation immédiate d’un badge égaré',
      'Intégration vidéosurveillance et interphonie',
    ],
    features: [
      {
        title: 'Multiples modes d’identification',
        description:
          'Badge RFID, code PIN, empreinte digitale, reconnaissance faciale ou combinaison de deux facteurs.',
      },
      {
        title: 'Contrôleurs et serrures fiables',
        description:
          'Contrôleurs autonomes ou connectés, gâches électriques, ventouses et serrures motorisées.',
      },
      {
        title: 'Logiciel de gestion',
        description:
          'Création de badges, affectation des droits, consultation des passages et export des présences.',
      },
      {
        title: 'Fonctionnement en cas de coupure',
        description:
          'Batteries de secours et mode dégradé configurable pour ne jamais bloquer les issues de secours.',
      },
    ],
    applications: [
      'Bureaux et open spaces',
      'Immeubles d’habitation et résidences sécurisées',
      'Salles techniques et locaux serveurs',
      'Banques, cliniques et pharmacies',
      'Entrepôts et zones de stockage',
      'Établissements scolaires',
    ],
    process: [
      { title: 'Analyse des circulations', description: 'Relevé des portes, des flux et des zones à protéger.' },
      { title: 'Définition des règles', description: 'Qui accède à quoi, selon quels horaires et quelles contraintes.' },
      { title: 'Installation', description: 'Pose des lecteurs, contrôleurs, serrures et alimentations secourues.' },
      { title: 'Paramétrage et formation', description: 'Enrôlement des utilisateurs, édition des badges et formation des gestionnaires.' },
    ],
    equipment: [
      'Lecteurs de badges RFID et claviers à code',
      'Lecteurs biométriques d’empreintes',
      'Contrôleurs d’accès 1, 2 ou 4 portes',
      'Gâches électriques et ventouses magnétiques',
      'Boutons de sortie et bris de glace',
      'Badges, porte-clés et cartes imprimées',
    ],
    faqs: [
      {
        question: 'Peut-on garder nos serrures actuelles ?',
        answer:
          'Dans de nombreux cas, oui : un lecteur et une gâche électrique peuvent être adaptés à une porte existante. Nous vérifions la compatibilité lors de la visite technique.',
      },
      {
        question: 'Que se passe-t-il si le courant est coupé ?',
        answer:
          'Les contrôleurs et serrures sont alimentés par une batterie de secours. Les issues de secours restent toujours franchissables dans le sens de l’évacuation.',
      },
      {
        question: 'Combien de badges peut-on gérer ?',
        answer:
          'Les contrôleurs que nous installons gèrent de quelques dizaines à plusieurs milliers d’utilisateurs, avec une gestion centralisée par logiciel.',
      },
      {
        question: 'La biométrie est-elle fiable ?',
        answer:
          'Oui, avec un lecteur de qualité et un enrôlement soigné. Nous recommandons souvent une double identification (badge + empreinte) pour les zones très sensibles.',
      },
      {
        question: 'Peut-on suivre les présences du personnel ?',
        answer:
          'Oui, le logiciel permet d’exporter les présences et les retards, ce qui simplifie le suivi des horaires.',
      },
    ],
    seoTitle: 'Contrôle d’accès au Congo | Badges, biométrie, codes — ACES Global Services',
    seoDescription:
      'Installation de systèmes de contrôle d’accès par badge, code, empreinte ou RFID pour entreprises et résidences. Gestion centralisée et traçabilité des passages.',
    order: 4,
    isPublished: true,
    images: [
      { url: '/assets/images/services/controle-acces.jpg', alt: 'Lecteur biométrique installé à l’entrée d’un bureau' },
      { url: '/assets/images/services/controle-acces-2.jpg', alt: 'Clavier à code et lecteur de badge' },
      { url: '/assets/images/services/controle-acces-3.jpg', alt: 'Portique de contrôle d’accès en entreprise' },
    ],
  },
  {
    id: 'svc-interphone-videophone',
    slug: 'interphone-videophone',
    title: 'Interphone et vidéophone',
    tagline: 'Parlez à votre visiteur avant d’ouvrir',
    shortDescription:
      'Interphones audio et vidéophones pour maisons, immeubles et bureaux, avec ouverture à distance et application mobile.',
    description: `
<p>Avant d'ouvrir une porte, il faut savoir qui se présente. L'interphone et le vidéophone permettent de voir, d'écouter et de dialoguer avec le visiteur, puis de décider d'ouvrir — sans se déplacer et sans exposer l'entrée.</p>
<h2>Du poste filaire au vidéophone mobile</h2>
<p>Nous installons des solutions filaires classiques, des systèmes IP et des vidéophones connectés permettant de répondre depuis un smartphone, même à distance. Pour les immeubles, la platine de rue multibouton dessert chaque appartement avec un moniteur dédié.</p>
<h2>Ouverture et sécurité</h2>
<p>La gâche électrique ou la serrure motorisée s'actionne depuis le moniteur. Les images de la caméra d'entrée peuvent être enregistrées, et l'ensemble s'intègre au contrôle d'accès et à la vidéosurveillance du bâtiment.</p>
<h3>Une installation discrète et durable</h3>
<p>Les platines extérieures sont étanches et résistantes au vandalisme. Le câblage est repéré et protégé, et nous choisissons des équipements pour lesquels les pièces de rechange restent disponibles.</p>`,
    icon: 'phone-call',
    heroImage: '/assets/images/services/interphone.jpg',
    coverImage: '/assets/images/services/interphone.jpg',
    benefits: [
      'Identification visuelle avant ouverture',
      'Réponse depuis un moniteur ou un smartphone',
      'Ouverture à distance sécurisée',
      'Solution adaptée aux immeubles multi-appartements',
      'Installation étanche et résistante',
    ],
    features: [
      {
        title: 'Vidéo et audio bidirectionnels',
        description:
          'Image couleur de jour, vision nocturne, audio clair même en milieu bruyant.',
      },
      {
        title: 'Réponse sur mobile',
        description:
          'Recevez l’appel et ouvrez l’accès depuis votre téléphone, où que vous soyez.',
      },
      {
        title: 'Platines multi-utilisateurs',
        description:
          'Jusqu’à plusieurs dizaines de boutons pour les immeubles et les résidences.',
      },
      {
        title: 'Intégration portail et gâche',
        description:
          'Commande d’ouverture de porte ou de portail automatique depuis le moniteur.',
      },
    ],
    applications: [
      'Villas et maisons individuelles',
      'Immeubles d’habitation',
      'Bureaux et cabinets',
      'Cliniques et pharmacies',
      'Résidences sécurisées',
      'Établissements scolaires',
    ],
    process: [
      { title: 'Visite technique', description: 'Vérification des gaines, de l’alimentation et des distances de câblage.' },
      { title: 'Choix du système', description: 'Filaire, IP ou connecté, selon le nombre de postes et le budget.' },
      { title: 'Installation', description: 'Pose de la platine de rue, des moniteurs et des serrures.' },
      { title: 'Réglages', description: 'Volume, image, sonnerie et test d’ouverture.' },
    ],
    equipment: [
      'Platines de rue audio et vidéo',
      'Moniteurs couleur intérieurs',
      'Vidéophones connectés Wi-Fi',
      'Gâches électriques et serrures motorisées',
      'Alimentations et boîtiers de raccordement',
      'Câbles et connectique étanche',
    ],
    faqs: [
      {
        question: 'Peut-on installer un vidéophone sans travaux importants ?',
        answer:
          'Souvent, oui : les solutions IP et sans fil limitent le câblage. Une visite technique permet de valider la solution la moins invasive.',
      },
      {
        question: 'Puis-je répondre depuis mon téléphone ?',
        answer:
          'Oui, avec un vidéophone connecté. Vous recevez la notification d’appel, voyez le visiteur et pouvez ouvrir l’accès à distance.',
      },
      {
        question: 'Combien d’appartements peuvent être desservis ?',
        answer:
          'Les platines que nous installons desservent de 2 à plusieurs dizaines de logements, avec un moniteur par appartement.',
      },
      {
        question: 'Le système fonctionne-t-il en cas de coupure ?',
        answer:
          'Les modèles équipés d’une alimentation secourue continuent de fonctionner plusieurs heures après une coupure.',
      },
      {
        question: 'Peut-on ouvrir un portail automatique depuis le moniteur ?',
        answer:
          'Oui, un contact d’ouverture peut être raccordé au portail ou à la gâche de la porte piétonne.',
      },
    ],
    seoTitle: 'Interphone et vidéophone au Congo | Installation — ACES Global Services',
    seoDescription:
      'Installation d’interphones et de vidéophones pour maisons, immeubles et bureaux. Réponse sur mobile, ouverture à distance et intégration au portail automatique.',
    order: 5,
    isPublished: true,
    images: [
      { url: '/assets/images/services/interphone.jpg', alt: 'Vidéophone installé à l’entrée d’un immeuble' },
      { url: '/assets/images/services/interphone-2.jpg', alt: 'Moniteur vidéophone couleur intérieur' },
    ],
  },
  {
    id: 'svc-portails-automatiques',
    slug: 'portails-metalliques-automatiques',
    title: 'Portails métalliques automatiques',
    tagline: 'L’accès véhicule, en toute fluidité',
    shortDescription:
      'Conception, fabrication et motorisation de portails battants et coulissants, avec commande à distance et sécurité anti-écrasement.',
    description: `
<p>Le portail est le point de passage quotidien de votre véhicule, et l'une des portes d'entrée les plus visibles de votre propriété. Il doit être solide, esthétique, et s'ouvrir sans effort ni risque.</p>
<h2>Fabrication sur mesure</h2>
<p>Nous réalisons des portails coulissants et battants en profilés métalliques, adaptés à la largeur de votre ouverture, au style de votre façade et au passage des véhicules. Les finitions sont traitées contre la corrosion : primaire antirouille et peinture de finition.</p>
<h2>Motorisation et sécurité</h2>
<p>Le moteur est choisi selon le poids et la fréquence d'utilisation. Nous installons systématiquement les dispositifs de sécurité : cellules photoélectriques, feux clignotants, arrêt d'urgence, détection d'obstacle et déverrouillage manuel en cas de coupure.</p>
<h3>Commandes et intégration</h3>
<p>Ouverture par télécommande, bouton poussoir, badge, interphone ou application mobile. Le portail peut également s'intégrer à la vidéosurveillance et au contrôle d'accès du site.</p>`,
    icon: 'door-open',
    heroImage: '/assets/images/services/portails-automatiques.jpg',
    coverImage: '/assets/images/services/portails-automatiques.jpg',
    benefits: [
      'Ouverture sans descendre du véhicule',
      'Structure métallique durable et traitée anticorrosion',
      'Sécurité anti-écrasement conforme',
      'Déverrouillage manuel en cas de panne',
      'Design adapté à votre façade',
    ],
    features: [
      {
        title: 'Portails coulissants et battants',
        description:
          'Fabrication sur mesure en fonction de la largeur, du poids et du style souhaité.',
      },
      {
        title: 'Motorisation dimensionnée',
        description:
          'Moteurs à bras, enterrés ou coulissants, sélectionnés selon le poids et l’intensité d’usage.',
      },
      {
        title: 'Dispositifs de sécurité',
        description:
          'Cellules photoélectriques, clignotant, détection d’obstacle et arrêt d’urgence.',
      },
      {
        title: 'Commandes multiples',
        description:
          'Télécommandes, badge, interphone, application mobile et commande filaire.',
      },
    ],
    applications: [
      'Villas et résidences',
      'Immeubles et copropriétés',
      'Entreprises et entrepôts',
      'Garages et parkings privés',
      'Établissements recevant du public',
    ],
    process: [
      { title: 'Relevé de l’ouverture', description: 'Mesures, sens de coulissement et contraintes du sol.' },
      { title: 'Fabrication', description: 'Assemblage en atelier, traitement anticorrosion et peinture.' },
      { title: 'Pose et motorisation', description: 'Scellement, réglage du moteur et installation des sécurités.' },
      { title: 'Mise en service', description: 'Tests complets, réglage des fins de course et remise des télécommandes.' },
    ],
    equipment: [
      'Portails coulissants et battants sur mesure',
      'Moteurs et automatismes',
      'Cellules photoélectriques et feux clignotants',
      'Télécommandes et récepteurs',
      'Serrures et verrous électriques',
      'Boutons d’ouverture et claviers',
    ],
    faqs: [
      {
        question: 'Quel type de portail choisir : coulissant ou battant ?',
        answer:
          'Le coulissant est idéal lorsque la cour offre de l’espace latéral ; le battant convient aux ouvertures plus étroites avec un débattement libre. Nous dimensionnons le moteur en conséquence.',
      },
      {
        question: 'Que se passe-t-il lors d’une coupure de courant ?',
        answer:
          'Un déverrouillage à clé permet d’ouvrir le portail manuellement. Une batterie de secours peut être ajoutée pour maintenir plusieurs cycles d’ouverture.',
      },
      {
        question: 'Peut-on automatiser un portail existant ?',
        answer:
          'Oui, après vérification de la structure, des gonds ou de la piste de coulissement. La motorisation seule suffit souvent à moderniser un portail en bon état.',
      },
      {
        question: 'Combien de temps prend une fabrication ?',
        answer:
          'Une fois les mesures validées, comptez généralement une à trois semaines selon le modèle et les finitions demandées.',
      },
      {
        question: 'Proposez-vous la réparation de moteurs ?',
        answer:
          'Oui : diagnostic, remplacement de cartes, réglages et remplacement du moteur lorsque la réparation n’est plus pertinente.',
      },
    ],
    seoTitle: 'Portails automatiques au Congo | Fabrication et motorisation — ACES Global Services',
    seoDescription:
      'Fabrication sur mesure et motorisation de portails métalliques coulissants et battants. Sécurité anti-écrasement, télécommandes et intégration au contrôle d’accès.',
    order: 6,
    isPublished: true,
    images: [
      { url: '/assets/images/services/portails-automatiques.jpg', alt: 'Portail automatique coulissant d’une propriété' },
      { url: '/assets/images/services/portails-automatiques-2.jpg', alt: 'Portail métallique motorisé à double battant' },
      { url: '/assets/images/projects/projet-5.jpg', alt: 'Portail métallique installé à l’entrée d’une résidence' },
    ],
  },
  {
    id: 'svc-alarme-incendie',
    slug: 'alarme-incendie',
    title: 'Alarme incendie',
    tagline: 'Détecter dans les premières secondes',
    shortDescription:
      'Systèmes de détection et d’alarme incendie : détecteurs de fumée, centrale, déclencheurs manuels et sirènes pour bâtiments professionnels.',
    description: `
<p>Un incendie se maîtrise dans les premières minutes. Un système de détection et d'alarme correctement installé permet d'évacuer à temps, de préserver les biens et de limiter la propagation — à condition d'être dimensionné et entretenu.</p>
<h2>Détection adaptée à chaque espace</h2>
<p>Détecteurs optiques de fumée dans les circulations et bureaux, détecteurs thermiques dans les cuisines et locaux techniques, détecteurs combinés dans les zones à risque. Chaque zone est pensée pour éviter les fausses alarmes tout en garantissant une couverture complète.</p>
<h2>Alarme et évacuation</h2>
<p>La centrale de détection supervise les boucles et déclenche sirènes et flashs lumineux. Les déclencheurs manuels sont placés sur les cheminements d'évacuation, à hauteur réglementaire. Pour les sites sensibles, la détection peut être couplée au désenfumage, au déverrouillage des issues et au report d'alarme.</p>
<h3>Maintenance et essais</h3>
<p>Nous assurons les essais périodiques, le remplacement des détecteurs, le contrôle des batteries de la centrale et la mise à jour du registre de sécurité.</p>`,
    icon: 'flame',
    heroImage: '/assets/images/services/alarme-incendie.jpg',
    coverImage: '/assets/images/services/alarme-incendie.jpg',
    benefits: [
      'Détection précoce de fumée et de chaleur',
      'Évacuation rapide et sécurisée',
      'Zonage clair pour localiser l’origine du sinistre',
      'Réduction des fausses alarmes',
      'Maintenance et essais périodiques documentés',
    ],
    features: [
      {
        title: 'Centrale de détection adressable',
        description:
          'Supervision par zone, identification du détecteur déclenché et historique des alarmes.',
      },
      {
        title: 'Détecteurs adaptés',
        description:
          'Optiques, thermiques, combinés, linéaires ou détection par aspiration selon les locaux.',
      },
      {
        title: 'Alarme perceptible',
        description:
          'Sirènes et flashs conformes, avec niveaux sonores vérifiés dans chaque zone.',
      },
      {
        title: 'Report et intégration',
        description:
          'Report d’alarme vers un poste de garde, couplage au désenfumage et aux issues de secours.',
      },
    ],
    applications: [
      'Immeubles de bureaux',
      'Hôtels et résidences',
      'Commerces et supermarchés',
      'Entrepôts et zones de stockage',
      'Écoles et universités',
      'Cliniques et établissements de santé',
    ],
    process: [
      { title: 'Étude des locaux', description: 'Relevé des surfaces, des activités et des risques spécifiques.' },
      { title: 'Conception du zonage', description: 'Placement des détecteurs, des déclencheurs et des sirènes.' },
      { title: 'Installation', description: 'Câblage, pose des équipements et raccordement de la centrale.' },
      { title: 'Essais et formation', description: 'Test de chaque zone, consignes d’évacuation et formation du personnel.' },
    ],
    equipment: [
      'Centrales de détection incendie',
      'Détecteurs optiques de fumée',
      'Détecteurs thermiques et combinés',
      'Déclencheurs manuels et sirènes',
      'Flashs et répétiteurs',
      'Batteries et câbles résistants au feu',
    ],
    faqs: [
      {
        question: 'Un système d’alarme incendie est-il obligatoire ?',
        answer:
          'Selon la nature et la taille du bâtiment, la réglementation locale peut imposer un système de détection ou d’alarme. Nous vous accompagnons dans l’analyse de votre situation avec votre bureau de contrôle.',
      },
      {
        question: 'Comment éviter les fausses alarmes ?',
        answer:
          'Par le choix des détecteurs (thermique en cuisine, optique en bureau), la propreté des locaux et l’entretien régulier. Une alarme qui se déclenche sans raison finit toujours par être ignorée : c’est le vrai danger.',
      },
      {
        question: 'Faut-il une alimentation de secours ?',
        answer:
          'Oui, la centrale et les sirènes sont alimentées par une batterie qui garantit plusieurs heures de fonctionnement en cas de coupure.',
      },
      {
        question: 'Proposez-vous des extincteurs ?',
        answer:
          'Nous pouvons fournir des extincteurs adaptés aux risques de votre site et assurer leur vérification annuelle, en complément du système de détection.',
      },
      {
        question: 'À quelle fréquence faut-il tester le système ?',
        answer:
          'Les essais fonctionnels sont généralement réalisés au moins une fois par an, avec des contrôles visuels plus fréquents. Nous adaptons le contrat à votre usage.',
      },
    ],
    seoTitle: 'Alarme incendie au Congo | Détection et évacuation — ACES Global Services',
    seoDescription:
      'Installation de systèmes de détection et d’alarme incendie : centrales, détecteurs de fumée, déclencheurs manuels et sirènes. Maintenance et essais périodiques.',
    order: 7,
    isPublished: true,
    images: [
      { url: '/assets/images/services/alarme-incendie.jpg', alt: 'Test d’un détecteur de fumée installé au plafond' },
      { url: '/assets/images/services/alarme-incendie-3.jpg', alt: 'Centrale de détection incendie' },
    ],
  },
  {
    id: 'svc-reconnaissance-faciale',
    slug: 'reconnaissance-faciale',
    title: 'Reconnaissance faciale',
    tagline: 'L’identification sans contact',
    shortDescription:
      'Terminaux de reconnaissance faciale pour un accès rapide, hygiénique et traçable aux zones sensibles.',
    description: `
<p>La reconnaissance faciale identifie une personne à partir de son visage, sans badge, sans contact et sans clé. Elle simplifie le passage tout en renforçant le contrôle des zones sensibles.</p>
<h2>Rapidité et hygiène</h2>
<p>Quelques dixièmes de seconde suffisent pour reconnaître un visage enregistré. Aucun contact avec un lecteur, aucun badge à sortir : un avantage réel dans les environnements où l'hygiène et la fluidité comptent, comme les cliniques, les laboratoires et les sièges sociaux.</p>
<h2>Fiabilité et conditions de pose</h2>
<p>La qualité du résultat dépend de l'éclairage, de l'angle et de la position du terminal. Nous étudions ces éléments et privilégions les terminaux à détection de vivacité, capables de distinguer un visage réel d'une photographie.</p>
<h3>Données personnelles : un usage encadré</h3>
<p>Les gabarits faciaux sont des données sensibles. Nous vous accompagnons pour informer les personnes concernées, limiter la conservation des données et restreindre les accès à l'historique, conformément au cadre applicable.</p>`,
    icon: 'scan-face',
    heroImage: '/assets/images/services/reconnaissance-faciale.jpg',
    coverImage: '/assets/images/services/reconnaissance-faciale.jpg',
    benefits: [
      'Passage sans contact, en moins d’une seconde',
      'Impossible de prêter son visage comme un badge',
      'Historique des identifications',
      'Solution hygiénique et rapide',
      'Combinaison possible avec badge ou code',
    ],
    features: [
      {
        title: 'Terminaux à détection de vivacité',
        description:
          'Reconnaissance en conditions réelles, avec rejet des photographies et des masques plats.',
      },
      {
        title: 'Enrôlement guidé',
        description:
          'Capture de plusieurs angles pour chaque personne, avec contrôle qualité.',
      },
      {
        title: 'Contrôle des accès intégré',
        description:
          'Ouverture de porte, de tourniquet ou de portail, avec gestion des horaires.',
      },
      {
        title: 'Mesure de température (option)',
        description:
          'Terminaux hybrides pour les sites nécessitant un contrôle sanitaire à l’entrée.',
      },
    ],
    applications: [
      'Sièges sociaux et administrations',
      'Sites industriels et zones sensibles',
      'Cliniques et laboratoires',
      'Établissements scolaires',
      'Résidences haut de gamme',
      'Zones de chantier et bases-vie',
    ],
    process: [
      { title: 'Analyse du besoin', description: 'Zones concernées, volumétrie des passages et contraintes d’hygiène.' },
      { title: 'Étude de pose', description: 'Hauteur, éclairage, sens de passage et protection contre le vandalisme.' },
      { title: 'Installation', description: 'Pose des terminaux, raccordement du contrôle d’accès et enrôlement des personnes.' },
      { title: 'Paramétrage', description: 'Seuils de reconnaissance, droits d’accès et politique de conservation.' },
    ],
    equipment: [
      'Terminaux de reconnaissance faciale',
      'Lecteurs hybrides visage + badge',
      'Contrôleurs et gâches électriques',
      'Tourniquets et portiques',
      'Logiciel de gestion des identités',
      'Alimentations secourues',
    ],
    faqs: [
      {
        question: 'Le système peut-il être trompé par une photo ?',
        answer:
          'Les terminaux que nous installons intègrent une détection de vivacité qui rejette les photographies et les vidéos. Nous privilégions systématiquement ces modèles.',
      },
      {
        question: 'La reconnaissance fonctionne-t-elle avec des lunettes ou un masque ?',
        answer:
          'Les lunettes sont généralement bien gérées. En cas de masque, la fiabilité baisse fortement : nous recommandons alors une solution hybride visage + badge.',
      },
      {
        question: 'Où sont stockées les données biométriques ?',
        answer:
          'Les gabarits sont stockés localement sur le terminal ou le contrôleur, chiffrés, et ne sont jamais envoyés vers un service externe.',
      },
      {
        question: 'Faut-il une connexion internet ?',
        answer:
          'Non, le système fonctionne en local. Une connexion est utile pour la supervision centralisée et la consultation à distance.',
      },
      {
        question: 'Combien de personnes peut-on enregistrer ?',
        answer:
          'Selon le modèle, de quelques centaines à plusieurs dizaines de milliers de gabarits. Nous dimensionnons le terminal selon vos effectifs.',
      },
    ],
    seoTitle: 'Reconnaissance faciale au Congo | Contrôle d’accès biométrique — ACES Global Services',
    seoDescription:
      'Installation de terminaux de reconnaissance faciale pour un accès sans contact, rapide et traçable. Enrôlement, intégration au contrôle d’accès et conseil sur les données personnelles.',
    order: 8,
    isPublished: true,
    images: [
      { url: '/assets/images/services/reconnaissance-faciale.jpg', alt: 'Terminal de reconnaissance faciale à l’entrée d’un bâtiment' },
      { url: '/assets/images/services/reconnaissance-faciale-2.jpg', alt: 'Terminal biométrique avec écran de reconnaissance faciale' },
    ],
  },
  {
    id: 'svc-badge-identification',
    slug: 'badge-identification',
    title: 'Badge d’identification',
    tagline: 'Identifiez, contrôlez, tracez',
    shortDescription:
      'Conception et personnalisation de badges, avec système de gestion des identités et impression sur site.',
    description: `
<p>Le badge est à la fois une carte d'accès et un outil de gestion. Il identifie visuellement une personne, détermine ses droits et alimente l'historique des passages et des présences.</p>
<h2>Du badge papier au badge programmable</h2>
<p>Nous produisons des badges PVC imprimés et personnalisés : logo, photo, fonction, service, date de validité, code-barres ou puce RFID. Ils s'intègrent ensuite au contrôle d'accès du site.</p>
<h2>Une gestion centralisée</h2>
<p>Le logiciel de badgeage permet de créer un profil, d'attribuer des droits, de suspendre un badge perdu et de produire des rapports de présence. Les badges visiteurs peuvent être limités dans le temps et dans les zones accessibles.</p>
<h3>Impression sur site</h3>
<p>Pour les organisations qui accueillent régulièrement des visiteurs, nous installons des imprimantes de badges avec appareil photo et logiciel : le badge est créé en quelques minutes à l'accueil.</p>`,
    icon: 'id-card',
    heroImage: '/assets/images/services/badge-identification.jpg',
    coverImage: '/assets/images/services/badge-identification.jpg',
    benefits: [
      'Identification immédiate du personnel et des visiteurs',
      'Badges personnalisés à votre image',
      'Gestion des droits et des dates de validité',
      'Traçabilité des entrées et des présences',
      'Badges visiteurs à durée limitée',
    ],
    features: [
      {
        title: 'Impression personnalisée',
        description:
          'Badges PVC couleur avec photo, logo, fonction, zonage et code de sécurité.',
      },
      {
        title: 'Technologies multiples',
        description:
          'Cartes RFID 125 kHz ou 13,56 MHz, badges magnétiques ou codes-barres.',
      },
      {
        title: 'Gestion des identités',
        description:
          'Création, renouvellement, suspension et archivage des badges depuis un logiciel unique.',
      },
      {
        title: 'Badges visiteurs',
        description:
          'Modèles à durée limitée pour les prestataires et les invités, avec registre des entrées.',
      },
    ],
    applications: [
      'Entreprises et administrations',
      'Établissements scolaires',
      'Cliniques et laboratoires',
      'Sites industriels',
      'Événements et accueils',
      'Immeubles et résidences',
    ],
    process: [
      { title: 'Cadrage', description: 'Définition des informations, du visuel et de la technologie du badge.' },
      { title: 'Maquette', description: 'Proposition graphique et validation avant impression.' },
      { title: 'Production', description: 'Impression, encodage RFID et numérotation des badges.' },
      { title: 'Intégration', description: 'Enrôlement dans le système de contrôle d’accès et formation à la gestion.' },
    ],
    equipment: [
      'Imprimantes de badges PVC',
      'Cartes RFID et puces programmables',
      'Appareils photo et logiciels de capture',
      'Lecteurs de badges',
      'Rouleaux et consommables',
      'Accessoires (cordons, porte-cartes)',
    ],
    faqs: [
      {
        question: 'Pouvez-vous reproduire nos badges existants ?',
        answer:
          'Oui, si nous disposons de la maquette ou d’un badge original. Nous pouvons aussi moderniser le visuel tout en conservant votre identité.',
      },
      {
        question: 'Quel délai pour une première série ?',
        answer:
          'Après validation de la maquette, une série de badges PVC est généralement produite en quelques jours ouvrables.',
      },
      {
        question: 'Les badges peuvent-ils être utilisés avec un système existant ?',
        answer:
          'Cela dépend de la technologie et de l’encodage. Nous vérifions la compatibilité des cartes avec votre contrôleur d’accès avant la production.',
      },
      {
        question: 'Comment gérer les départs de personnel ?',
        answer:
          'Le badge est désactivé dans le logiciel en quelques secondes, et son historique reste consultable pour audit.',
      },
      {
        question: 'Peut-on imprimer les badges sur place ?',
        answer:
          'Oui, nous installons des imprimantes de badges à l’accueil, avec le logiciel de capture et de personnalisation.',
      },
    ],
    seoTitle: 'Badges d’identification au Congo | Impression et gestion — ACES Global Services',
    seoDescription:
      'Création et impression de badges d’identification personnalisés, cartes RFID et badges visiteurs. Gestion des identités et intégration au contrôle d’accès.',
    order: 9,
    isPublished: true,
    images: [
      { url: '/assets/images/services/badge-identification.jpg', alt: 'Système de création de badges d’identification' },
      { url: '/assets/images/services/badge-identification-2.jpg', alt: 'Cartes et badges d’accès personnalisés' },
    ],
  },
  {
    id: 'svc-sas-entree',
    slug: 'sas-entree',
    title: 'SAS d’entrée',
    tagline: 'Un sas de sécurité à double barrière',
    shortDescription:
      'Sas d’entrée et portiques de sécurité pour contrôler les accès un par un et empêcher tout passage non autorisé.',
    description: `
<p>Le sas d'entrée est une zone tampon : deux barrières qui ne s'ouvrent jamais en même temps. Une personne ne peut entrer qu'après identification, et aucune intrusion par bousculade n'est possible.</p>
<h2>Contrôle individuel</h2>
<p>Portique à tripodes, tourniquet, sas vitré ou porte à double battement : chaque configuration répond à un niveau de sécurité et à un débit de passage. Le sas est associé à un lecteur de badge, un terminal biométrique ou un système de reconnaissance faciale.</p>
<h2>Anti-passback et détection</h2>
<p>Le sas empêche la réutilisation d'un même badge pour plusieurs personnes (anti-passback) et détecte les présences résiduelles dans la chambre. Une alarme locale signale toute tentative de fraude ou de passage forcé.</p>
<h3>Intégration aux issues de secours</h3>
<p>En cas d'alarme incendie ou de coupure d'alimentation, les barrières se libèrent automatiquement pour permettre l'évacuation. Ce comportement doit être conçu et testé dès l'installation.</p>`,
    icon: 'door-closed',
    heroImage: '/assets/images/services/sas-entree.jpg',
    coverImage: '/assets/images/services/sas-entree.jpg',
    benefits: [
      'Un seul passage à la fois, sans bousculade',
      'Anti-passback et détection de fraude',
      'Compatible badge, biométrie et reconnaissance faciale',
      'Libération automatique en cas d’urgence',
      'Solution adaptée aux sites sensibles',
    ],
    features: [
      {
        title: 'Portiques et tourniquets',
        description:
          'Tripodes, tourniquets à tambour ou portes battantes selon le débit attendu.',
      },
      {
        title: 'Sas vitrés',
        description:
          'Chambres de sécurité à deux portes pour les zones à très haute sensibilité.',
      },
      {
        title: 'Anti-passback',
        description:
          'Contrôle du sens de passage et interdiction de réutilisation immédiate d’un badge.',
      },
      {
        title: 'Sécurité incendie',
        description:
          'Libération des barrières sur alarme incendie et sur défaut d’alimentation.',
      },
    ],
    applications: [
      'Sièges sociaux et banques',
      'Salles techniques et salles serveurs',
      'Zones de production et de stockage',
      'Établissements de santé',
      'Bases militaires et sites sensibles',
      'Accueils d’établissements scolaires',
    ],
    process: [
      { title: 'Étude de flux', description: 'Nombre de passages, pointe horaire et niveau de sécurité visé.' },
      { title: 'Choix du sas', description: 'Type de barrière, mode d’identification et signalétique.' },
      { title: 'Installation', description: 'Pose, raccordement électrique et intégration au contrôle d’accès.' },
      { title: 'Tests de sécurité', description: 'Essais d’anti-passback, de libération incendie et de passage forcé.' },
    ],
    equipment: [
      'Tripodes et portiques de contrôle',
      'Sas vitrés et portes automatiques',
      'Lecteurs de badges et terminaux biométriques',
      'Contrôleurs de sas et capteurs de présence',
      'Alarmes locales et signalétique',
      'Batteries de secours et libération incendie',
    ],
    faqs: [
      {
        question: 'Quel débit de passage peut être assuré ?',
        answer:
          'Un portique à tripodes gère en moyenne 20 à 30 passages par minute ; un sas vitré ralentit le flux mais offre un contrôle plus strict.',
      },
      {
        question: 'Le sas bloque-t-il l’évacuation ?',
        answer:
          'Non : il est configuré pour se libérer sur alarme incendie ou perte d’alimentation. Ce comportement est testé lors de la mise en service.',
      },
      {
        question: 'Peut-on installer un sas dans un hall existant ?',
        answer:
          'Oui, dans la plupart des cas, à condition de vérifier la largeur du passage, l’alimentation et les cheminements d’évacuation.',
      },
      {
        question: 'Comment gérer les visiteurs ?',
        answer:
          'Le sas peut fonctionner avec des badges visiteurs à durée limitée, émis à l’accueil et restreints à certaines zones.',
      },
      {
        question: 'L’accès est-il possible pour les personnes à mobilité réduite ?',
        answer:
          'Oui, avec une porte ou un portique adapté et une signalétique claire. Nous prévoyons systématiquement une solution accessible.',
      },
    ],
    seoTitle: 'SAS d’entrée et portiques de sécurité au Congo | ACES Global Services',
    seoDescription:
      'Installation de sas d’entrée, tripodes et portiques de contrôle d’accès avec anti-passback, biométrie et libération automatique en cas d’urgence.',
    order: 10,
    isPublished: true,
    images: [
      { url: '/assets/images/services/sas-entree.jpg', alt: 'Portique d’accès installé dans un hall d’entreprise' },
      { url: '/assets/images/services/sas-entree-2.jpg', alt: 'Tourniquets de contrôle d’accès' },
    ],
  },
  {
    id: 'svc-geolocalisation-gps',
    slug: 'geolocalisation-gps',
    title: 'Géolocalisation GPS',
    tagline: 'Suivez vos véhicules en temps réel',
    shortDescription:
      'Boîtiers GPS et plateforme de suivi pour véhicules, engins et flottes, avec alertes et rapports d’activité.',
    description: `
<p>Savoir où sont vos véhicules, combien de kilomètres ils parcourent et comment ils sont conduits, c'est réduire les coûts, prévenir les vols et protéger vos équipes.</p>
<h2>Suivi en temps réel</h2>
<p>Un boîtier discret relié à l'alimentation du véhicule transmet sa position, sa vitesse et ses trajets. La plateforme web et l'application mobile affichent chaque véhicule sur une carte et permettent de rejouer un itinéraire.</p>
<h2>Alertes et sécurité</h2>
<p>Vous définissez des zones géographiques et des plages horaires : toute sortie de zone, tout stationnement prolongé ou tout mouvement hors horaires déclenche une notification. La coupure d'alimentation du boîtier est également signalée — signe fréquent d'une tentative de neutralisation.</p>
<h3>Rapports et optimisation</h3>
<p>Les rapports d'activité indiquent les distances parcourues, les temps d'arrêt, la consommation estimée et les comportements à risque. Ils deviennent un outil de gestion, pas seulement de surveillance.</p>`,
    icon: 'map-pinned',
    heroImage: '/assets/images/services/geolocalisation-gps.jpg',
    coverImage: '/assets/images/services/geolocalisation-gps.jpg',
    benefits: [
      'Localisation immédiate en cas de vol ou d’accident',
      'Réduction des usages non autorisés',
      'Optimisation des tournées et du carburant',
      'Alertes de sortie de zone et de coupure',
      'Rapports d’activité exploitables',
    ],
    features: [
      {
        title: 'Boîtiers discrets',
        description:
          'Modules GPS filaires ou autonomes, montés hors de vue et protégés contre la déconnexion.',
      },
      {
        title: 'Plateforme de supervision',
        description:
          'Accès web et mobile, cartographie, historique, rapports et notifications.',
      },
      {
        title: 'Geofencing',
        description:
          'Définition de zones autorisées et d’horaires, avec alerte en cas de sortie.',
      },
      {
        title: 'Transmission fiable',
        description:
          'SIM de données dédiée et stockage des positions en cas de perte temporaire du réseau.',
      },
    ],
    applications: [
      'Flottes de véhicules utilitaires',
      'Véhicules de société et de direction',
      'Camions et engins de chantier',
      'Transport de marchandises',
      'Motocycles de livraison',
      'Convois et missions sensibles',
    ],
    process: [
      { title: 'Audit de flotte', description: 'Nombre de véhicules, types de mission et besoins de reporting.' },
      { title: 'Pose des boîtiers', description: 'Installation discrète et vérification de la couverture réseau.' },
      { title: 'Configuration', description: 'Création des comptes, des zones et des règles d’alerte.' },
      { title: 'Formation', description: 'Prise en main de la plateforme et exploitation des rapports.' },
    ],
    equipment: [
      'Traceurs GPS filaires et autonomes',
      'SIM de données et abonnements',
      'Plateforme web et application mobile',
      'Capteurs de carburant et de température (option)',
      'Boutons de détresse et écouteurs',
      'Relais de coupure moteur (selon usage)',
    ],
    faqs: [
      {
        question: 'Le boîtier peut-il être détecté ou neutralisé ?',
        answer:
          'Il est posé discrètement et relié à une alimentation permanente. Toute coupure déclenche une alerte, et une batterie interne assure la continuité quelques heures.',
      },
      {
        question: 'Comment fonctionne l’abonnement ?',
        answer:
          'Un abonnement couvre la carte SIM de données, la plateforme et le support. Sa durée dépend de la formule choisie ; nous vous conseillons la plus adaptée à votre flotte.',
      },
      {
        question: 'Peut-on suivre un véhicule à l’étranger ?',
        answer:
          'Oui, lorsque la couverture réseau et les accords d’itinérance de la SIM le permettent. Nous vérifions ce point lors de l’étude.',
      },
      {
        question: 'La plateforme conserve-t-elle l’historique ?',
        answer:
          'Oui, généralement sur plusieurs mois, avec possibilité d’export des rapports au format tableur.',
      },
      {
        question: 'Est-ce légal pour les véhicules de société ?',
        answer:
          'Le suivi des véhicules professionnels est admis dans de nombreux cadres, à condition d’informer les salariés. Nous vous recommandons de formaliser cette information par écrit.',
      },
    ],
    seoTitle: 'Géolocalisation GPS au Congo | Suivi de flotte — ACES Global Services',
    seoDescription:
      'Installation de traceurs GPS et plateforme de suivi de flotte : localisation en temps réel, geofencing, alertes et rapports d’activité pour véhicules et engins.',
    order: 11,
    isPublished: true,
    images: [
      { url: '/assets/images/services/geolocalisation-gps.jpg', alt: 'Interface de suivi GPS avec véhicule géolocalisé' },
      { url: '/assets/images/services/geolocalisation-gps-2.jpg', alt: 'Flotte de véhicules suivie en temps réel' },
      { url: '/assets/images/services/geolocalisation-gps-3.jpg', alt: 'Boîtier de géolocalisation installé dans un véhicule' },
    ],
  },
];
