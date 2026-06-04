'use strict';

// Middleware d'authentification Bearer.
// Fourni dans le starter mais NON monte globalement : les routes restent
// ouvertes pour que les tests passent sans token. A l'apprenant de le brancher.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  return next();
}

module.exports = { requireAuth };
