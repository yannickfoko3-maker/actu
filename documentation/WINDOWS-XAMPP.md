# Installation sous Windows avec XAMPP (MySQL)

Guide pas à pas pour installer l'application sur un poste Windows en utilisant le MySQL fourni par **XAMPP**
(ou WAMP). Convient au développement, aux démonstrations et aux tests internes.

> Un poste Windows n'est pas recommandé comme serveur de production exposé à Internet : préférez un VPS Linux
> (voir [`DEPLOIEMENT-VPS.md`](DEPLOIEMENT-VPS.md)).

---

## 1. Installer les logiciels

1. **Node.js 20 LTS ou 22** : <https://nodejs.org> → installeur « LTS » (inclut npm).
2. **XAMPP** : <https://www.apachefriends.org> → version avec **PHP 8** et **MySQL/MariaDB**.
   - Apache n'est **pas** nécessaire pour cette application (Node sert le site), mais le panneau XAMPP
     reste pratique pour démarrer MySQL et ouvrir phpMyAdmin.
3. **Visual Studio Code** (facultatif) pour éditer les fichiers `.env`.

Vérifiez dans une invite de commandes (`Win + R` → `cmd`) :

```bat
node -v
npm -v
```

---

## 2. Décompresser le projet

Décompressez `ACES_GLOBAL_SERVICES_CONGO.zip` dans un dossier sans espaces ni accents, par exemple :

```
C:\aces\ACES_GLOBAL_SERVICES_CONGO
```

> Évitez `C:\Program Files` (droits d'écriture limités) et les chemins du type
> `C:\Users\Nom\Mes documents\...` (accents/espaces parfois problématiques avec les outils Node).

---

## 3. Démarrer MySQL et créer la base

1. Ouvrez le **XAMPP Control Panel** → *Start* sur **MySQL**.
2. Cliquez sur *Admin* (ou ouvrez <http://localhost/phpmyadmin>).
3. Onglet **Bases de données** → nom : `aces_global_services` → interclassement
   `utf8mb4_unicode_ci` → *Créer*.

Par défaut sous XAMPP, l'utilisateur MySQL est `root` **sans mot de passe**.

### Deux possibilités pour créer les tables

**A. Prisma (recommandé)**

```bat
cd C:\aces\ACES_GLOBAL_SERVICES_CONGO
npm install
copy backend\.env.example backend\.env
```

Éditez `backend\.env` : la ligne de connexion XAMPP doit être

```dotenv
DATABASE_URL="mysql://root:@localhost:3306/aces_global_services"
DATA_ADAPTER=prisma
```

(notez le `:` vide entre `root` et `@` : pas de mot de passe)

puis :

```bat
npm run db:push
npm run db:seed
```

**B. Import SQL via phpMyAdmin**

1. phpMyAdmin → base `aces_global_services` → onglet **Importer** ;
2. choisissez `database\installation.sql` → *Exécuter* ;
3. puis, dans l'invite de commandes :

```bat
npm run db:seed
```

---

## 4. Configuration minimale du fichier `.env`

Ouvrez `backend\.env` (Bloc-notes ou VS Code) et vérifiez :

```dotenv
NODE_ENV=development
PORT=4000
APP_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DATABASE_URL="mysql://root:@localhost:3306/aces_global_services"
DATA_ADAPTER=prisma
JWT_SECRET=une-chaine-aleatoire-de-48-caracteres-minimum
COOKIE_SECURE=false
UPLOAD_DIR=./uploads
SEED_ADMIN_EMAIL=admin@aces-globalservices.com
SEED_ADMIN_PASSWORD=AcesAdmin2025!
```

Générer une clé JWT sous Windows :

```bat
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copiez le résultat dans `JWT_SECRET`.

> Si MySQL a un mot de passe (installation WAMP, par exemple), utilisez
> `mysql://root:VOTRE_MOT_DE_PASSE@localhost:3306/aces_global_services`.

---

## 5. Lancer l'application

```bat
cd C:\aces\ACES_GLOBAL_SERVICES_CONGO
npm run dev
```

Attendez l'affichage des deux lignes (API prête, Vite prêt), puis ouvrez :

- site : <http://localhost:5173>
- back-office : <http://localhost:5173/admin>

Connexion : `admin@aces-globalservices.com` / `AcesAdmin2025!` (à changer immédiatement).

Pour arrêter : `Ctrl + C` dans la fenêtre, puis `O` (ou `Y`) pour confirmer.

---

## 6. Mode démonstration sans MySQL

Si vous ne pouvez pas démarrer MySQL, l'application peut fonctionner avec un stockage JSON local :

```dotenv
DATA_ADAPTER=memory
```

Les données sont alors enregistrées dans `backend\.data\db.json` et réinitialisées au redémarrage.
Le tableau de bord affiche un bandeau « Mode démonstration ». **À ne jamais utiliser en production.**

---

## 7. Version « production locale » (un seul port)

```bat
npm run build
npm start
```

Le site est alors servi par Node sur <http://localhost:4000> (API + site + `/sitemap.xml`).
Aucun Apache n'est nécessaire.

---

## 8. Ouvrir MySQL en ligne de commande

```bat
cd C:\xampp\mysql\bin
mysql -u root
```

```sql
SHOW DATABASES;
USE aces_global_services;
SHOW TABLES;
SELECT COUNT(*) FROM Service;
SELECT email, isActive FROM AdminUser;
```

---

## 9. Tâches courantes sous Windows

| Objectif | Commande |
| --- | --- |
| Réinstaller les dépendances | `npm install` |
| Réinitialiser les contenus | `npm run db:seed` |
| Explorer la base | `npm run db:studio` |
| Vérifier le code | `npm run typecheck` |
| Lancer les tests | `npm test` |
| Créer l'archive de livraison | nécessite `zip` (ou utiliser l'archive fournie) |
| Sauvegarder la base | `C:\xampp\mysql\bin\mysqldump -u root aces_global_services > C:\sauvegardes\aces.sql` |
| Restaurer | `C:\xampp\mysql\bin\mysql -u root aces_global_services < C:\sauvegardes\aces.sql` |

Sauvegardez également le dossier `backend\uploads` (images importées).

---

## 10. Dépannage spécifique Windows

| Problème | Solution |
| --- | --- |
| `mysql` n'est pas reconnu | utilisez le chemin complet `C:\xampp\mysql\bin\mysql.exe` |
| `Port 3306 in use` | MySQL déjà lancé (XAMPP ou service Windows) : arrêtez le service en double via `services.msc` |
| `Port 4000 in use` | autre instance de l'API : fermez-la ou changez `PORT` dans `.env` |
| `EACCES` / `EPERM` à l'installation | évitez `C:\Program Files`, lancez l'invite **en administrateur** |
| `prisma generate` bloqué | antivirus/pare-feu : autorisez Node.js, ou exécutez hors réseau d'entreprise filtrant |
| Page blanche sur `/admin` | videz les cookies de `localhost:5173`, reconnectez-vous |
| Les images importées ne s'affichent pas | vérifiez que `UPLOAD_DIR=./uploads` pointe vers `backend\uploads` et que le dossier existe |
| Accents cassés dans phpMyAdmin | base créée en `utf8mb4_unicode_ci` ; à l'import, choisissez l'encodage **utf-8** |
| `'npm' n'est pas reconnu` | réinstallez Node.js en cochant « Add to PATH », puis rouvrez l'invite |

---

## 11. Accès depuis un autre poste du réseau local

1. Dans `backend\.env` : `APP_URL=http://192.168.1.50:5173` et
   `CORS_ORIGINS=http://192.168.1.50:5173` (adaptez l'IP du poste).
2. Le serveur Vite écoute déjà sur `0.0.0.0`.
3. Autorisez Node.js dans le **Pare-feu Windows** (réseau privé) pour les ports 4000 et 5173.
4. Ouvrez `http://192.168.1.50:5173` depuis les autres postes.

Pour une démonstration hors du réseau local, utilisez la version compilée (`npm run build && npm start`)
derrière un tunnel HTTPS ou déployez sur un VPS.
