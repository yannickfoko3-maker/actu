# Lancer le site en local avec XAMPP — procédure complète (Windows)

Guide pas à pas pour installer et démarrer **le site public, le back-office et l'API** sur un poste Windows,
en utilisant **MySQL de XAMPP** comme base de données.

> ✅ Durée : 15 à 25 minutes la première fois (dont le téléchargement des dépendances).
> ✅ Résultat : site sur `http://localhost:5173`, administration sur `http://localhost:5173/admin`.

---

## ⚠️ À lire avant de commencer : le rôle exact de XAMPP

| Composant | Rôle dans ce projet |
| --- | --- |
| **XAMPP → MySQL** | ✅ **utilisé** : c'est la base de données du site |
| **XAMPP → Apache** | ❌ **inutile** : ne pas démarrer (le site est servi par Node.js) |
| **Node.js** | ✅ **utilisé** : exécute le site (port 5173) et l'API (port 4000) |

**Ne copiez pas le projet dans `C:\xampp\htdocs`.** Ce projet n'est pas du PHP : il se lance depuis n'importe quel
dossier, avec `npm run dev`. Apache ne peut pas l'exécuter.

Schéma de fonctionnement :

```
Navigateur  ──►  Node.js / Vite (localhost:5173)  ──►  API Node.js (localhost:4000)  ──►  MySQL XAMPP (port 3306)
```

---

## 1. Prérequis à installer

1. **Node.js 20 LTS ou 22 LTS** → <https://nodejs.org/fr> (bouton « LTS »).
   Pendant l'installation, laissez cochée l'option *Add to PATH*.
2. **XAMPP** (PHP 8.x avec MySQL/MariaDB) → <https://www.apachefriends.org/fr/index.html>.
3. **7-Zip** (ou l'extracteur intégré de Windows) pour décompresser l'archive.
4. Facultatif : **Visual Studio Code** pour modifier le fichier `.env`.

Vérification dans l'invite de commandes (`Windows + R` → `cmd` → Entrée) :

```bat
node -v
npm -v
```

Attendu : `v20.x` ou `v22.x` et `10.x`. Si « n'est pas reconnu », réinstallez Node.js en cochant *Add to PATH*,
puis **fermez et rouvrez** l'invite de commandes.

---

## 2. Extraire le projet

Décompressez `ACES_GLOBAL_SERVICES_CONGO.zip` dans un dossier **sans espace ni accent**, par exemple :

```
C:\aces\ACES_GLOBAL_SERVICES_CONGO
```

Vérifiez que ce dossier contient bien : `package.json`, `frontend\`, `backend\`, `database\`, `documentation\`.

❌ À éviter : `C:\Program Files\...` (droits limités) et `C:\Users\Nom\Mes documents\...` (accents/espaces).

---

## 3. Démarrer MySQL avec XAMPP

1. Ouvrez **XAMPP Control Panel** (Menu Démarrer → XAMPP Control Panel).
2. Sur la ligne **MySQL**, cliquez sur **Start**.
3. La ligne doit devenir verte avec `Port(s) 3306`.
4. **Apache : ne cliquez pas sur Start** (inutile).

> Si MySQL refuse de démarrer (port 3306 occupé), voir la section **11. Dépannage**, cas n°1.

Ouvrez ensuite **phpMyAdmin** : bouton **Admin** de la ligne MySQL, ou <http://localhost/phpmyadmin>.

---

## 4. Créer la base de données

Dans phpMyAdmin :

1. Onglet **Bases de données** (ou « Nouvelle base de données »).
2. Nom : `aces_global_services`
3. Interclassement : `utf8mb4_unicode_ci`
4. Cliquez sur **Créer**.

Par défaut, avec XAMPP, l'utilisateur MySQL est **`root` sans mot de passe**.
La base reste vide : les tables seront créées à l'étape 7.

> Variante sans ligne de commande : vous pouvez à la place importer `database\installation.sql`
> (onglet **Importer** → choisir le fichier → **Exécuter**), puis passer directement à l'étape 7
> (la commande `db:push` devient facultative).

---

## 5. Configurer le fichier `backend\.env`

Dans l'invite de commandes, placez-vous dans le dossier du projet :

```bat
cd C:\aces\ACES_GLOBAL_SERVICES_CONGO
copy backend\.env.example backend\.env
```

Ouvrez `backend\.env` avec le Bloc-notes ou VS Code, puis vérifiez/adaptez ces lignes :

```dotenv
NODE_ENV=development
PORT=4000
APP_URL=http://localhost:5173
API_URL=http://localhost:4000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Connexion MySQL de XAMPP (root sans mot de passe → rien entre « : » et « @ »)
DATABASE_URL="mysql://root:@localhost:3306/aces_global_services"
DATA_ADAPTER=prisma

# Clé de signature des sessions : remplacez par une valeur aléatoire (voir ci-dessous)
JWT_SECRET=remplacez-moi
JWT_EXPIRES_IN=8h
COOKIE_SECURE=false

UPLOAD_DIR=./uploads
UPLOAD_MAX_SIZE_MB=8

SEED_ADMIN_NAME=Administrateur ACES
SEED_ADMIN_EMAIL=admin@aces-globalservices.com
SEED_ADMIN_PASSWORD=AcesAdmin2025!
```

Générer une clé `JWT_SECRET` solide :

```bat
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copiez le résultat dans `JWT_SECRET=...` (une seule ligne, sans guillemets).

> Si votre MySQL possède un mot de passe (installation WAMP ou mot de passe défini dans XAMPP) :
> `DATABASE_URL="mysql://root:VOTRE_MOT_DE_PASSE@localhost:3306/aces_global_services"`.
> Voir aussi la section **12** pour sécuriser le compte root.

Enregistrez le fichier (**Ctrl + S**).

---

## 6. Installer les dépendances

```bat
cd C:\aces\ACES_GLOBAL_SERVICES_CONGO
npm install
```

Cette commande installe le frontend **et** le backend (projet en « workspaces »). Elle prend 2 à 6 minutes et
télécharge environ 600 paquets. À la fin : `added ... packages` sans erreur `ERR!`.

---

## 7. Créer les tables et charger les contenus

Toujours dans le dossier du projet :

```bat
npm run db:push
npm run db:seed
```

- **`db:push`** crée les 17 tables dans la base `aces_global_services` et génère le client Prisma.
- **`db:seed`** insère les contenus de départ : 11 prestations, pages, carrousel, paramètres, compte administrateur.

Sortie attendue à la fin de `db:seed` :

```
[seed] services : 11 enregistrement(s)
[seed] Terminé. Compte administrateur :
        e-mail       : admin@aces-globalservices.com
        mot de passe : AcesAdmin2025!
```

Contrôle dans phpMyAdmin : la base doit maintenant contenir 17 tables
(`Service`, `Page`, `Article`, `QuoteRequest`, …).

> Si vous avez importé `installation.sql` à l'étape 4, `db:push` est inutile (il ne fera que confirmer) :
> lancez simplement `npm run db:seed`.

---

## 8. Démarrer le site

```bat
npm run dev
```

Cette commande lance **deux processus** :

```
[API]   ACES GLOBAL SERVICES — API
        Adaptateur : prisma
        URL        : http://localhost:4000/api

[WEB]   VITE v6.x  ready
        ➜  Local:   http://localhost:5173/
```

Laissez cette fenêtre **ouverte** (ne la fermez pas) et ouvrez votre navigateur :

| Adresse | Page |
| --- | --- |
| <http://localhost:5173> | site public |
| <http://localhost:5173/admin> | back-office |
| <http://localhost:4000/api/health> | état de l'API (doit afficher `"status":"ok"`) |

### Connexion à l'administration

- **E-mail** : `admin@aces-globalservices.com`
- **Mot de passe** : `AcesAdmin2025!`

➡️ **Changez immédiatement ce mot de passe** : menu du compte (en haut à droite) → **Mon profil** →
*Changer le mot de passe*.

---

## 9. Vérifications (5 minutes)

| # | Action | Résultat attendu |
| --- | --- | --- |
| 1 | Page d'accueil | carrousel, 4 piliers, 11 prestations, réalisations |
| 2 | `/api/health` | `{"success":true,"data":{"status":"ok",...}}` |
| 3 | *Nos activités* → une prestation | contenu, FAQ, galerie, encart de devis |
| 4 | Formulaire de **contact** | message de confirmation, message visible dans *Messages* |
| 5 | Formulaire de **devis** | visible dans *Demandes de devis*, export CSV fonctionnel |
| 6 | *Médiathèque* → importer une image | apparition immédiate, fichier créé dans `backend\uploads\` |
| 7 | *Paramètres* → changer un texte | modification visible sur le site après actualisation |
| 8 | `/sitemap.xml` et `/robots.txt` | XML et texte générés |
| 9 | Réduire la fenêtre (mode mobile) | mise en page correcte dès 360 px |

> Les e-mails ne partent pas tant que le SMTP n'est pas configuré (`SMTP_HOST` vide) : c'est **normal** en local.
> Les messages sont bien enregistrés en base et consultables dans l'administration.

---

## 10. Mode « comme en production » en local (facultatif)

Pour tester la version compilée (un seul port, servi par Node comme sur un serveur) :

```bat
npm run build
npm start
```

Puis ouvrez <http://localhost:4000> (le site, l'API, `/sitemap.xml` et `/robots.txt` sont servis par Node).
Pour revenir au mode développement : `Ctrl + C`, puis `npm run dev`.

---

## 11. Routine quotidienne

**Pour travailler :**

1. XAMPP Control Panel → **Start** sur MySQL.
2. Dans le dossier du projet : `npm run dev`.
3. Ouvrir <http://localhost:5173>.

**Pour arrêter :**

1. Dans la fenêtre de commande : `Ctrl + C`, puis `O` (ou `Y`) pour confirmer.
2. XAMPP Control Panel → **Stop** sur MySQL.

**Sauvegarder la base et les images :**

```bat
C:\xampp\mysql\bin\mysqldump -u root aces_global_services > C:\sauvegardes\aces.sql
xcopy C:\aces\ACES_GLOBAL_SERVICES_CONGO\backend\uploads C:\sauvegardes\uploads /E /I
```

**Restaurer :**

```bat
C:\xampp\mysql\bin\mysql -u root aces_global_services < C:\sauvegardes\aces.sql
```

---

## 12. Dépannage (cas les plus fréquents)

### 1. MySQL ne démarre pas dans XAMPP (« Port 3306 in use »)

Un autre MySQL tourne déjà (service Windows, WAMP, ancienne instance XAMPP).

```bat
netstat -ano | findstr :3306
```

- Si un service Windows `MySQL` / `MariaDB` existe : `services.msc` → arrêtez-le, ou désactivez-le au démarrage.
- Sinon, fermez l'autre application qui utilise le port 3306, puis dans XAMPP cliquez de nouveau sur **Start**.

### 2. `Access denied for user 'root'@'localhost'` / erreur 1045

Un mot de passe est défini pour `root`. Deux solutions :

- mettre le mot de passe dans `DATABASE_URL` : `mysql://root:VOTRE_MOT_DE_PASSE@localhost:3306/aces_global_services` ;
- ou réinitialiser root **sans** mot de passe (pratique en local) dans phpMyAdmin :

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
```

### 3. Erreur Prisma `P1001` / `Can't reach database server`

- MySQL est-il démarré ? (voyant vert dans XAMPP)
- Le port est-il bien `3306` dans `DATABASE_URL` ?
- La base `aces_global_services` existe-t-elle ?

### 4. Erreur Prisma `P1000` / authentification

Identifiants ou plugin MySQL incorrects. Essayez :

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
```

### 5. `'mysql' n'est pas reconnu` (en ligne de commande)

Utilisez le chemin complet : `C:\xampp\mysql\bin\mysql.exe -u root`.

### 6. `Port 4000 in use` / `EADDRINUSE`

Une autre instance de l'API tourne déjà : fermez l'ancienne fenêtre, ou changez `PORT=4001` dans `backend\.env`
(pensez alors à `API_URL=http://localhost:4001` et à redémarrer `npm run dev`).

### 7. Page blanche sur `/admin`

- Videz les cookies de `localhost:5173` et reconnectez-vous.
- Vérifiez que l'API répond (`/api/health`).
- Ouvrez la console du navigateur (F12) : une erreur `401` signifie simplement « reconnectez-vous ».

### 8. Les images importées ne s'affichent pas

Vérifiez que `backend\uploads\` existe et que `UPLOAD_DIR=./uploads` est bien dans `backend\.env`,
puis redémarrez `npm run dev`.

### 9. `npm install` échoue (réseau, proxy, antivirus)

```bat
npm config set registry https://registry.npmjs.org/
npm cache clean --force
npm install
```

Si l'entreprise filtre le réseau, autorisez Node.js dans l'antivirus/pare-feu, ou utilisez une connexion personnelle.

### 10. Prisma n'arrive pas à télécharger ses moteurs

`prisma generate` / `db:push` ont besoin d'accéder à `binaries.prisma.sh`. Sur un réseau filtré, exécutez ces
commandes depuis une connexion non restreinte, puis relancez `npm run dev`.

### 11. Accents cassés (« Ã© » au lieu de « é »)

- la base doit être en `utf8mb4` / `utf8mb4_unicode_ci` ;
- lors d'un import phpMyAdmin, choisissez l'encodage **utf-8** ;
- vérifiez que `.env` est enregistré en **UTF-8** (VS Code : coin inférieur droit).

### 12. Un dossier avec des accents provoque des erreurs

Déplacez le projet vers un chemin simple (`C:\aces\...`) : certains outils Node gèrent mal les chemins accentués.
En cas de doute, supprimez `node_modules` et relancez `npm install` depuis le nouveau dossier.

---

## 13. (Recommandé) Sécuriser un peu plus l'environnement local

Le compte `root` sans mot de passe est pratique, mais déconseillé dès que le poste est partagé :

```sql
CREATE USER 'aces_local'@'localhost' IDENTIFIED BY 'MotDePasseLocal2026!';
GRANT ALL PRIVILEGES ON aces_global_services.* TO 'aces_local'@'localhost';
FLUSH PRIVILEGES;
```

Puis dans `backend\.env` :

```dotenv
DATABASE_URL="mysql://aces_local:MotDePasseLocal2026!@localhost:3306/aces_global_services"
```

> Ne mettez **jamais** ces identifiants dans un fichier versionné : `backend\.env` est ignoré par Git.

---

## 14. Mémo des commandes utiles

| Objectif | Commande (dans `C:\aces\ACES_GLOBAL_SERVICES_CONGO`) |
| --- | --- |
| Installer | `npm install` |
| Créer / mettre à jour les tables | `npm run db:push` |
| Charger les contenus de départ | `npm run db:seed` |
| Lancer site + API | `npm run dev` |
| Version compilée locale | `npm run build` puis `npm start` |
| Vérifier le code TypeScript | `npm run typecheck` |
| Lancer les tests (37) | `npm test` |
| Explorer la base | `npm run db:studio` |
| Vérifier schéma/SQL | `npm run db:sql` |

---

## 15. Ce qui reste à personnaliser avant une mise en ligne

1. **Mot de passe administrateur** changé, comptes nominatifs créés (*Utilisateurs & rôles*).
2. *Paramètres* : coordonnées réelles, WhatsApp, logo, réseaux sociaux, SEO.
3. **Mentions légales** et **politique de confidentialité** complétées (RCCM, NIF, responsable de traitement).
4. **Photos** : remplacer les visuels d'illustration par vos propres chantiers, puis retirer la mention
   « visuels d'illustration ».
5. **SMTP** configuré pour recevoir les notifications de contact et de devis par e-mail.
6. Sauvegardes automatiques de la base + `backend\uploads`.

Pour la mise en ligne réelle : voir `documentation\DEPLOIEMENT-VPS.md` (VPS Linux, HTTPS, sauvegardes).
Pour la procédure d'administration du site : `documentation\ADMINISTRATION.md`.
