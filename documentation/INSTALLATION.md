# Guide d'installation — ACES Global Services

Ce document décrit l'installation complète de l'application (site public + back-office + API + base MySQL),
en développement puis en production.

Pour une installation pas à pas sous **Windows avec XAMPP**, consultez aussi
[`WINDOWS-XAMPP.md`](WINDOWS-XAMPP.md). Pour un serveur Linux, voir
[`DEPLOIEMENT-VPS.md`](DEPLOIEMENT-VPS.md).

---

## 1. Prérequis

| Logiciel | Version minimale | Remarque |
| --- | --- | --- |
| Node.js | 20 (LTS recommandé : 22) | `node -v` |
| npm | 10 | fourni avec Node.js |
| MySQL | 8.0 | ou MariaDB 10.6+ |
| Git (facultatif) | — | pour récupérer le code |
| Navigateur | Chrome, Firefox, Edge ou Safari récent | |

> ⚠️ L'application est un **serveur Node.js**. Elle ne peut pas fonctionner sur un hébergement mutualisé
> « PHP uniquement » (cPanel sans Node.js). Il faut un VPS, un serveur dédié ou un hébergement qui propose
> explicitement Node.js (avec accès au port, aux processus et à MySQL).

Vérification rapide :

```bash
node -v      # v20.x ou plus
npm -v       # 10.x
mysql --version
```

---

## 2. Récupération du code

Décompressez `ACES_GLOBAL_SERVICES_CONGO.zip` (ou clonez le dépôt), puis placez-vous à la racine du projet :

```bash
cd ACES_GLOBAL_SERVICES_CONGO
```

La racine contient les deux workspaces `frontend/` et `backend/`.

---

## 3. Installation des dépendances

```bash
npm install
```

Cette commande installe les dépendances des deux workspaces. Comptez quelques minutes et ~600 paquets.

---

## 4. Création de la base de données

### 4.1 Créer la base

```sql
CREATE DATABASE aces_global_services
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Avec un utilisateur dédié (recommandé en production) :

```sql
CREATE USER 'aces_user'@'localhost' IDENTIFIED BY 'un-mot-de-passe-solide';
GRANT ALL PRIVILEGES ON aces_global_services.* TO 'aces_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4.2 Créer les tables — deux méthodes

**Méthode A — Prisma (recommandée).** Ne créez que la base, puis :

```bash
npm run db:push     # crée/met à jour les tables d'après backend/prisma/schema.prisma
npm run db:seed     # insère les contenus initiaux + le compte administrateur
```

**Méthode B — import SQL manuel** (phpMyAdmin, hébergement avec interface web uniquement) :

1. importez `database/installation.sql` dans la base ;
2. lancez ensuite `npm run db:seed` pour remplir les contenus et créer l'administrateur.

Le script de données initiales est **idempotent** : il peut être relancé sans dupliquer les contenus.
Ne mélangez pas les deux méthodes sur une base déjà initialisée.

Vérification : `npm run db:sql` contrôle que `installation.sql` reste cohérent avec le schéma Prisma.

---

## 5. Configuration du backend

```bash
cp backend/.env.example backend/.env
```

Éditez `backend/.env` :

```dotenv
NODE_ENV=development
PORT=4000
APP_URL=http://localhost:5173
API_URL=http://localhost:4000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

DATABASE_URL="mysql://aces_user:un-mot-de-passe-solide@localhost:3306/aces_global_services"
DATA_ADAPTER=prisma

JWT_SECRET=remplacez-par-48-octets-aleatoires
JWT_EXPIRES_IN=8h
COOKIE_SECURE=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=400
RATE_LIMIT_FORM_MAX=12

UPLOAD_DIR=./uploads
UPLOAD_MAX_SIZE_MB=8

SEED_ADMIN_NAME=Administrateur ACES
SEED_ADMIN_EMAIL=admin@aces-globalservices.com
SEED_ADMIN_PASSWORD=AcesAdmin2025!

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=ACES Global Services <no-reply@aces-globalservices.com>
CONTACT_RECEIVER=aces.globalservices@gmail.com
```

### Générer une clé JWT solide

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Variables importantes

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | chaîne de connexion MySQL (`mysql://user:pass@host:3306/base`) |
| `DATA_ADAPTER` | `prisma` (production) ou `memory` (démonstration sans MySQL) |
| `JWT_SECRET` | signature des jetons de session — **obligatoire en production** |
| `COOKIE_SECURE` | `true` en HTTPS (production) |
| `COOKIE_SAMESITE` | `lax` par défaut ; `none` si le site et l'API sont sur des domaines différents (HTTPS obligatoire) |
| `APP_URL` | URL publique du site (sitemap, e-mails, liens) |
| `CORS_ORIGINS` | origines navigateur autorisées, séparées par des virgules |
| `UPLOAD_DIR` | dossier des images importées depuis la médiathèque |
| `SMTP_*` | envoi d'e-mails (facultatif ; sans SMTP, les demandes restent en base et dans le journal) |
| `SEED_ADMIN_*` | compte administrateur créé par `npm run db:seed` |

> Aucun secret ne doit être commité. Le fichier `backend/.env` est ignoré par Git ; seul `.env.example` est livré.

### Mot de passe MySQL et erreurs d'authentification

Avec MySQL 8, l'utilisateur doit utiliser le plugin `mysql_native_password` ou `caching_sha2_password` géré par
Prisma récent. En cas d'erreur `Authentication failed`, exécutez :

```sql
ALTER USER 'aces_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'un-mot-de-passe-solide';
FLUSH PRIVILEGES;
```

---

## 6. Lancement en développement

```bash
npm run dev
```

Cette commande démarre simultanément :

- l'API Express sur <http://localhost:4000> (routes `/api/...`) ;
- le site Vite sur <http://localhost:5173> (proxy `/api`, `/uploads`, `/sitemap.xml`, `/robots.txt`).

Accès :

| URL | Description |
| --- | --- |
| <http://localhost:5173> | site public |
| <http://localhost:5173/admin> | back-office |
| <http://localhost:4000/api/health> | état de l'API |

### Première connexion

Utilisez les identifiants affichés à la fin de `npm run db:seed` :

- e-mail : `admin@aces-globalservices.com`
- mot de passe : `AcesAdmin2025!`

Puis **changez immédiatement le mot de passe** : menu du compte (en haut à droite) → *Mon profil* →
*Changer le mot de passe*. Vous pouvez aussi créer un compte nominatif et désactiver le compte par défaut
(Utilisateurs & rôles).

---

## 7. Compilation et exécution en production (mono-serveur)

```bash
npm run build     # backend/dist + frontend/dist
npm start         # démarre le serveur Node compilé
```

Le serveur Express :

- expose l'API sous `/api` ;
- sert les images importées (`/uploads`) ;
- sert le site compilé (`frontend/dist`) et renvoie `index.html` pour les routes du SPA ;
- génère `/sitemap.xml` et `/robots.txt` à la volée.

Avec `NODE_ENV=production` et `COOKIE_SECURE=true`, l'application doit être servie en **HTTPS**
(cf. [`DEPLOIEMENT-VPS.md`](DEPLOIEMENT-VPS.md)).

### Dossier des téléversements

```bash
mkdir -p backend/uploads
chmod 755 backend/uploads      # Linux
```

Les fichiers de `backend/uploads` doivent être conservés lors des mises à jour et sauvegardés avec la base.

---

## 8. Configuration des e-mails (facultatif)

Sans SMTP, les formulaires **fonctionnent** : les messages et demandes de devis sont enregistrés en base et
consultables dans le back-office. Seules les notifications par e-mail sont désactivées.

Exemple avec un compte Gmail (mot de passe d'application) :

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=aces.globalservices@gmail.com
SMTP_PASSWORD=mot-de-passe-application
SMTP_FROM=ACES Global Services <aces.globalservices@gmail.com>
CONTACT_RECEIVER=aces.globalservices@gmail.com
```

Avec un hébergeur (OVH, Hostinger…) utilisez les paramètres SMTP fournis dans votre espace client.
Redémarrez l'API après modification. Le tableau de bord indique si le SMTP est configuré.

> Gmail exige la validation en deux étapes et un **mot de passe d'application** ; le mot de passe du compte
> ne fonctionne pas.

---

## 9. Vérifications après installation

| Contrôle | Méthode |
| --- | --- |
| API vivante | `curl http://localhost:4000/api/health` → `{"success":true,...}` |
| Contenus chargés | `curl http://localhost:4000/api/public/services` → 11 prestations |
| Connexion admin | `/admin` avec le compte créé |
| Formulaires | soumettre un message depuis `/contact`, vérifier sa présence dans *Messages* |
| Devis | soumettre une demande depuis `/devis`, puis *Demandes de devis* et l'export CSV |
| Médias | importer une image dans *Médiathèque* (elle doit apparaître dans `backend/uploads`) |
| SEO | ouvrir `/sitemap.xml` et `/robots.txt` |
| Tests | `npm test` |

---

## 10. Dépannage

| Symptôme | Cause probable | Solution |
| --- | --- | --- |
| `Can't reach database server` | MySQL arrêté ou mauvais port | démarrer MySQL, vérifier `DATABASE_URL` |
| `Access denied for user` | identifiants/plugin MySQL | recréer l'utilisateur SQL (section 5) |
| `P1001` / `P1012` (Prisma) | base absente ou URL invalide | créer la base, contrôler l'URL |
| Page blanche `/admin` | session expirée ou cookies bloqués | vider les cookies, se reconnecter |
| `Jeton CSRF invalide` | cookie `aces_csrf` absent | recharger la page, vérifier que `/api` passe par le même domaine |
| Connexion impossible en production | `COOKIE_SECURE=true` sans HTTPS | activer HTTPS ou passer à `false` temporairement (déconseillé) |
| Images importées invisibles | dossier `uploads` non servi / droits | vérifier `UPLOAD_DIR`, relancer le serveur, droits du dossier |
| `EADDRINUSE` | port déjà utilisé | `PORT=4001` ou arrêter le processus |
| Erreur CORS | origine absente de `CORS_ORIGINS` | ajouter l'URL exacte (protocole + port) |
| `prisma generate` échoue hors ligne | téléchargement des moteurs bloqué | exécuter l'installation sur un réseau autorisant `binaries.prisma.sh` |

Journaux : la console du serveur (ou `journalctl -u aces -f` en production) affiche chaque requête API et les
erreurs de messagerie.

---

## 11. Sauvegarde et restauration

```bash
# sauvegarde
mysqldump -u aces_user -p aces_global_services > sauvegarde-$(date +%F).sql
tar czf uploads-$(date +%F).tar.gz backend/uploads

# restauration
mysql -u aces_user -p aces_global_services < sauvegarde-2026-01-31.sql
tar xzf uploads-2026-01-31.tar.gz
```

Planifiez une sauvegarde quotidienne (cron ou tâche planifiée Windows) et conservez les archives hors du serveur.
