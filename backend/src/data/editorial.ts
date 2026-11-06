/** Réalisations, catégories, actualités et témoignages de démarrage. */

export interface SeedCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  kind: 'article' | 'project';
}

export const categories: SeedCategory[] = [
  {
    id: 'cat-securite',
    slug: 'securite',
    name: 'Sécurité',
    description: 'Conseils et actualités autour des systèmes de sécurité électronique et périmétrique.',
    kind: 'article',
  },
  {
    id: 'cat-energie',
    slug: 'energie',
    name: 'Énergie',
    description: 'Solaire, stockage et continuité d’alimentation.',
    kind: 'article',
  },
  {
    id: 'cat-technologie',
    slug: 'technologie',
    name: 'Technologie',
    description: 'Contrôle d’accès, biométrie, automatisation et nouveaux usages.',
    kind: 'article',
  },
  {
    id: 'cat-entreprise',
    slug: 'entreprise',
    name: 'Entreprise',
    description: 'La vie d’ACES Global Services, nos méthodes et nos engagements.',
    kind: 'article',
  },
];

export interface SeedProject {
  id: string;
  slug: string;
  title: string;
  category: string;
  client: string;
  location: string;
  year: number;
  summary: string;
  description: string;
  coverImage: string;
  isPublished: boolean;
  featured: boolean;
  order: number;
  images: { url: string; alt: string }[];
}

/**
 * Typologies de projets. Les visuels sont des images d’illustration :
 * ils ne représentent pas des installations identifiables de l’entreprise.
 */
export const projects: SeedProject[] = [
  {
    id: 'prj-residence-securisee',
    slug: 'residence-securisee-perimetre-et-acces',
    title: 'Résidence sécurisée : périmètre et accès',
    category: 'cloture-electrique',
    client: 'Propriété privée',
    location: 'Bangui',
    year: 2024,
    summary:
      'Clôture électrique sur 180 mètres, portail coulissant motorisé et vidéosurveillance des deux entrées.',
    description: `
<p><strong>Contexte.</strong> Une résidence familiale avec deux accès (véhicule et piéton) souhaitait dissuader les intrusions nocturnes et suivre les allées et venues.</p>
<p><strong>Solution mise en œuvre.</strong> Nous avons déployé une clôture électrique sur l’ensemble du périmètre, avec une centrale à deux zones, une sirène extérieure et une signalétique réglementaire. Le portail coulissant a été motorisé avec cellules photoélectriques et déverrouillage manuel. Quatre caméras couvrent l’entrée principale, le portail piéton, la cour et le garage, avec enregistrement local et consultation mobile.</p>
<p><strong>Résultat attendu.</strong> Une protection cohérente : dissuasion en périmètre, identification à l’entrée, preuve vidéo en cas d’incident. L’entretien annuel comprend le contrôle de la tension de clôture et le nettoyage des optiques.</p>`,
    coverImage: '/assets/images/projects/projet-5.jpg',
    isPublished: true,
    featured: true,
    order: 1,
    images: [
      { url: '/assets/images/projects/projet-5.jpg', alt: 'Portail motorisé d’une résidence' },
      { url: '/assets/images/services/cloture-electrique.jpg', alt: 'Clôture électrique de périmètre' },
      { url: '/assets/images/services/videosurveillance.jpg', alt: 'Caméra de surveillance en façade' },
    ],
  },
  {
    id: 'prj-siege-videosurveillance',
    slug: 'siege-social-videosurveillance-et-controle-acces',
    title: 'Siège social : vidéosurveillance et contrôle d’accès',
    category: 'videosurveillance',
    client: 'Entreprise de services',
    location: 'Bangui',
    year: 2024,
    summary:
      '16 caméras IP, poste de supervision, contrôle d’accès par badge sur six portes et badges collaborateurs.',
    description: `
<p><strong>Contexte.</strong> Un immeuble de bureaux de trois niveaux accueillant une cinquantaine de collaborateurs et recevant des visiteurs chaque jour.</p>
<p><strong>Solution mise en œuvre.</strong> Seize caméras IP (8 Mpx) couvrent l’accueil, les couloirs, les escaliers, le parking et les issues de secours. Un enregistreur NVR de 8 To assure 30 jours de conservation. Le contrôle d’accès par badge équipe six portes, avec des droits différenciés par étage et des horaires par profil. L’accueil dispose d’une imprimante de badges visiteurs.</p>
<p><strong>Résultat attendu.</strong> Une supervision centralisée, un historique des passages exploitable et une gestion des visiteurs sans registre papier.</p>`,
    coverImage: '/assets/images/projects/projet-1.jpg',
    isPublished: true,
    featured: true,
    order: 2,
    images: [
      { url: '/assets/images/projects/projet-1.jpg', alt: 'Poste de supervision vidéo' },
      { url: '/assets/images/projects/projet-3.jpg', alt: 'Contrôle d’accès par badge en entreprise' },
      { url: '/assets/images/services/badge-identification.jpg', alt: 'Badges d’identification' },
    ],
  },
  {
    id: 'prj-entrepot-solaire',
    slug: 'entrepot-solaire-et-eclairage-securise',
    title: 'Entrepôt : énergie solaire et éclairage sécurisé',
    category: 'panneaux-solaires',
    client: 'Plateforme logistique',
    location: 'Bimbo',
    year: 2023,
    summary:
      'Installation photovoltaïque de 6 kWc avec stockage, alimentation de l’éclairage, des caméras et du poste de garde.',
    description: `
<p><strong>Contexte.</strong> Les coupures de courant interrompaient régulièrement l’éclairage de l’entrepôt et la surveillance du site en soirée.</p>
<p><strong>Solution mise en œuvre.</strong> Une installation de 6 kWc composée de panneaux monocristallins et d’un onduleur hybride alimente en priorité l’éclairage de sécurité, les caméras et le poste de garde, avec batteries de stockage. Le réseau reste en appoint. Un moniteur de production permet de suivre la performance.</p>
<p><strong>Résultat attendu.</strong> Une surveillance continue même pendant les coupures, et une réduction sensible de la consommation facturée.</p>`,
    coverImage: '/assets/images/projects/projet-4.jpg',
    isPublished: true,
    featured: true,
    order: 3,
    images: [
      { url: '/assets/images/projects/projet-4.jpg', alt: 'Installation de panneaux solaires sur toiture' },
      { url: '/assets/images/services/panneaux-solaires-2.jpg', alt: 'Onduleur et batteries de stockage' },
    ],
  },
  {
    id: 'prj-banque-sas',
    slug: 'agence-bancaire-sas-et-controle-acces',
    title: 'Agence bancaire : sas et contrôle des accès',
    category: 'sas-entree',
    client: 'Institution financière',
    location: 'Bangui',
    year: 2023,
    summary:
      'Sas d’entrée à portes battantes, lecteurs biométriques et gestion des accès des zones sensibles.',
    description: `
<p><strong>Contexte.</strong> Une agence souhaitait empêcher les entrées simultanées et tracer précisément l’accès au guichet et à la salle des coffres.</p>
<p><strong>Solution mise en œuvre.</strong> Un sas vitré à deux portes, piloté par un contrôleur avec détection de présence, filtre les entrées une par une. Les collaborateurs sont identifiés par badge et empreinte. L’accès à la salle des coffres exige une double authentification, avec journalisation complète. Les barrières se libèrent automatiquement en cas d’alarme incendie.</p>
<p><strong>Résultat attendu.</strong> Un contrôle strict sans gêne excessive pour la clientèle, et un historique opposable en cas d’incident.</p>`,
    coverImage: '/assets/images/projects/projet-3.jpg',
    isPublished: true,
    featured: false,
    order: 4,
    images: [
      { url: '/assets/images/projects/projet-3.jpg', alt: 'Portique de contrôle d’accès' },
      { url: '/assets/images/services/sas-entree.jpg', alt: 'Sas d’entrée sécurisé' },
    ],
  },
  {
    id: 'prj-ecole-alarme',
    slug: 'etablissement-scolaire-alarme-incendie',
    title: 'Établissement scolaire : détection incendie',
    category: 'alarme-incendie',
    client: 'Établissement privé',
    location: 'Bangui',
    year: 2023,
    summary:
      'Centrale de détection, 42 détecteurs de fumée, déclencheurs manuels et sirènes sur trois bâtiments.',
    description: `
<p><strong>Contexte.</strong> Trois bâtiments accueillant des élèves, avec des circulations longues et un seul poste de garde.</p>
<p><strong>Solution mise en œuvre.</strong> Une centrale de détection supervise trois zones correspondant aux bâtiments. Quarante-deux détecteurs optiques couvrent salles et circulations, et des détecteurs thermiques équipent les locaux techniques. Des déclencheurs manuels sont installés à chaque sortie, avec sirènes et flashs lumineux. Le report d’alarme est relié au poste de garde.</p>
<p><strong>Résultat attendu.</strong> Une alerte immédiate et localisée, des exercices d’évacuation documentés et une maintenance annuelle planifiée.</p>`,
    coverImage: '/assets/images/projects/projet-3.jpg',
    isPublished: true,
    featured: false,
    order: 5,
    images: [
      { url: '/assets/images/services/alarme-incendie.jpg', alt: 'Détecteur de fumée installé au plafond' },
      { url: '/assets/images/services/alarme-incendie-3.jpg', alt: 'Centrale de détection incendie' },
    ],
  },
  {
    id: 'prj-flotte-gps',
    slug: 'flotte-logistique-geolocalisation',
    title: 'Flotte logistique : géolocalisation',
    category: 'geolocalisation-gps',
    client: 'Transporteur',
    location: 'Bangui – Douala',
    year: 2024,
    summary:
      'Équipement GPS de 24 véhicules, geofencing des dépôts et rapports mensuels d’utilisation.',
    description: `
<p><strong>Contexte.</strong> Un transporteur constatait des écarts entre les kilomètres facturés et la consommation réelle, sans moyen de vérifier les trajets.</p>
<p><strong>Solution mise en œuvre.</strong> Vingt-quatre traceurs GPS discrets équipent la flotte, avec une plateforme commune, des zones géographiques autour des dépôts et des alertes en cas de mouvement nocturne ou de coupure d’alimentation du boîtier.</p>
<p><strong>Résultat attendu.</strong> Une vision claire des tournées, des rapports mensuels exploitables et une réaction immédiate en cas de vol.</p>`,
    coverImage: '/assets/images/projects/projet-8.jpg',
    isPublished: true,
    featured: false,
    order: 6,
    images: [
      { url: '/assets/images/projects/projet-8.jpg', alt: 'Suivi GPS de véhicules sur une carte' },
      { url: '/assets/images/services/geolocalisation-gps-3.jpg', alt: 'Véhicules de flotte géolocalisés' },
    ],
  },
  {
    id: 'prj-clinique-interphonie',
    slug: 'clinique-interphonie-et-controle-acces',
    title: 'Clinique : interphonie et accès protégés',
    category: 'interphone-videophone',
    client: 'Clinique privée',
    location: 'Bangui',
    year: 2022,
    summary:
      'Vidéophone à l’entrée, interphonie sur huit chambres et contrôle d’accès du bloc technique.',
    description: `
<p><strong>Contexte.</strong> L’entrée de nuit n’était pas contrôlée et le personnel devait se déplacer pour ouvrir la porte.</p>
<p><strong>Solution mise en œuvre.</strong> Une platine vidéophone à l’entrée principale, des postes internes dans huit chambres, et un contrôle d’accès par badge pour le bloc technique. L’ouverture se fait depuis le poste de garde ou l’accueil, avec image et audio.</p>
<p><strong>Résultat attendu.</strong> Une identification visuelle systématique et moins de déplacements inutiles pour les équipes de nuit.</p>`,
    coverImage: '/assets/images/services/interphone.jpg',
    isPublished: true,
    featured: false,
    order: 7,
    images: [
      { url: '/assets/images/services/interphone.jpg', alt: 'Platine de rue vidéophone' },
      { url: '/assets/images/services/interphone-2.jpg', alt: 'Moniteur vidéophone intérieur' },
    ],
  },
  {
    id: 'prj-usine-reconnaissance',
    slug: 'site-industriel-reconnaissance-faciale',
    title: 'Site industriel : reconnaissance faciale',
    category: 'reconnaissance-faciale',
    client: 'Unité de production',
    location: 'Bangui',
    year: 2024,
    summary:
      'Terminaux de reconnaissance faciale sur trois accès, enrôlement de 180 personnes et gestion des horaires.',
    description: `
<p><strong>Contexte.</strong> Les badges étaient régulièrement prêtés entre collègues, rendant le pointage et le contrôle des accès peu fiables.</p>
<p><strong>Solution mise en œuvre.</strong> Trois terminaux de reconnaissance faciale avec détection de vivacité équipent les accès du site. L’enrôlement a concerné 180 personnes, avec contrôle qualité des gabarits. Les droits diffèrent selon les zones et les horaires. Un mode hybride (visage + badge) reste disponible pour les visiteurs.</p>
<p><strong>Résultat attendu.</strong> Un pointage fiable, un accès sans contact et une réduction des fraudes au badge.</p>`,
    coverImage: '/assets/images/services/reconnaissance-faciale.jpg',
    isPublished: true,
    featured: false,
    order: 8,
    images: [
      { url: '/assets/images/services/reconnaissance-faciale.jpg', alt: 'Terminal de reconnaissance faciale' },
      { url: '/assets/images/services/reconnaissance-faciale-2.jpg', alt: 'Terminal biométrique mural' },
    ],
  },
];

export interface SeedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryId: string;
  tags: string[];
  author: string;
  status: 'PUBLISHED' | 'DRAFT' | 'SCHEDULED';
  publishedAt: string;
  readingTime: number;
  seoTitle: string;
  seoDescription: string;
}

export const articles: SeedArticle[] = [
  {
    id: 'art-choisir-videosurveillance',
    slug: 'bien-choisir-son-systeme-de-videosurveillance',
    title: 'Bien choisir son système de vidéosurveillance en 5 questions',
    excerpt:
      'Nombre de caméras, résolution, stockage, accès à distance : les questions à poser avant de signer un devis.',
    content: `
<p>Un système de vidéosurveillance mal conçu coûte cher et sert peu. Avant de comparer les prix, il faut répondre à cinq questions simples.</p>
<h2>1. Que voulez-vous réellement voir ?</h2>
<p>Surveiller une cour, identifier une plaque d’immatriculation ou vérifier une caisse ne demandent pas les mêmes caméras. La première étape consiste à lister les zones à couvrir et le niveau de détail attendu.</p>
<h2>2. Combien de caméras ?</h2>
<p>Une villa standard se couvre souvent avec 4 à 8 caméras : entrée, cour, portail, façades. Un commerce ajoute les caisses et les réserves. Au-delà du nombre, c’est le placement qui fait la différence.</p>
<h2>3. Quelle résolution et quelle vision nocturne ?</h2>
<p>2 Mpx suffisent pour surveiller un volume ; 4 à 8 Mpx deviennent utiles pour reconnaître un visage ou une plaque. La vision nocturne doit être vérifiée sur place : une caméra qui éclaire trop fort sature l’image.</p>
<h2>4. Combien de temps conserver les images ?</h2>
<p>La durée de conservation dépend de la capacité de l’enregistreur. Quinze à trente jours couvrent la plupart des besoins ; au-delà, le stockage devient coûteux.</p>
<h2>5. Qui pourra consulter les images ?</h2>
<p>Chaque utilisateur doit avoir son propre compte et des droits adaptés. L’accès doit être protégé, et la consultation des images encadrée par une politique interne claire.</p>
<h2>En résumé</h2>
<p>Un bon devis décrit les caméras, leur emplacement, l’enregistreur, la durée de conservation et les modalités d’accès. S’il ne mentionne que le nombre de caméras, demandez des précisions.</p>`,
    coverImage: '/assets/images/articles/article-3.jpg',
    categoryId: 'cat-securite',
    tags: ['vidéosurveillance', 'caméras', 'conseils'],
    author: 'ACES Global Services',
    status: 'PUBLISHED',
    publishedAt: '2026-10-14T09:00:00.000Z',
    readingTime: 4,
    seoTitle: 'Bien choisir son système de vidéosurveillance — ACES Global Services',
    seoDescription:
      'Nombre de caméras, résolution, stockage, accès : cinq questions à se poser avant d’installer un système de vidéosurveillance.',
  },
  {
    id: 'art-solaire-coupures',
    slug: 'solaire-et-coupures-de-courant',
    title: 'Coupures de courant : comment le solaire sécurise votre activité',
    excerpt:
      'Dimensionner une installation solaire pour la continuité, pas seulement pour la facture : la méthode et les pièges.',
    content: `
<p>Beaucoup d’installations solaires sont dimensionnées sur la facture d’électricité, et non sur le besoin réel de continuité. Résultat : le système fonctionne en journée, mais s’arrête précisément au moment où il devient indispensable.</p>
<h2>Commencer par les usages critiques</h2>
<p>Éclairage, réfrigération, informatique, caméras, portail, pompe à eau : listez les équipements qui doivent continuer à fonctionner, leur puissance et leur durée d’utilisation quotidienne.</p>
<h2>Distinguer puissance et énergie</h2>
<p>La puissance (en watts) détermine la taille de l’onduleur. L’énergie (en wattheures) détermine la capacité des batteries. Confondre les deux conduit à des installations qui disjonctent ou qui ne tiennent pas la nuit.</p>
<h2>Ne pas négliger les protections</h2>
<p>Coffrets DC/AC, parafoudre, mise à la terre et câblage dimensionné protègent l’investissement. Une installation sans protections peut durer quelques mois seulement.</p>
<h2>Le suivi compte autant que le matériel</h2>
<p>Un nettoyage régulier des modules, un contrôle des connexions et une vérification de l’état de charge des batteries prolongent la durée de vie du système. Prévoyez ces passages dès la conception.</p>
<h2>Un investissement progressif</h2>
<p>Il est possible de commencer par un sous-ensemble critique (sécurité et éclairage) puis d’étendre l’installation. Cette approche étale l’investissement et permet d’ajuster selon l’usage réel.</p>`,
    coverImage: '/assets/images/articles/article-2.jpg',
    categoryId: 'cat-energie',
    tags: ['solaire', 'batteries', 'continuité'],
    author: 'ACES Global Services',
    status: 'PUBLISHED',
    publishedAt: '2026-09-22T09:00:00.000Z',
    readingTime: 5,
    seoTitle: 'Solaire et coupures de courant : sécuriser son activité — ACES',
    seoDescription:
      'Comment dimensionner une installation solaire pour la continuité d’alimentation : usages critiques, batteries, protections et maintenance.',
  },
  {
    id: 'art-controle-acces-entreprise',
    slug: 'controle-acces-entreprise-par-ou-commencer',
    title: 'Contrôle d’accès en entreprise : par où commencer ?',
    excerpt:
      'Toutes les portes ne se valent pas. Une méthode simple pour hiérarchiser les accès et éviter un projet inutilement complexe.',
    content: `
<p>Vouloir équiper toutes les portes d’un bâtiment dès le premier jour est une erreur fréquente. Un projet de contrôle d’accès réussi commence par une hiérarchisation.</p>
<h2>Classer les zones</h2>
<p>Zones publiques (accueil), zones internes (bureaux), zones sensibles (salle serveur, coffre) et zones techniques (électricité, climatisation). Chaque niveau appelle un mode d’identification différent.</p>
<h2>Choisir le bon mode d’identification</h2>
<p>Le badge est rapide et peu coûteux, mais se prête. Le code se partage encore plus facilement. La biométrie est plus fiable mais demande un enrôlement soigné. La combinaison badge + empreinte est souvent le meilleur compromis pour les zones sensibles.</p>
<h2>Ne jamais bloquer les issues de secours</h2>
<p>Toute porte équipée doit rester franchissable dans le sens de l’évacuation, y compris en cas de coupure ou d’incendie. Ce point n’est pas négociable.</p>
<h2>Penser à l’exploitation</h2>
<p>Un système sans procédure d’arrivée et de départ des collaborateurs se dégrade vite. Prévoyez dès le départ : qui crée les badges, qui les désactive, à quelle fréquence les droits sont revus.</p>
<h2>Démarrer petit, mais proprement</h2>
<p>Mieux vaut équiper trois portes correctement, avec un contrôleur évolutif, que quinze portes approximativement. L’architecture doit permettre d’ajouter des portes sans tout remplacer.</p>`,
    coverImage: '/assets/images/articles/article-1.jpg',
    categoryId: 'cat-technologie',
    tags: ['contrôle d’accès', 'entreprise', 'badges'],
    author: 'ACES Global Services',
    status: 'PUBLISHED',
    publishedAt: '2026-08-30T09:00:00.000Z',
    readingTime: 4,
    seoTitle: 'Contrôle d’accès en entreprise : par où commencer — ACES',
    seoDescription:
      'Méthode pour hiérarchiser les accès, choisir le mode d’identification et réussir un projet de contrôle d’accès en entreprise.',
  },
  {
    id: 'art-approche-projet',
    slug: 'notre-methode-de-projet-en-cinq-etapes',
    title: 'Notre méthode de projet en cinq étapes',
    excerpt:
      'De la première visite technique à la maintenance : comment nous conduisons un projet, et pourquoi cette méthode évite les mauvaises surprises.',
    content: `
<p>Un équipement de sécurité ou d’énergie engage un budget, mais aussi la tranquillité de plusieurs années. Notre méthode en cinq étapes vise à réduire les incertitudes.</p>
<h2>1. Écoute et prise de contact</h2>
<p>Nous échangeons sur votre besoin, vos contraintes et votre calendrier. Cette étape permet de vérifier qu’une solution technique est bien la bonne réponse.</p>
<h2>2. Analyse des besoins sur site</h2>
<p>Visite technique, relevé des mesures, examen des points faibles, discussion avec les utilisateurs. C’est là que se joue la qualité du projet.</p>
<h2>3. Proposition technique et devis</h2>
<p>Nous détaillons les équipements, les quantités, les prestations et les délais. Le devis distingue clairement le matériel, la pose et les options.</p>
<h2>4. Installation et mise en service</h2>
<p>Pose soignée, câblage repéré, tests complets et formation à l’usage. Nous remettons un dossier technique avec les références des équipements.</p>
<h2>5. Maintenance et assistance</h2>
<p>Entretien préventif, dépannage et évolution du système. Une installation vit : elle doit s’adapter aux changements d’usage.</p>`,
    coverImage: '/assets/images/articles/article-4.jpg',
    categoryId: 'cat-entreprise',
    tags: ['méthode', 'projet', 'installation'],
    author: 'ACES Global Services',
    status: 'PUBLISHED',
    publishedAt: '2026-06-18T09:00:00.000Z',
    readingTime: 3,
    seoTitle: 'Notre méthode de projet en cinq étapes — ACES Global Services',
    seoDescription:
      'Découvrez la méthode ACES Global Services : écoute, analyse sur site, proposition technique, installation et maintenance.',
  },
];

/**
 * Aucun témoignage n’est publié par défaut : seuls des clients réels, avec leur
 * accord, doivent apparaître sur le site. Le module d’administration permet de
  * les ajouter et de les publier.
 */
export const testimonials: {
  id: string;
  authorName: string;
  authorRole: string;
  company: string;
  content: string;
  rating: number;
  photo: string | null;
  isPublished: boolean;
  order: number;
}[] = [];
