# ACES GLOBAL SERVICES — Site web & back-office

Application web complète pour **ACES Global Services** (République Centrafricaine) :
automatisation, communication, énergie et sécurité.

- **Site public** : accueil, présentation, 11 prestations détaillées, réalisations, actualités, contact, demande de devis.
- **Back-office** (`/admin`) de type WordPress : tableau de bord, prestations, carrousel, pages, réalisations,
  actualités, médiathèque, témoignages, messages, demandes de devis (export CSV), paramètres, utilisateurs/rôles,
  journal d'activité.
- **API REST** sécurisée (JWT httpOnly, CSRF, limitation de débit, validation Zod) reliée à **MySQL 8 / MariaDB**
  via **Prisma**.

---

## 1. Stack technique

| Couche | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, Lucide, React Hook Form + Zod, TanStack Query, Recharts, TipTap |
| Backend | Node.js, Express, TypeScript, Zod, JWT, Bcrypt, Helmet, express-rate-limit, Multer, Nodemailer |
| Base de données | MySQL 8 / MariaDB 10.6+, Prisma ORM |
| Tests | Vitest + Supertest (API), Vitest + Testing Library (UI) |
| Polices | Poppins (titres) et Inter (texte/back-office), auto-hébergées via `@fontsource` |

## 2. Structure du projet

```
actu/
├── backend/                 API Express + Prisma
│   ├── prisma/              schema.prisma, seed.ts
│   ├── src/
│   │   ├── config/          variables d'environnement
│   │   ├── db/              adaptateurs Prisma et mémoire
│   │   ├── controllers/     logique métier REST
│   │   ├── middlewares/     auth, CSRF, erreurs, upload
│   │   ├── routes/          routes publiques et /api/admin
│   │   ├── utils/           mailer, activité, réglages, HTTP
│   │   └── data/            contenus de démarrage (prestations, pages…)
│   ├── scripts/             copie des ressources au build
│   └── tests/               tests d'intégration API
├── frontend/                SPA React (site public + /admin)
│   ├── public/assets/       logo, favicon, photographies
│   └── src/
│       ├── pages/           pages publiques
│       ├── admin/           back-office (AdminApp, pages, composants)
│       ├── components/      UI et composants du site
│       ├── contexts/        Site, Auth, Toast
│       └── services/        client HTTP + clés TanStack Query
├── database/installation.sql   création manuelle des tables (phpMyAdmin)
├── documentation/           INSTALLATION, ADMINISTRATION, API, WINDOWS-XAMPP, VPS
└── scripts/                 génération du ZIP et contrôle du SQL
```

## 3. Démarrage rapide (développement)

Prérequis : **Node.js ≥ 20**, **npm ≥ 10**, **MySQL 8** ou **MariaDB 10.6+**.

```bash
# 1. dépendances (workspaces frontend + backend)
npm install

# 2. configuration du backend
cp backend/.env.example backend/.env
#    éditez DATABASE_URL, JWT_SECRET, puis DATA_ADAPTER=prisma

# 3. base de données
npm run db:push      # crée les tables
npm run db:seed      # contenus initiaux + compte administrateur

# 4. lancement (API :4000 + site :5173)
npm run dev
```

- Site public : <http://localhost:5173>
- Back-office : <http://localhost:5173/admin>
- API : <http://localhost:4000/api>

**Sans MySQL** (démonstration) : mettez `DATA_ADAPTER=memory` dans `backend/.env`. Les données sont alors
stockées dans `backend/.data/db.json` et réinitialisées au redémarrage. Ce mode ne doit jamais être utilisé en
production.

### Compte administrateur créé par le script de données initiales

| Champ | Valeur par défaut |
| --- | --- |
| E-mail | `admin@aces-globalservices.com` |
| Mot de passe | `AcesAdmin2025!` |

Modifiable via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` **avant** le premier `npm run db:seed`.
Changez ce mot de passe dès la première connexion (menu du compte → *Mon profil*).

## 4. Scripts utiles

| Commande | Rôle |
| --- | --- |
| `npm run dev` | API + site en développement |
| `npm run build` | compile le backend (`dist/`) et le frontend (`frontend/dist/`) |
| `npm start` | démarre le serveur compilé (sert l'API **et** le site) |
| `npm run typecheck` | vérification TypeScript des deux workspaces |
| `npm test` | tests API (22) + tests UI (15) |
| `npm run db:push` / `db:migrate` | synchronise le schéma Prisma avec MySQL |
| `npm run db:seed` | données initiales (idempotent) |
| `npm run db:studio` | explorateur de base Prisma Studio |
| `npm run db:sql` | vérifie la cohérence entre `schema.prisma` et `installation.sql` |
| `npm run zip` | produit `ACES_GLOBAL_SERVICES_CONGO.zip` |

## 5. Fonctionnalités du site public

- **Accueil** : carrousel administrable, présentation des 4 piliers, chiffres clés, 11 prestations, section
  « pourquoi nous choisir », réalisations (avec mention « visuels d'illustration »), processus, actualités, appel à l'action.
- **Prestations** : page liste + une page par prestation (contenu riche, fonctionnalités, avantages, domaines
  d'application, étapes, équipements, galerie avec visionneuse, FAQ, encart de devis collant, sommaire, réalisations liées).
- **Réalisations** : filtres par prestation, fiche projet détaillée, galerie.
- **Actualités** : catégories, recherche, pagination, article avec partage (Facebook, LinkedIn, WhatsApp, copie du lien).
- **Contact** : formulaire validé, coordonnées, horaires, carte, données structurées `ContactPage`.
- **Devis** : formulaire multi-étapes simple avec présélection de la prestation (`/devis?service=slug`).
- **Contact rapide** : bouton flottant WhatsApp (`+242 06 539 0297`) avec message prérempli et lien d'appel direct.
- **SEO** : titres et descriptions par page, Open Graph, JSON-LD (`LocalBusiness`, `Service`, `BlogPosting`,
  `ContactPage`), `sitemap.xml` et `robots.txt` générés par le serveur.
- **Accessibilité** : navigation clavier, liens d'évitement, contrastes, `aria-*`, respect de
  `prefers-reduced-motion`, responsive de 360 px à 1440 px et au-delà.

## 6. Contenus et exactitude

- Les **photographies** livrées avec le site sont des **visuels d'illustration** : elles ne représentent pas des
  chantiers réels d'ACES Global Services. Une mention explicite figure sur la page « Nos réalisations » et sur les
  fiches projet. Remplacez-les par vos propres photos dès que possible (Médiathèque → Réalisations).
- Aucun **témoignage**, aucune **certification** et aucun **client** n'est inventé : la section témoignages reste
  masquée tant que vous n'avez pas saisi d'avis réels dans le back-office.
- Les pages **Mentions légales** et **Politique de confidentialité** contiennent des modèles à compléter et à
  valider juridiquement (adresse, RCCM, NIF, responsable de traitement).
- Le numéro de téléphone/WhatsApp affiché est celui fourni par l'entreprise : **+242 06 539 0297**.

## 7. Documentation

| Fichier | Contenu |
| --- | --- |
| [`documentation/DEMARRAGE-LOCAL-XAMPP.md`](documentation/DEMARRAGE-LOCAL-XAMPP.md) | **démarrage local avec XAMPP**, pas à pas (Windows) |
| [`documentation/INSTALLATION.md`](documentation/INSTALLATION.md) | installation détaillée, configuration, dépannage |
| [`documentation/ADMINISTRATION.md`](documentation/ADMINISTRATION.md) | guide du back-office, rôles, bonnes pratiques |
| [`documentation/API.md`](documentation/API.md) | référence complète de l'API REST |
| [`documentation/WINDOWS-XAMPP.md`](documentation/WINDOWS-XAMPP.md) | installation sous Windows avec XAMPP/MySQL |
| [`documentation/DEPLOIEMENT-VPS.md`](documentation/DEPLOIEMENT-VPS.md) | mise en production sur VPS Linux (Nginx, HTTPS, sauvegardes) |

## 8. Licence et propriété

Code livré à **ACES Global Services** pour son usage exclusif. Les polices Poppins et Inter sont distribuées sous
licence SIL Open Font License ; les icônes Lucide sous licence ISC.
