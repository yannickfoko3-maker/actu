# Déployer ce site sur InfinityFree — ce qui est possible, ce qui ne l'est pas

Document de décision + procédure réelle, pour le projet **ACES Global Services**
(frontend React + API Node/Express + MySQL/Prisma).

---

## 1. Verdict en une minute

**Le site ne peut pas être déployé tel quel sur InfinityFree**, parce qu'InfinityFree n'exécute **que du PHP**.
Ce projet a un **backend Node.js** (Express + Prisma) : sans Node, il n'y a ni API, ni formulaires enregistrés,
ni back-office, ni connexion à la base.

| Besoin du projet | InfinityFree (offre gratuite) | Compatible ? |
| --- | --- | --- |
| HTML / CSS / JavaScript **statiques** | Servis normalement | ✅ |
| PHP 8.x | Disponible | ✅ |
| **Node.js / Express** | **Non disponible** | ❌ |
| MySQL / MariaDB | Fourni (400 bases) | ✅ (mais voir §6) |
| SSH / ligne de commande | Non | ❌ |
| cron / tâches planifiées | Non sur l'offre gratuite | ❌ |
| Connexion MySQL depuis un serveur externe | Bloquée en pratique | ❌ |
| SSL gratuit (Let's Encrypt) | Oui | ✅ |
| Upload | FTP (ftpupload.net) ou gestionnaire de fichiers | ✅ |

Autres limites de l'offre gratuite : 5 Go d'espace, plafond d'environ **30 000 inodes** (fichiers),
limite de temps d'exécution PHP (~10 s), bridage CPU, et coupure possible en cas de pic de trafic.

➡️ **Conclusion :** InfinityFree peut héberger **la partie vitrine statique** (ou une page d'attente),
mais **pas l'application complète**. Trois scénarios réalistes sont détaillés ci-dessous.

---

## 2. Les quatre scénarios possibles

| # | Scénario | Où vit le site | Où vit l'API | Formulaires / admin | Difficulté |
| --- | --- | --- | --- | --- | --- |
| **A** | Frontend sur InfinityFree + API Node ailleurs | InfinityFree | Hébergement Node (VPS, Render, Railway…) | ✅ fonctionnels | Moyenne |
| **B** | **Tout sur un hébergement Node** (recommandé) | Hébergement Node | Même serveur | ✅ fonctionnels | Faible |
| **C** | Page d'attente statique sur InfinityFree | InfinityFree | — | ❌ aucune | Très faible |
| **D** | Réécrire le backend en PHP | InfinityFree | PHP sur InfinityFree | ✅ mais nouveau développement | Très élevée |

> Le scénario **B** reste le choix recommandé pour un vrai site d'entreprise : un seul domaine, pas de CORS,
> pas de problème de cookies, pas de limite « PHP 10 s ». Voir `DEPLOIEMENT-VPS.md`.
> Le scénario **A** est décrit intégralement ci-dessous car c'est celui qui répond à votre question.

---

## 3. Scénario A — Frontend sur InfinityFree, API sur un hébergement Node

### 3.1 Choisir les deux domaines (important pour les cookies)

L'administration utilise un **cookie de session**. Deux cas :

| Configuration | Cookie | Réglage |
| --- | --- | --- |
| `www.mondomaine.com` (InfinityFree) + `api.mondomaine.com` (Node) | **même site** | `COOKIE_SAMESITE=lax` ✅ recommandé |
| `monprojet.infinityfreeapp.com` + `mon-api.onrender.com` | sites différents | `COOKIE_SAMESITE=none` + HTTPS **obligatoire** |

La première configuration est **nettement plus fiable** (les navigateurs bloquent de plus en plus les cookies
tiers). Utilisez donc de préférence un vrai nom de domaine, avec un sous-domaine `api.` pour l'API.

### 3.2 Préparer le frontend compilé

Sur votre poste, à la racine du projet :

```bash
# 1) indiquer l'adresse de l'API distante (sans slash final)
cd frontend
```

Créez le fichier `frontend/.env.production` :

```dotenv
VITE_API_URL=https://api.mondomaine.com/api
```

Puis compilez :

```bash
cd ..                 # retour à la racine
npm install
npm run build
```

Résultat : le dossier **`frontend/dist/`** contient le site statique à envoyer sur InfinityFree
(`index.html`, `assets/…`, `favicon.png`, `assets/images/…`).

> Sans `VITE_API_URL`, le site appellerait `/api` sur son propre domaine (InfinityFree) → erreurs 404.
> Vérifiez que `frontend/dist/assets/index-*.js` ne contient plus `"/api"` seul :
> `grep -o "https://api.mondomaine.com/api" dist/assets/*.js | head`.

### 3.3 Créer le fichier `.htaccess`

À la racine de `frontend/dist/`, créez un fichier **`.htaccess`** (attention : le point initial est important) :

```apache
# =====================================================================
# ACES Global Services — site statique hébergé sur InfinityFree
# =====================================================================
Options -Indexes
DirectoryIndex index.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Redirection HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Les images importées et les fichiers SEO sont servis par l'API Node
  RewriteRule ^uploads/(.*)$ https://api.mondomaine.com/uploads/$1 [R=301,L]
  RewriteRule ^sitemap\.xml$ https://api.mondomaine.com/sitemap.xml [R=301,L]
  RewriteRule ^robots\.txt$  https://api.mondomaine.com/robots.txt  [R=301,L]

  # Ne pas réécrire les fichiers réellement présents (JS, CSS, images, favicon)
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Routes React (React Router) → index.html
  RewriteRule . /index.html [L]
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 30 days"
  ExpiresByType image/png  "access plus 30 days"
  ExpiresByType image/webp "access plus 30 days"
  ExpiresByType text/css   "access plus 7 days"
  ExpiresByType application/javascript "access plus 7 days"
</IfModule>

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

Sans ce fichier : `/nos-activites` ou `/admin` renverraient une **erreur 404** au rechargement de la page.

### 3.4 Créer le compte et le domaine sur InfinityFree

1. <https://www.infinityfree.com> → **Sign up** (e-mail + mot de passe).
2. **Create Account** → choisir un **sous-domaine gratuit**
   (`monprojet.infinityfreeapp.com`, `.rf.gd`, `.wuaze.com`…) ou **attacher votre propre domaine**
   (dans ce cas, pointez les serveurs de noms du domaine vers `NS1.BYET.org` / `NS2.BYET.org`,
   délai de propagation 24–48 h).
3. Attendez la création de l'hébergement (quelques minutes).
4. Dans **Control Panel (VistaPanel)** → **SSL/TLS** → demander un certificat **Let's Encrypt**
   pour le domaine (5 à 15 minutes), puis activez l'option de forçage HTTPS si elle est proposée
   (le `.htaccess` ci-dessus le fait aussi).

### 3.5 Envoyer les fichiers

**Méthode 1 — Gestionnaire de fichiers (le plus simple)**

1. VistaPanel → **Online File Manager**.
2. Ouvrir le dossier **`htdocs`** (c'est la racine web).
3. Supprimer le fichier `default.php` ou `index2.html` éventuel.
4. **Upload** → sélectionner **tout le contenu** de `frontend/dist/`
   (`index.html`, `.htaccess`, `assets/`, `favicon.png` — ne pas envoyer le dossier `dist` lui-même).
5. Pour un envoi massif, compressez d'abord `frontend/dist` en `.zip`, uploadez le zip dans `htdocs`,
   puis utilisez **Extract**.

**Méthode 2 — FileZilla (FTP)**

| Champ | Valeur |
| --- | --- |
| Hôte | `ftpupload.net` |
| Port | `21` (FTP implicite/TLS possible) |
| Utilisateur | `if0_xxxxxxxx` (visible dans VistaPanel → **FTP Accounts**) |
| Mot de passe | celui affiché à la création du compte FTP |
| Dossier distant | `/htdocs` |

Puis glissez le **contenu** de `frontend/dist/` dans `/htdocs`.

> ⚠️ N'envoyez **jamais** sur InfinityFree : `backend/`, `node_modules/`, `database/`,
> ni un fichier `.env`. Rien de tout cela ne peut y fonctionner et `.env` contiendrait des secrets.

### 3.6 Déployer l'API sur un hébergement Node

Sur un VPS (voir `DEPLOIEMENT-VPS.md`) ou une plateforme Node (Render, Railway, Fly.io, Clever Cloud…),
déployez uniquement le backend :

```bash
npm install
cp backend/.env.example backend/.env      # puis éditer
npm --workspace backend run build         # génère backend/dist
npm run db:push                           # si la base est vide
npm run db:seed                           # contenus + compte admin
npm start                                 # node dist/server.js (port 4000 par défaut)
```

Configuration `backend/.env` côté API :

```dotenv
NODE_ENV=production
PORT=4000

# Adresse publique du site statique et de l'API
APP_URL=https://www.mondomaine.com
API_URL=https://api.mondomaine.com

# Origines autorisées à appeler l'API depuis le navigateur
CORS_ORIGINS=https://www.mondomaine.com,https://mondomaine.com

DATABASE_URL="mysql://utilisateur:motdepasse@localhost:3306/aces_global_services"
DATA_ADAPTER=prisma

JWT_SECRET=cle-aleatoire-de-48-octets
JWT_EXPIRES_IN=8h

# HTTPS obligatoire en production
COOKIE_SECURE=true
# « lax » si api.mondomaine.com et www.mondomaine.com (même domaine)
# « none » si le site et l'API sont sur deux domaines différents
COOKIE_SAMESITE=lax

UPLOAD_DIR=/var/www/aces/app/backend/uploads
UPLOAD_MAX_SIZE_MB=8

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=aces.globalservices@gmail.com
SMTP_PASSWORD=mot-de-passe-application
SMTP_FROM=ACES Global Services <aces.globalservices@gmail.com>
CONTACT_RECEIVER=aces.globalservices@gmail.com
```

Points d'attention :

- **CORS** : `CORS_ORIGINS` doit contenir **exactement** l'origine du site
  (`https://www.mondomaine.com`, sans slash final). Sinon le navigateur bloque les appels.
- **Cookies** : `COOKIE_SAMESITE=lax` exige que le site et l'API partagent le même domaine
  (`www.` + `api.`). Deux domaines totalement différents imposent `COOKIE_SAMESITE=none` **et** HTTPS.
- **Images importées** : les fichiers de la médiathèque sont servis par `/uploads/...` sur l'API.
  Le `.htaccess` de l'étape 3.3 les redirige automatiquement vers `api.mondomaine.com`.
- **Sitemap / robots** : générés par l'API (redirigés eux aussi depuis le `.htaccess`).
  Déclarez `https://api.mondomaine.com/sitemap.xml` dans Google Search Console, ou faites pointer un
  `sitemap.xml` statique vers les bonnes URL.

### 3.7 Vérifier le déploiement

| # | Test | Attendu |
| --- | --- | --- |
| 1 | `https://www.mondomaine.com/` | page d'accueil complète |
| 2 | Recharger `/nos-activites` directement | la page s'affiche (pas de 404) |
| 3 | `https://api.mondomaine.com/api/health` | `{"success":true,...}` |
| 4 | Formulaire de contact | message de confirmation, visible dans l'admin |
| 5 | Connexion `/admin` | tableau de bord accessible (cookie OK) |
| 6 | Médiathèque | import d'une image → affichée sur le site |
| 7 | Console navigateur (F12) | aucune erreur CORS / 401 |

### 3.8 Dépannage du scénario A

| Symptôme | Cause | Solution |
| --- | --- | --- |
| Page blanche | mauvais chemin d'upload | `index.html` doit être **directement** dans `htdocs` |
| Erreur 404 au rechargement | `.htaccess` absent ou mal nommé | recréer `.htaccess` (étape 3.3) |
| `blocked by CORS policy` | origine absente de `CORS_ORIGINS` | ajouter `https://www.mondomaine.com` |
| Connexion impossible / boucle | cookie `SameSite` incorrect | `lax` si même domaine, sinon `none` + HTTPS |
| Appels vers `…/api` en 404 | build sans `VITE_API_URL` | refaire `npm run build` avec `.env.production` |
| Images importées cassées | redirection `/uploads` absente | ajouter la règle de redirection |
| Erreur 403 d'InfinityFree | pare-feu anti-robot sur certaines requêtes | réessayer, éviter les scripts automatisés |
| Site très lent / suspendu | bridage CPU ou plafond de visites | passer à un hébergement payant |

---

## 4. Scénario B — Tout sur un hébergement Node (recommandé)

C'est le déploiement prévu par le projet : **un seul serveur** sert le site, l'API, les images,
le sitemap et le robots.txt.

```bash
npm install
npm run db:push && npm run db:seed
npm run build        # backend/dist + frontend/dist
npm start            # http://votre-domaine (Node sert tout)
```

Aucun `.htaccess`, aucun CORS, aucun cookie inter-domaines à gérer : Express renvoie `index.html`
pour toutes les routes du SPA. Procédure complète : `DEPLOIEMENT-VPS.md`.

Hébergements possibles (à vérifier, les offres gratuites évoluent) :

- **VPS** OVH, Hetzner, Contabo, Scaleway — à partir de quelques euros/mois, solution durable ;
- plateformes Node avec offre gratuite ou d'essai : Render, Railway, Fly.io, Clever Cloud ;
- hébergeurs mutualisés proposant **explicitement Node.js** (vérifiez la présence de Node, d'un gestionnaire
  de processus et de l'accès MySQL avant de payer).

---

## 5. Scénario C — Page d'attente statique sur InfinityFree

Si vous voulez seulement réserver le domaine et afficher une page propre en attendant la mise en ligne :

1. Créez un fichier `index.html` autonome (logo, nom, activité, téléphone, WhatsApp, e-mail).
2. Envoyez-le dans `htdocs` avec un `.htaccess` minimal (index par défaut + HTTPS).
3. N'annoncez **pas** de formulaire fonctionnel : sans API, rien n'est enregistré.

Vous pouvez réutiliser le logo fourni (`frontend/public/assets/brand/aces-logo.jpg`) et la charte
(`#062B63`, `#0873D1`, `#E6AD20`).

---

## 6. La base MySQL d'InfinityFree est-elle utilisable ?

**En pratique, non, pas pour une API hébergée ailleurs.** Les bases MySQL d'InfinityFree ne sont accessibles
que **depuis leurs propres serveurs** (pas d'accès distant, pas d'IP autorisée à configurer).
Par conséquent :

- si l'API tourne sur un VPS ou une plateforme Node, **sa base doit être hébergée avec elle**
  (MySQL du VPS, ou base MySQL managée du fournisseur) ;
- la base fournie par InfinityFree ne servirait qu'à un backend PHP tournant **sur InfinityFree**.

---

## 7. Et réécrire le backend en PHP (scénario D) ?

C'est techniquement possible (PHP 8.3 + MySQL sont disponibles), mais cela revient à **redévelopper
toute l'application** : API REST, authentification JWT, rôles et permissions, téléversements, éditeur de
contenu, envoi d'e-mails, back-office complet. Le frontend React devrait aussi être adapté.
Ce n'est pas une « configuration », c'est un nouveau projet — à budgéter séparément.

---

## 8. À ne pas faire

- ❌ Envoyer `backend/` sur InfinityFree en espérant que Node s'exécute.
- ❌ Envoyer `node_modules/` (des dizaines de milliers de fichiers, plafond d'inodes dépassé).
- ❌ Envoyer un fichier `.env` (secrets exposés publiquement).
- ❌ Compter sur `npm`, `prisma` ou `ssh` sur l'offre gratuite : ils n'existent pas.
- ❌ Utiliser l'offre gratuite pour un site d'entreprise réel : bridage, pas de garantie de disponibilité,
  pas de support, coupure possible en cas de pic.

---

## 9. Recommandation finale

| Objectif | Solution |
| --- | --- |
| Voir le site en ligne **gratuitement pour une démonstration** | Scénario A (frontend InfinityFree + API sur une offre gratuite Node) |
| **Site officiel** d'ACES Global Services | Scénario B : VPS ou hébergement Node (voir `DEPLOIEMENT-VPS.md`) |
| Juste réserver le domaine | Scénario C (page d'attente) |
| Rester sur InfinityFree absolument | Scénario D : refonte PHP — nouveau développement |

Le code livré ne nécessite **aucune modification** pour le scénario A : seuls le fichier
`frontend/.env.production` (adresse de l'API) et les variables d'environnement du backend
(`CORS_ORIGINS`, `COOKIE_SECURE`, `COOKIE_SAMESITE`, `APP_URL`, `API_URL`) changent.

---

## 10. Récapitulatif des variables pour le scénario A

| Variable | Où | Valeur (exemple) |
| --- | --- | --- |
| `VITE_API_URL` | `frontend/.env.production` | `https://api.mondomaine.com/api` |
| `APP_URL` | `backend/.env` | `https://www.mondomaine.com` |
| `API_URL` | `backend/.env` | `https://api.mondomaine.com` |
| `CORS_ORIGINS` | `backend/.env` | `https://www.mondomaine.com,https://mondomaine.com` |
| `COOKIE_SECURE` | `backend/.env` | `true` |
| `COOKIE_SAMESITE` | `backend/.env` | `lax` (même domaine) ou `none` (domaines différents) |
| `NODE_ENV` | `backend/.env` | `production` |
| `DATA_ADAPTER` | `backend/.env` | `prisma` |
