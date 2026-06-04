'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { store } = require('../data/store');
const { generateAlerts } = require('../services/alertService');

const router = express.Router();

// GET / -> liste avec recherche (?search=) et pagination (?page&?limit).
router.get('/', (req, res) => {
  const search = (req.query.search || '').toLowerCase();
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);

  let items = store.medications;
  if (search) {
    items = items.filter(
      (m) =>
        m.name.toLowerCase().includes(search) ||
        m.dci.toLowerCase().includes(search)
    );
  }

  const total = items.length;
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);

  res.json({ data, page, limit, total });
});

// GET /alerts -> medicaments actuellement en alerte (date du jour).
router.get('/alerts', (req, res) => {
  const referenceDate = req.query.referenceDate || new Date().toISOString();
  const alerts = generateAlerts(store.medications, referenceDate);
  res.json(alerts);
});

// GET /:id -> un medicament (404 si absent).
router.get('/:id', (req, res) => {
  const med = store.medications.find((m) => m.id === req.params.id);
  if (!med) {
    return res.status(404).json({ error: 'medication not found' });
  }
  res.json(med);
});

// POST / -> cree un medicament (id genere).
router.post('/', (req, res) => {
  const body = req.body || {};
  const med = {
    id: uuidv4(),
    name: body.name,
    dci: body.dci,
    form: body.form,
    stock: body.stock != null ? body.stock : 0,
    threshold: body.threshold != null ? body.threshold : 20,
    expiresAt: body.expiresAt,
    supplierId: body.supplierId,
    price: body.price,
  };
  store.medications.push(med);
  res.status(201).json(med);
});

// PUT /:id -> met a jour un medicament (200/404).
router.put('/:id', (req, res) => {
  const med = store.medications.find((m) => m.id === req.params.id);
  if (!med) {
    return res.status(404).json({ error: 'medication not found' });
  }
  Object.assign(med, req.body || {}, { id: med.id });
  res.json(med);
});

// DELETE /:id -> supprime (204/404).
router.delete('/:id', (req, res) => {
  const idx = store.medications.findIndex((m) => m.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'medication not found' });
  }
  store.medications.splice(idx, 1);
  res.status(204).end();
});

module.exports = router;
