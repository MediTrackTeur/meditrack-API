# MediTrack-API

API Express de gestion de stock et de suivi des prescriptions en officine pharmaceutique. Donnees medicales sensibles (alertes de reassort, peremptions, prescriptions, allergies patient).

Ce depot est un **point de depart (starter)** pour une formation CI/CD GitHub Actions. Le code applicatif est fonctionnel ; les workflows d'integration et de deploiement sont a ecrire par l'apprenant.

## Prerequis

- Node.js 18 ou plus.

## Installation

```bash
npm install
```

## Scripts

| Script | Description |
| --- | --- |
| `npm start` | Demarre le serveur (`server.js`, port `PORT` ou 3000). |
| `npm run dev` | Demarre avec rechargement (`node --watch`). |
| `npm test` | Lance la suite Jest (`--runInBand`). |
| `npm run test:coverage` | Tests avec rapport de couverture. |
| `npm run lint` | Analyse ESLint. |
| `npm run lint:fix` | ESLint avec correction automatique. |

## Routes

| Methode | Route | Description |
| --- | --- | --- |
| GET | `/health` | Etat du service -> `{ status: 'ok' }`. |
| GET | `/medications` | Liste (`?search=`, pagination `?page` & `?limit`) -> `{ data, page, limit, total }`. |
| GET | `/medications/alerts` | Medicaments actuellement en alerte. |
| GET | `/medications/:id` | Detail d'un medicament (404 si absent). |
| POST | `/medications` | Cree un medicament (201, id genere). |
| PUT | `/medications/:id` | Met a jour (200/404). |
| DELETE | `/medications/:id` | Supprime (204/404). |
| GET | `/alerts` | Alertes non acquittees (via `alertService`). |
| PUT | `/alerts/:id/acknowledge` | Acquitte une alerte (200/404). |
| GET | `/prescriptions` | Liste (`?status=`). |
| GET | `/prescriptions/:id` | Detail (404 si absente). |
| POST | `/prescriptions` | Cree une prescription (voir validations). |
| PUT | `/prescriptions/:id/dispense` | Marque les lignes comme delivrees. |
| DELETE | `/prescriptions/:id` | Supprime (204/404). |
| GET | `/patients` | Liste des patients. |
| GET | `/patients/:id` | Detail (404 si absent). |
| POST | `/patients` | Cree un patient (201). |

### Validations de `POST /prescriptions`

- Toute ligne dont `medicationId` est inconnu -> `404 { error: 'medication not found' }`.
- Validite superieure a 3 mois entre `issuedAt` et `expiresAt` -> `400 { error: 'prescription expired' }`.
- Medicament correspondant a une allergie connue du patient (ex. Amoxicilline vs penicillines) -> `201` avec un tableau `warnings` (ne bloque pas).

## Authentification

Un middleware `requireAuth` (Bearer token) est fourni dans `src/middleware/auth.js`. Il est **volontairement non monte** dans ce starter : les routes restent ouvertes pour que les tests passent sans token. A l'apprenant de le brancher au besoin.

## Secrets et environnements (rappel CI/CD)

- `RENDER_API_KEY` : secret de depot (repository secret).
- `STAGING_DATABASE_URL` et `STAGING_API_KEY` : a definir dans l'environnement `staging` (environment secrets).
- Voir `.env.example` pour les variables locales (ne jamais committer de `.env` reel).

## Workflows GitHub Actions

Le dossier `.github/workflows/` est vide (un simple `.gitkeep`). **Les workflows GitHub Actions sont a creer par l'apprenant** dans `.github/workflows/`.

---

# Rendu TP - Partie 1

## Contexte

Dans le cadre du TP final J4 sur la CI/CD avec GitHub, j'ai mis en place une pipeline d'intégration continue sur ce repo. 
L'objectif est de m'assurer que chaque modification du code ne casse pas les tests existants.

### GitHub Project

J'ai créé un Project GitHub au niveau de l'organisation pour pouvoir regrouper les issues des deux repos (api et front) dans un seul endroit.

J'ai ajouté 3 champs custom :
- **Priorité** (Single select) : P0 à P3 pour trier ce qui bloque de ce qui peut attendre
- **Estimation** (Number) : points de complexité pour estimer la charge
- **Sprint** (Iteration) : pour répartir le travail sur 2 semaines

J'ai créé 2 vues :
- **Backlog OP** (Table) : toutes les issues triées par priorité, utile pour avoir une vision globale du backlog
- **Daily Dev** (Board) : colonnes Backlog / Ready / In Progress / In Review / Done, utile pour le suivi quotidien

J'ai activé l'automatisation native "auto-add" pour que les nouvelles issues soient automatiquement ajoutées au Project.

### Workflow CI Express

J'ai créé `.github/workflows/ci-express.yml` qui se déclenche sur chaque push et pull request sur toutes les branches.

## Rendu TP - Partie 3

### Workflow réutilisable

J'ai extrait la logique commune (checkout + setup-node + npm ci + npm test) dans `.github/workflows/ci-shared.yaml`. Ce fichier s'appelle avec
`on: workflow_call` — il ne se déclenche jamais seul, uniquement quand un autre workflow l'appelle avec `uses:`.

L'intérêt est de ne pas dupliquer les steps entre ci-express et ci-angular.
Si je dois changer la version de Node ou ajouter un step de lint, je le fais en un seul endroit.

Le workflow accepte un input `node-version` pour rester flexible, et utilise `secrets: inherit` côté appelant pour transmettre les secrets sans les lister explicitement.

### Environment staging

J'ai créé un environment `staging` dans Settings > Environments avec deux secrets scopés : `STAGING_DATABASE_URL` et `STAGING_API_KEY`.

Le scope environment est important ici : ces secrets ne sont accessibles qu'aux workflows qui ciblent explicitement l'environment `staging`. 
Un workflow de feature branch ne peut pas y accéder par erreur.

J'ai vérifié le masquage en faisant un `echo` du secret dans les logs — GitHub l'a bien remplacé par `***`, ce qui confirme que la valeur ne fuite pas dans les logs CI.

## Rendu TP - Partie 4

### Déploiement frontend — GitHub Pages

J'ai créé `.github/workflows/deploy-pages.yml` qui se déclenche uniquement sur `main`. Il build Angular en production avec `--base-href /meditrack-FRONT/` — sans ça la page est blanche car Angular génère  des chemins absolus depuis `/` alors que GitHub Pages sert l'app depuis `/meditrack-FRONT/`.

Le workflow utilise `actions/upload-pages-artifact@v3` et `actions/deploy-pages@v4`. Les permissions `pages: write` et `id-token: write` sont obligatoires pour que le workflow puisse publier sur Pages.

### Déploiement backend — Render

J'ai créé `.github/workflows/deploy-render.yml` qui appelle l'API Render via curl pour déclencher un redéploiement à chaque push sur `main`. 
Le secret `RENDER_API_KEY` est scopé au repo et masqué dans les logs.

Le service répond sur `https://meditrack-api-9j8h.onrender.com/health`.

### Automatisation Project

J'ai activé l'automatisation native "Pull request merged → Done" dans le Project. Quand une PR est mergée sur main, l'issue liée passe automatiquement en Done sans intervention manuelle.

## Rendu TP - PArtie 5
## Ce que j'ai mis en place (Palier 5)

### Dependabot

J'ai créé `.github/dependabot.yml` dans les deux repos avec deux ecosystems : `npm` pour les dépendances Node et `github-actions` pour les actions utilisées dans les workflows. La fréquence est `weekly` — Dependabot ouvrira automatiquement des PRs chaque semaine si une nouvelle version est disponible.

### Pin SHA

J'ai remplacé tous les tags mobiles `@v4` par des SHA complets dans tous les workflows. Le SHA garantit que le code exécuté est exactement celui que j'ai vérifié.

J'ai conservé le commentaire `# v4` à côté de chaque SHA pour pouvoir identifier la version sans avoir à rechercher le SHA.

### Branch protection

J'ai activé une ruleset sur `main` dans les deux repos avec :
- PR obligatoire avant tout merge
- 1 approbation requise
- Status checks bloquants (CI doit être verte)
- Force push bloqué

Sans les status checks dans la règle, la protection est cosmétique — on pourrait merger une PR avec une CI rouge. Les status checks bloquants sont la partie critique de la protection.
