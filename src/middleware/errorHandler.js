'use strict';

// 404 pour toute route non reconnue.
function notFound(req, res, _next) {
  res.status(404).json({ error: 'route not found' });
}

// Gestionnaire d'erreurs centralise (doit etre monte en dernier).
function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'internal server error' });
}

module.exports = { notFound, errorHandler };
