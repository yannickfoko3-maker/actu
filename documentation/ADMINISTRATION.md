# Guide d'administration — ACES Global Services

Le back-office est accessible à l'adresse **`/admin`** du site (par exemple
`https://www.aces-globalservices.com/admin`). Il permet de gérer l'intégralité du contenu sans intervention
technique.

---

## 1. Connexion et sécurité

1. Ouvrez `/admin`.
2. Saisissez l'e-mail et le mot de passe du compte administrateur.
3. La session dure **8 heures** (jeton stocké dans un cookie `httpOnly`, jamais accessible au JavaScript).
4. En cas d'oubli : un administrateur peut réinitialiser le mot de passe depuis *Utilisateurs & rôles* →
   *Modifier*. À défaut d'accès, un technicien peut régénérer un compte avec `npm run db:seed`.

Bonnes pratiques :

- un **compte nominatif par personne** (pas de compte partagé) ;
- mot de passe de 10 caractères minimum, unique, avec lettres et chiffres ;
- changer le mot de passe initial `AcesAdmin2025!` dès la première connexion ;
- ne jamais communiquer un mot de passe par WhatsApp ou e-mail en clair ;
- les tentatives de connexion sont limitées (8 essais / 10 minutes) et journalisées.

---

## 2. Tableau de bord

Affiche en temps réel, depuis la base de données :

- nouvelles demandes de devis et messages non lus ;
- nombre de prestations, articles, réalisations, diapositives, médias et témoignages ;
- graphique d'évolution des demandes (6 derniers mois) ;
- répartition des devis par statut et prestations les plus demandées ;
- dernières demandes, derniers messages et historique d'activité ;
- état de l'environnement (MySQL/Prisma ou mode démonstration, SMTP configuré ou non).

> Si un bandeau **« Mode démonstration actif »** s'affiche, la base MySQL n'est pas utilisée : les données
> sont stockées dans un fichier local et peuvent être perdues. Contactez votre hébergeur.

---

## 3. Prestations

*Contenus → Prestations*. Les 11 prestations du site :

1. Clôture électrique
2. Vidéosurveillance
3. Panneaux solaires
4. Contrôle d'accès
5. Interphone / vidéophone
6. Portails métalliques automatiques
7. Alarme incendie
8. Reconnaissance faciale
9. Badge d'identification
10. SAS d'entrée
11. Géolocalisation GPS

Actions disponibles : créer, modifier, publier/dépublier, réordonner (flèches), supprimer.

L'éditeur d'une prestation comprend :

- **Informations générales** : titre, slug (URL), accroche, description courte, icône, ordre ;
- **Contenu détaillé** : éditeur de texte riche (titres, gras, listes, citations, liens, images) ;
- **Fonctionnalités**, **Étapes d'intervention**, **Questions fréquentes** : listes de paires titre/description ;
- **Avantages**, **Domaines d'utilisation**, **Équipements** : listes simples ;
- **Visuels** : bannière de page et image de couverture ;
- **Galerie** : images additionnelles avec texte alternatif ;
- **SEO** : titre et méta-description ;
- **Publication** : visible ou brouillon, URL publique affichée.

> Renseignez toujours le **texte alternatif** des images (accessibilité et référencement).

---

## 4. Carrousel d'accueil

*Contenus → Carrousel d'accueil*. Chaque diapositive contient : sur-titre, titre, sous-titre, image de fond,
libellés et destinations des deux boutons, ordre et état actif.

- Flèches pour changer l'ordre ;
- icône œil pour activer/désactiver sans supprimer ;
- une seule diapositive suffit ; deux à quatre sont recommandées.

Le voile bleu appliqué sur les images pour la lisibilité du texte est automatique.

---

## 5. Pages

*Contenus → Pages*. Contient les pages institutionnelles et les pages libres :

- **Mentions légales** et **Politique de confidentialité** (pages « système », non supprimables) : les textes
  fournis sont des **modèles à compléter et à valider** (raison sociale, RCCM, NIF, responsable de traitement,
  durées de conservation).
- **Qui sommes-nous** : la page de présentation est gérée comme une page éditoriale ; son contenu s'affiche sur
  `/qui-sommes-nous`.

Chaque page possède un titre, un sous-titre, une image d'en-tête, un contenu riche, des champs SEO et un statut
(publiée / brouillon). Le slug des pages système est verrouillé.

---

## 6. Réalisations

*Contenus → Réalisations*. Fiche : titre, slug, prestation associée, lieu, année, client (facultatif), résumé,
description riche, image de couverture, galerie, ordre, publication et mise en avant.

- Les réalisations **mises en avant** apparaissent sur la page d'accueil.
- La page publique « Nos réalisations » rappelle que les visuels fournis sont des **illustrations** : remplacez-les
  par des photos de vos propres chantiers dès que possible, puis retirez la mention si elle n'est plus nécessaire
  (elle est codée dans la page, pas dans la base — demandez l'intervention d'un développeur).

Ne créez pas de fausses références clients : indiquez uniquement des chantiers réellement réalisés.

---

## 7. Actualités

*Contenus → Actualités*. Article : titre, chapeau, contenu riche, image de couverture, catégorie, tags (séparés par
des virgules), auteur, statut (brouillon, publié, programmé), date de publication, temps de lecture, SEO.

- Les catégories se créent depuis l'éditeur d'article (bouton *Catégorie*).
- La page publique propose recherche, filtres par catégorie et pagination.
- Les articles publiés les plus récents apparaissent sur l'accueil.

---

## 8. Médiathèque

*Contenus → Médiathèque*. Toutes les images du site.

- **Importer** : bouton *Importer des fichiers* ou glisser-déposer (JPG, PNG, WEBP, SVG, GIF — 8 Mo max par fichier,
  10 fichiers par envoi).
- **Copier l'URL** pour la réutiliser ailleurs.
- **Modifier** : texte alternatif et légende.
- **Supprimer** : le fichier est retiré du serveur ; les pages qui l'utilisaient afficheront une image manquante.

Recommandations : images en 1600 px de large maximum, formats JPG/WEBP, poids < 300 Ko pour la performance.
Le repère « Sans texte alt » signale les images à compléter.

Les images importées sont stockées dans `backend/uploads/` : **sauvegardez ce dossier**.

---

## 9. Témoignages

*Contenus → Témoignages*. Nom, fonction, entreprise, note (1 à 5), texte, photo, ordre, publication.

⚠️ **N'inventez aucun témoignage.** Tant qu'aucun avis n'est publié, la section correspondante n'apparaît pas sur
le site. Recueillez l'accord écrit du client avant publication.

---

## 10. Messages

*Commercial → Messages*. Formulaire de contact.

- Liste filtrable (tous / non lus / lus / archivés) et zone de lecture détaillée ;
- boutons **Répondre par e-mail** (envoi direct si SMTP configuré), **Ouvrir dans la messagerie**, **Appeler** ;
- marquer comme lu / non lu, archiver, supprimer.

Sans SMTP, la réponse n'est pas envoyée : le back-office affiche un message d'information et l'action est
journalisée. Utilisez alors le lien `mailto:`.

---

## 11. Demandes de devis

*Commercial → Demandes de devis*. Chaque demande contient : nom, entreprise, e-mail, téléphone, ville, prestation,
description du projet, budget, moyen de contact préféré, consentement, date.

- Filtres par statut : **Nouveau**, **En cours**, **Traité**, **Archivé** ;
- panneau de détail avec **statut**, **notes internes**, liens de réponse (e-mail, WhatsApp, appel) ;
- **Export CSV** de la liste filtrée (ouvrable dans Excel/LibreOffice) ;
- suppression définitive.

Bon suivi : traiter les demandes **sous 24 à 48 heures ouvrées** (engagement affiché sur le site), consigner la
visite technique puis le devis dans les notes internes.

---

## 12. Paramètres du site

*Administration → Paramètres*. Groupes :

| Groupe | Contenu |
| --- | --- |
| Identité | nom, raison sociale, slogan, signature, présentation |
| Coordonnées | téléphones, WhatsApp, e-mail, adresse, ville, pays, horaires, message WhatsApp, carte |
| Marque | logo, logo détouré, favicon |
| Réseaux sociaux | Facebook, LinkedIn, Instagram, YouTube |
| SEO | nom du site, titre et description par défaut, mots-clés, image de partage |
| Formulaires | messages de confirmation contact et devis |
| Pied de page | texte de présentation |
| Légal | informations légales |

Les modifications sont immédiatement visibles sur le site. Champs sensibles :

- **Numéro WhatsApp** : indicatif pays, sans `+`, sans espace (ex. `242065390297`) ;
- **Téléphone (format international)** : utilisé pour les liens `tel:` (ex. `+242065390297`) ;
- **URL d'intégration de la carte** : adresse `https://www.openstreetmap.org/export/embed.html?...`.

Les variables techniques (base de données, SMTP, clé JWT) ne sont **pas** modifiables depuis l'interface : elles
vivent dans `backend/.env`.

---

## 13. Utilisateurs et rôles

*Administration → Utilisateurs & rôles*.

- **Créer un utilisateur** : nom, e-mail, rôle, mot de passe (10 caractères minimum, lettres + chiffres).
- **Modifier** : changement de rôle, réinitialisation du mot de passe, activation/désactivation.
- **Supprimer** : impossible pour son propre compte.

Rôles livrés :

| Rôle | Droits |
| --- | --- |
| Super administrateur | tout, y compris utilisateurs et paramètres |
| Administrateur | contenus, demandes commerciales, paramètres |
| Éditeur | contenus (prestations, pages, réalisations, actualités, médias), sans accès aux utilisateurs |

Le bouton *Nouveau rôle* permet de composer un rôle sur mesure : chaque permission (services, pages, carrousel,
réalisations, actualités, médias, témoignages, messages, devis, paramètres, utilisateurs, journal) peut être
accordée individuellement.

---

## 14. Journal d'activité

*Administration → Journal d'activité*. Historique horodaté : connexions, créations, modifications, suppressions,
publications, avec utilisateur et adresse IP. Filtrage par type d'action et recherche libre.

Le journal est conservé en base ; purgez les entrées anciennes si nécessaire (intervention technique).

---

## 15. Publications et cycle de contenu conseillé

1. **Créer en brouillon**, relire (orthographe, coordonnées, texte alternatif des images).
2. **Prévisualiser** via le bouton « Voir la page » (uniquement pour le contenu publié).
3. **Publier**, puis vérifier sur le site public (ordinateur et mobile).
4. **Mettre à jour** les contenus saisonniers (carrousel, actualités) au moins une fois par trimestre.

---

## 16. Sauvegarde et maintenance

- Sauvegarde **quotidienne** de la base MySQL et du dossier `backend/uploads`.
- Mise à jour des dépendances : `npm audit` puis `npm update` sur un environnement de test.
- Renouvellement du certificat HTTPS (automatique avec Let's Encrypt).
- Changement des mots de passe administrateurs tous les 6 à 12 mois.
- Contrôle mensuel du journal d'activité (connexions inhabituelles).

---

## 17. Questions fréquentes

**Comment changer le numéro WhatsApp ?**
*Paramètres → Coordonnées → Numéro WhatsApp* (sans `+`), puis *Téléphone affiché* et *Téléphone (format
international)*.

**Comment modifier le logo ?**
*Paramètres → Marque*. Utilisez un logo horizontal sur fond clair (le logo fourni est utilisé tel quel, sans
déformation).

**Puis-je masquer une prestation sans la supprimer ?**
Oui : icône œil dans la liste (dépublier). Elle disparaît du site mais reste éditable.

**Un message n'est pas arrivé par e-mail.**
Vérifiez la configuration SMTP (`backend/.env`) et le tableau de bord. La demande reste de toute façon visible dans
le back-office.

**Comment exporter les demandes de devis ?**
*Demandes de devis → Exporter en CSV*. L'export respecte le filtre de statut actif.

**Le site affiche « Mode démonstration ».**
Le serveur n'utilise pas MySQL (`DATA_ADAPTER=memory`). Configurez `DATA_ADAPTER=prisma` et `DATABASE_URL`.
