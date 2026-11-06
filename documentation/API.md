# Référence de l'API — ACES Global Services

API REST JSON servie par le backend Express.

- Base en développement : `http://localhost:4000/api`
- Base en production : `https://www.aces-globalservices.com/api` (ou votre domaine)
- Réponses et corps de requête : **JSON UTF-8**

---

## 1. Conventions

### Succès

```json
{ "success": true, "data": { "...": "..." } }
```

### Liste paginée

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
  }
}
```

Paramètres : `?page=1&limit=20` (`limit` maximal dépend de la ressource, 100 en général), plus `search`,
`status`, `category`, `tag` selon l'endpoint.

### Erreur

```json
{
  "success": false,
  "error": {
    "message": "Message lisible en français.",
    "code": "VALIDATION_ERROR",
    "details": [{ "path": "email", "message": "Adresse e-mail invalide." }]
  }
}
```

| Code HTTP | Signification |
| --- | --- |
| 200 | succès |
| 201 | ressource créée |
| 400 | données invalides |
| 401 | authentification absente ou expirée |
| 403 | permission insuffisante / jeton CSRF invalide |
| 404 | ressource introuvable |
| 409 | conflit (slug ou e-mail déjà utilisé) |
| 413 | fichier trop volumineux |
| 429 | trop de requêtes (limitation de débit) |
| 500 | erreur serveur |

---

## 2. Authentification

### `POST /api/auth/login`

```json
{ "email": "admin@aces-globalservices.com", "password": "AcesAdmin2025!" }
```

Réponse `200` :

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "usr_...",
      "name": "Administrateur ACES",
      "email": "admin@aces-globalservices.com",
      "roleId": "role_super",
      "role": { "name": "super-admin", "label": "Super administrateur", "permissions": ["*"] }
    }
  }
}
```

Deux cookies sont déposés :

| Cookie | Rôle |
| --- | --- |
| `aces_session` | jeton JWT `httpOnly` (8 h) |
| `aces_csrf` | jeton CSRF lisible par le navigateur |

Deux modes d'appel sont acceptés pour les routes protégées :

1. **cookie** `aces_session` (utilisé par le back-office) → ajoutez l'en-tête `X-CSRF-Token` avec la valeur du
   cookie `aces_csrf` pour toute requête `POST/PUT/PATCH/DELETE` ;
2. **en-tête** `Authorization: Bearer <token>` (scripts, intégrations) → CSRF non requis.

### Autres routes d'authentification

| Méthode | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/logout` | déconnexion (efface les cookies) |
| `GET` | `/api/auth/me` | profil, rôle et permissions du compte connecté |
| `GET` | `/api/auth/can/:permission` | vérifie une permission (`{"allowed":true}`) |
| `POST` | `/api/auth/password` | changement de mot de passe : `currentPassword`, `newPassword`, `confirmPassword` |

### Limitation de débit

| Portée | Limite |
| --- | --- |
| API globale | 400 requêtes / 15 min / IP |
| Formulaires publics (`/messages`, `/quotes`) | 12 requêtes / 15 min / IP |
| Connexion | 8 tentatives / 10 min / IP |

Réglable via `RATE_LIMIT_*` dans `backend/.env`.

---

## 3. Santé

### `GET /api/health`

```json
{ "success": true, "data": { "status": "ok", "uptime": 42.1, "timestamp": "2026-02-10T09:00:00.000Z" } }
```

---

## 4. Endpoints publics — `/api/public`

Aucune authentification. Seules les ressources **publiées** sont renvoyées.

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/site` | amorçage du site : `settings`, `slides`, `navigation` (cartes prestations) |
| `GET` | `/home` | contenus de la page d'accueil (prestations, réalisations en vedette, articles, témoignages) |
| `GET` | `/settings` | paramètres publics uniquement |
| `GET` | `/sitemap-data` | données utilisées pour le sitemap |
| `GET` | `/services` | prestations publiées, triées par `order` |
| `GET` | `/services/:slug` | prestation complète + `toc`, `relatedServices`, `relatedProjects` |
| `GET` | `/pages` | pages publiées |
| `GET` | `/pages/:slug` | page complète (`content` HTML) |
| `GET` | `/hero` | diapositives actives du carrousel |
| `GET` | `/projects` | réalisations publiées (`?category=slug&featured=true&page=1&limit=12`) |
| `GET` | `/projects/:slug` | fiche projet + galerie + projets liés |
| `GET` | `/articles` | articles publiés (`?category=slug&tag=…&search=…&page=1&limit=9`) |
| `GET` | `/articles/:slug` | article complet + articles liés ; incrémente le compteur de vues |
| `GET` | `/categories` | catégories d'articles |
| `GET` | `/testimonials` | témoignages publiés (liste vide si aucun avis réel) |

### Formulaires

#### `POST /api/public/messages`

```json
{
  "name": "Jean Mbaye",
  "email": "jean@example.com",
  "phone": "+236 70 00 00 00",
  "subject": "Demande d'information",
  "message": "Bonjour, je souhaite un devis pour 6 caméras.",
  "consent": true,
  "honeypot": ""
}
```

`201` → `{ "success": true, "data": { "id": "msg_...", "message": "Merci, votre message…" } }`

Règles : `name` 2–120 caractères, e-mail valide, téléphone au format international, `message` ≥ 20 caractères,
`consent` obligatoire, `honeypot` doit rester vide.

#### `POST /api/public/quotes`

```json
{
  "name": "Société Test",
  "company": "Test SARL",
  "email": "contact@test-sarl.cf",
  "phone": "+236 72 00 00 00",
  "city": "Bangui",
  "serviceSlug": "videosurveillance",
  "serviceTitle": "Vidéosurveillance",
  "projectDescription": "Équipement de 8 caméras pour un entrepôt de 400 m².",
  "budget": "1 000 000 – 3 000 000 FCFA",
  "preferredContact": "whatsapp",
  "consent": true
}
```

`201` → `{ "success": true, "data": { "id": "qte_...", "message": "Merci, votre demande de devis…" } }`

`preferredContact` ∈ `phone | email | whatsapp`. `consent` doit valoir `true`.

---

## 5. Endpoints d'administration — `/api/admin`

Authentification **et** permission requises. Les permissions sont vérifiées route par route.

### Tableau de bord et journal

| Méthode | Route | Permission | Description |
| --- | --- | --- | --- |
| `GET` | `/stats` | `dashboard.read` | compteurs, graphiques, dernières demandes, activité |
| `GET` | `/activity-logs` | `logs.read` | `?search=&action=&page=&limit=` |

### Prestations

| Méthode | Route | Permission |
| --- | --- | --- |
| `GET` | `/services` | `services.read` |
| `GET` | `/services/:id` | `services.read` |
| `POST` | `/services` | `services.write` |
| `PUT` | `/services/:id` | `services.write` (remplacement complet) |
| `PATCH` | `/services/:id/publish` | `services.write` |
| `PATCH` | `/services/reorder` | `services.write` (`{ "items": [{ "id": "…", "order": 2 }] }`) |
| `DELETE` | `/services/:id` | `services.delete` |

### Carrousel

`GET /hero`, `POST /hero`, `PUT /hero/:id`, `PATCH /hero/:id/toggle`, `PATCH /hero/reorder`,
`DELETE /hero/:id` — permission `hero.write`.

### Pages, réalisations, actualités, catégories

| Méthode | Route | Permission |
| --- | --- | --- |
| `GET/POST/PUT/DELETE` | `/pages[/:id]` | `pages.read` / `pages.write` |
| `GET/POST/PUT/DELETE` | `/projects[/:id]` | `projects.write` |
| `PATCH` | `/projects/:id/publish` | `projects.write` |
| `GET/POST/PUT/DELETE` | `/articles[/:id]` | `articles.write` |
| `PATCH` | `/articles/:id/status` | `articles.write` (`{ "status": "PUBLISHED" }`) |
| `POST/PUT/DELETE` | `/categories[/:id]` | `articles.write` |

### Médiathèque

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/media` | `?search=&page=&limit=` |
| `GET` | `/media/stats` | nombre de fichiers et volume total |
| `POST` | `/media` | `multipart/form-data`, champ `files` (10 fichiers max, 8 Mo par fichier) |
| `PATCH` | `/media/:id` | `alt`, `caption` |
| `DELETE` | `/media/:id` | supprime l'enregistrement et le fichier |

Les fichiers sont servis sous `/uploads/<nom-fichier>`.

### Témoignages

`GET /testimonials`, `POST /testimonials`, `PUT /testimonials/:id`, `PATCH /testimonials/:id/publish`,
`DELETE /testimonials/:id` — permission `testimonials.write`.

### Messages

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/messages` | liste paginée, `?status=NEW&search=` |
| `GET` | `/messages/:id` | détail |
| `PATCH` | `/messages/:id` | `{ "status": "READ" }` |
| `POST` | `/messages/:id/reply` | `{ "subject", "message" }` → e-mail si SMTP configuré |
| `DELETE` | `/messages/:id` | suppression |

### Demandes de devis

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/quotes` | liste paginée, `?status=&search=` |
| `GET` | `/quotes/export` | **CSV** (`text/csv`), `?status=` facultatif |
| `GET` | `/quotes/:id` | détail |
| `PATCH` | `/quotes/:id` | `{ "status": "IN_PROGRESS", "internalNotes": "…" }` |
| `DELETE` | `/quotes/:id` | suppression |

Statuts : `NEW`, `IN_PROGRESS`, `DONE`, `ARCHIVED`.

### Paramètres

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/settings` | paramètres groupés + état de l'environnement |
| `PUT` | `/settings` | objet clé/valeur partiel, ex. `{ "company.phone2": "+236 …" }` |

### Utilisateurs et rôles

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/users` | utilisateurs + rôles + catalogue de permissions |
| `POST` | `/users` | `name`, `email`, `password` (≥ 10 caractères, lettres + chiffres), `roleId`, `isActive` |
| `PUT` | `/users/:id` | mêmes champs, `password` facultatif |
| `DELETE` | `/users/:id` | suppression (impossible pour son propre compte) |
| `POST` | `/roles` | `name`, `label`, `description`, `permissions[]` |

---

## 6. Exemples avec `curl`

```bash
# Santé
curl http://localhost:4000/api/health

# Prestations publiées
curl http://localhost:4000/api/public/services

# Connexion et récupération du jeton
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@aces-globalservices.com","password":"AcesAdmin2025!"}' \
  | node -pe 'JSON.parse(require("fs").readFileSync(0)).data.token')

# Statistiques
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/admin/stats

# Export CSV
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/admin/quotes/export -o devis.csv

# Envoi d'une demande de devis
curl -X POST http://localhost:4000/api/public/quotes \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"Société Test",
    "email":"contact@test-sarl.cf",
    "phone":"+236 72 00 00 00",
    "city":"Bangui",
    "serviceSlug":"videosurveillance",
    "serviceTitle":"Vidéosurveillance",
    "projectDescription":"Équipement de 8 caméras pour un entrepôt de 400 m².",
    "preferredContact":"phone",
    "consent":true
  }'
```

### Exemple avec cookie + CSRF (navigateur)

```js
const login = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password }),
});

const csrf = document.cookie
  .split('; ')
  .find((row) => row.startsWith('aces_csrf='))
  ?.split('=')[1];

await fetch('/api/admin/settings', {
  method: 'PUT',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
  body: JSON.stringify({ 'company.phone2': '+236 70 11 22 33' }),
});
```

---

## 7. Upload de fichiers

```bash
curl -X POST http://localhost:4000/api/admin/media \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@photo-chantier.jpg" \
  -F "files=@photo-equipe.jpg"
```

Formats acceptés : `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`.
Taille maximale par fichier : `UPLOAD_MAX_SIZE_MB` (8 Mo par défaut). Noms de fichiers générés aléatoirement.

---

## 8. Codes de validation courants

| Champ | Règle |
| --- | --- |
| `name` | 2 à 120 caractères |
| `email` | format e-mail valide |
| `phone` | format international (`+242 06 539 0297`, `+236 70 00 00 00`, espaces et tirets tolérés) |
| `message` / `projectDescription` | 20 caractères minimum |
| `consent` | doit être `true` |
| `slug` | minuscules, chiffres et tirets uniquement |
| `password` | 10 caractères minimum, au moins une lettre et un chiffre |
| `rating` | entier de 1 à 5 |
| `status` (devis) | `NEW`, `IN_PROGRESS`, `DONE`, `ARCHIVED` |
| `status` (article) | `DRAFT`, `PUBLISHED`, `SCHEDULED` |
| `status` (page) | `DRAFT`, `PUBLISHED` |

---

## 9. Fichiers générés par le serveur

| Route | Contenu |
| --- | --- |
| `GET /sitemap.xml` | plan du site (pages statiques, prestations, réalisations, articles, pages CMS) |
| `GET /robots.txt` | autorisation d'indexation, exclusion de `/admin` et `/api` |
| `GET /uploads/*` | images importées depuis la médiathèque |

L'URL de base du sitemap provient du paramètre `seo.siteUrl` s'il est défini, sinon de `APP_URL`.
