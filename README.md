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
