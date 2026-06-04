'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { store } = require('../data/store');

const router = express.Router();

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// GET / -> liste, filtrable par ?status=.
router.get('/', (req, res) => {
  let items = store.prescriptions;
  if (req.query.status) {
    items = items.filter((p) => p.status === req.query.status);
  }
  res.json(items);
});

// GET /:id -> une prescription (404 si absente).
router.get('/:id', (req, res) => {
  const presc = store.prescriptions.find((p) => p.id === req.params.id);
  if (!presc) {
    return res.status(404).json({ error: 'prescription not found' });
  }
  res.json(presc);
});

// POST / -> cree une prescription avec validations metier.
router.post('/', (req, res) => {
  const body = req.body || {};
  const { patientId, prescribedBy, issuedAt, expiresAt } = body;
  const lines = Array.isArray(body.lines) ? body.lines : [];

  // Validite max 3 mois entre issuedAt et expiresAt.
  if (issuedAt && expiresAt) {
    const issued = new Date(issuedAt);
    const expires = new Date(expiresAt);
    const maxExpiry = new Date(issued.getTime());
    maxExpiry.setMonth(maxExpiry.getMonth() + 3);
    // petite tolerance d'un jour pour les arrondis de date
    if (expires.getTime() - maxExpiry.getTime() > MS_PER_DAY) {
      return res.status(400).json({ error: 'prescription expired' });
    }
  }

  // Chaque ligne doit referencer un medicament existant.
  const patient = store.patients.find((p) => p.id === patientId);
  const allergies = patient && Array.isArray(patient.allergies) ? patient.allergies : [];
  const warnings = [];

  for (const line of lines) {
    const med = store.medications.find((m) => m.id === line.medicationId);
    if (!med) {
      return res.status(404).json({ error: 'medication not found' });
    }
    // Detection simple d'allergie sur la DCI / le nom du medicament.
    const haystack = (med.dci + ' ' + med.name).toLowerCase();
    for (const allergy of allergies) {
      const root = String(allergy).toLowerCase().replace(/s$/, '');
      // Cas pedagogique : les penicillines couvrent l'amoxicilline.
      const isPenicillinFamily =
        root.startsWith('penicill') &&
        (haystack.includes('amoxicill') || haystack.includes('penicill'));
      if (haystack.includes(root) || isPenicillinFamily) {
        warnings.push(`Allergie possible : ${med.name} (${med.dci}) vs ${allergy}`);
      }
    }
  }

  const prescription = {
    id: uuidv4(),
    patientId,
    prescribedBy,
    issuedAt,
    expiresAt,
    status: 'active',
    lines: lines.map((l) => ({
      medicationId: l.medicationId,
      quantity: l.quantity,
      dosage: l.dosage,
      dispensed: false,
    })),
  };

  store.prescriptions.push(prescription);

  const response = { ...prescription };
  if (warnings.length > 0) {
    response.warnings = warnings;
  }
  res.status(201).json(response);
});

// PUT /:id/dispense -> marque les lignes comme delivrees.
router.put('/:id/dispense', (req, res) => {
  const presc = store.prescriptions.find((p) => p.id === req.params.id);
  if (!presc) {
    return res.status(404).json({ error: 'prescription not found' });
  }
  presc.lines.forEach((l) => {
    l.dispensed = true;
  });
  presc.status = 'completed';
  res.json(presc);
});

// DELETE /:id -> supprime (204/404).
router.delete('/:id', (req, res) => {
  const idx = store.prescriptions.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'prescription not found' });
  }
  store.prescriptions.splice(idx, 1);
  res.status(204).end();
});

module.exports = router;
