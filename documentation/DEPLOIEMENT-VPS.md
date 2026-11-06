# Déploiement en production sur un VPS Linux

Cible : Ubuntu 22.04 / 24.04 LTS (ou Debian 12), Nginx en frontal, HTTPS avec Let's Encrypt, MySQL local.

> L'application est un **serveur Node.js**. Un hébergement mutualisé « PHP uniquement » ne suffit pas :
> il faut un VPS, un serveur dédié, ou un hébergement proposant Node.js avec accès aux processus.

Architecture retenue (simple et robuste) :

```
Internet → Nginx (443, HTTPS) → Node.js/Express (127.0.0.1:4000) → MySQL 8
                                  ├── API /api
                                  ├── site compilé (frontend/dist)
                                  ├── /uploads
                                  └── sitemap.xml / robots.txt
```

---

## 1. Préparer le serveur

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx mysql-server unzip ufw

# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v
```

Pare-feu :

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 2. Créer la base MySQL

```bash
sudo mysql
```

```sql
CREATE DATABASE aces_global_services CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'aces_user'@'localhost' IDENTIFIED BY 'MOT_DE_PASSE_SOLIDE';
GRANT ALL PRIVILEGES ON aces_global_services.* TO 'aces_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 3. Déployer le code

```bash
sudo adduser --system --group --home /var/www/aces aces
sudo mkdir -p /var/www/aces && sudo chown aces:aces /var/www/aces
sudo -u aces -H bash
cd /var/www/aces
# déposez l'archive puis :
unzip ACES_GLOBAL_SERVICES_CONGO.zip
mv ACES_GLOBAL_SERVICES_CONGO app && cd app
npm ci --omit=dev --workspaces --include-workspace-root || npm install
```

> `npm ci` nécessite un `package-lock.json`. Sinon `npm install` fonctionne mais sans garantie de versions figées.

---

## 4. Configurer l'environnement

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

```dotenv
NODE_ENV=production
PORT=4000
APP_URL=https://www.aces-globalservices.com
API_URL=https://www.aces-globalservices.com
CORS_ORIGINS=https://www.aces-globalservices.com

DATABASE_URL="mysql://aces_user:MOT_DE_PASSE_SOLIDE@localhost:3306/aces_global_services"
DATA_ADAPTER=prisma

JWT_SECRET=COLLEZ_ICI_48_OCTETS_ALEATOIRES
JWT_EXPIRES_IN=8h
AUTH_COOKIE_NAME=aces_session
COOKIE_SECURE=true

UPLOAD_DIR=/var/www/aces/app/backend/uploads
UPLOAD_MAX_SIZE_MB=8

SEED_ADMIN_EMAIL=admin@aces-globalservices.com
SEED_ADMIN_PASSWORD=UN_MOT_DE_PASSE_UNIQUE

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=aces.globalservices@gmail.com
SMTP_PASSWORD=mot-de-passe-application
SMTP_FROM=ACES Global Services <aces.globalservices@gmail.com>
CONTACT_RECEIVER=aces.globalservices@gmail.com
```

Générer la clé : `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

Protéger le fichier :

```bash
chmod 600 backend/.env
mkdir -p backend/uploads
chmod 755 backend/uploads
```

---

## 5. Base de données et données initiales

```bash
npm run db:push
npm run db:seed
```

Notez le mot de passe administrateur choisi via `SEED_ADMIN_*` : il n'est affiché qu'à la création.
Après la première connexion, changez-le immédiatement depuis *Mon profil*.

---

## 6. Compiler l'application

```bash
NODE_ENV=production npm run build
```

Résultat : `backend/dist/` (API) et `frontend/dist/` (site compilé, servi par Express).

Test rapide :

```bash
npm start
# puis, dans un autre terminal
curl http://127.0.0.1:4000/api/health
```

Arrêtez avec `Ctrl + C`.

---

## 7. Service systemd

```bash
sudo nano /etc/systemd/system/aces.service
```

```ini
[Unit]
Description=ACES Global Services (site + API)
After=network.target mysql.service

[Service]
Type=simple
User=aces
Group=aces
WorkingDirectory=/var/www/aces/app/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=5
StandardOutput=append:/var/log/aces/app.log
StandardError=append:/var/log/aces/error.log
# Durcissement
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ReadWritePaths=/var/www/aces/app/backend/uploads

[Install]
WantedBy=multi-user.target
```

```bash
sudo mkdir -p /var/log/aces && sudo chown aces:aces /var/log/aces
sudo systemctl daemon-reload
sudo systemctl enable --now aces
sudo systemctl status aces
sudo journalctl -u aces -f
```

> `WorkingDirectory` pointe sur `backend` car `dist/server.js` y est compilé ; le serveur retrouve
> `frontend/dist` par chemin relatif.

---

## 8. Nginx et HTTPS

```bash
sudo nano /etc/nginx/sites-available/aces
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name www.aces-globalservices.com aces-globalservices.com;

    client_max_body_size 12m;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 90s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/aces /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Certificat gratuit :

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d aces-globalservices.com -d www.aces-globalservices.com
sudo systemctl status certbot.timer   # renouvellement automatique
```

Redirection HTTP→HTTPS et en-têtes HSTS sont ajoutés automatiquement par certbot. Vérifiez ensuite que
`COOKIE_SECURE=true` dans `backend/.env`, puis `sudo systemctl restart aces`.

---

## 9. DNS

Chez le registrar du domaine, créez :

| Type | Nom | Valeur |
| --- | --- | --- |
| A | `@` | IP du VPS |
| A | `www` | IP du VPS |

Propagation : de quelques minutes à quelques heures.

---

## 10. Après la mise en ligne

1. Se connecter à `https://www.aces-globalservices.com/admin` et **changer le mot de passe**.
2. Vérifier *Paramètres* (coordonnées, WhatsApp, logo, SEO) et `APP_URL`.
3. Contrôler `https://www.aces-globalservices.com/sitemap.xml` et `/robots.txt`.
4. Déclarer le site dans **Google Search Console** et soumettre le sitemap.
5. Envoyer un message de test et une demande de devis, vérifier leur arrivée en base et par e-mail.
6. Tester l'import d'une image depuis la médiathèque.
7. Vérifier l'affichage mobile (360 px) et l'accessibilité clavier.

---

## 11. Sauvegardes automatiques

```bash
sudo nano /usr/local/bin/aces-backup.sh
```

```bash
#!/usr/bin/env bash
set -euo pipefail
DEST=/var/backups/aces
mkdir -p "$DEST"
STAMP=$(date +%F-%H%M)

mysqldump --single-transaction -u aces_user -p"$DB_PASS" aces_global_services \
  | gzip > "$DEST/db-$STAMP.sql.gz"
tar czf "$DEST/uploads-$STAMP.tar.gz" -C /var/www/aces/app/backend uploads
find "$DEST" -type f -mtime +30 -delete
```

```bash
sudo chmod +x /usr/local/bin/aces-backup.sh
sudo crontab -e
# tous les jours à 2 h du matin
0 2 * * * DB_PASS='MOT_DE_PASSE_SQL' /usr/local/bin/aces-backup.sh
```

Copiez régulièrement `/var/backups/aces` sur un stockage externe (rsync, S3, autre serveur).

---

## 12. Mise à jour de l'application

```bash
sudo -u aces -H bash
cd /var/www/aces/app
tar czf /tmp/aces-avant-maj.tar.gz .          # filet de sécurité
# remplacez les fichiers (hors backend/.env et backend/uploads)
npm install
npm run db:push
NODE_ENV=production npm run build
exit
sudo systemctl restart aces
```

En cas de problème : `sudo journalctl -u aces -n 100 --no-pager`.

---

## 13. Supervision

| Élément | Commande / outil |
| --- | --- |
| État du service | `sudo systemctl status aces` |
| Journaux applicatifs | `sudo journalctl -u aces -f` |
| Test HTTP | `curl -I https://www.aces-globalservices.com` |
| Santé API | `curl https://www.aces-globalservices.com/api/health` |
| Base | `mysql -u aces_user -p -e "SHOW PROCESSLIST"` |
| Espace disque | `df -h`, `du -sh /var/www/aces/app/backend/uploads` |
| Disponibilité externe | UptimeRobot, BetterStack (gratuit, alerte e-mail) |

---

## 14. Problèmes fréquents en production

| Symptôme | Cause | Solution |
| --- | --- | --- |
| 502 Bad Gateway | service Node arrêté | `systemctl status aces`, consulter les journaux |
| Connexion admin impossible | `COOKIE_SECURE=true` sans HTTPS | activer HTTPS ou repasser à `false` temporairement |
| Boucle de redirection | proxy sans `X-Forwarded-Proto` | ajouter l'en-tête dans Nginx |
| Images 404 | `UPLOAD_DIR` mal configuré | chemin absolu + droits, redémarrer |
| Sitemap avec `localhost` | `APP_URL` non mis à jour | corriger `.env`, redémarrer |
| `ER_ACCESS_DENIED_ERROR` | mauvais identifiants SQL | recréer l'utilisateur MySQL |
| Fichiers envoyés > 8 Mo refusés | limites Multer **et** Nginx | `UPLOAD_MAX_SIZE_MB` et `client_max_body_size` |
| E-mails non reçus | SMTP bloqué par l'hébergeur | tester le port 587, utiliser un service transactionnel |
| Certificat expiré | certbot inactif | `sudo certbot renew --dry-run` |

---

## 15. Liste de contrôle avant livraison au client

- [ ] `NODE_ENV=production`, `COOKIE_SECURE=true`, `DATA_ADAPTER=prisma`
- [ ] `JWT_SECRET` unique et long ; `backend/.env` en `chmod 600`
- [ ] mot de passe administrateur initial changé, comptes nominatifs créés
- [ ] coordonnées, WhatsApp et logo vérifiés dans *Paramètres*
- [ ] SMTP testé (message de contact reçu)
- [ ] sauvegardes quotidiennes actives et restauration testée
- [ ] HTTPS valide, redirection HTTP→HTTPS, en-têtes de sécurité (Helmet)
- [ ] `npm test` exécuté sur le serveur ou en intégration continue
- [ ] sitemap soumis à Google Search Console
- [ ] mention « visuels d'illustration » retirée **uniquement** après remplacement des photos par de vrais chantiers
