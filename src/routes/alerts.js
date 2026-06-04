'use strict';

const express = require('express');
const { store } = require('../data/store');
const { generateAlerts } = require('../services/alertService');

const router = express.Router();

// Liste des ids d'alertes acquittees (en memoire, reinitialise avec le module).
const acknowledged = new Set();

// GET / -> toutes les alertes non acquittees.
router.get('/', (req, res) => {
  const referenceDate = req.query.referenceDate || new Date().toISOString();
  const alerts = generateAlerts(store.medications, referenceDate).filter(
    (a) => !acknowledged.has(a.id)
  );
  res.json(alerts);
});

// PUT /:id/acknowledge -> acquitte une alerte (200/404).
router.put('/:id/acknowledge', (req, res) => {
  const referenceDate = req.query.referenceDate || new Date().toISOString();
  const alerts = generateAlerts(store.medications, referenceDate);
  const alert = alerts.find((a) => a.id === req.params.id);
  if (!alert) {
    return res.status(404).json({ error: 'alert not found' });
  }
  acknowledged.add(alert.id);
  res.json({ ...alert, acknowledged: true });
});

module.exports = router;
