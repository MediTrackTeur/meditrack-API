'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { store } = require('../data/store');

const router = express.Router();

// GET / -> liste des patients.
router.get('/', (req, res) => {
  res.json(store.patients);
});

// GET /:id -> un patient (404 si absent).
router.get('/:id', (req, res) => {
  const patient = store.patients.find((p) => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'patient not found' });
  }
  res.json(patient);
});

// POST / -> cree un patient (id genere).
router.post('/', (req, res) => {
  const body = req.body || {};
  const patient = {
    id: uuidv4(),
    lastName: body.lastName,
    firstName: body.firstName,
    birthDate: body.birthDate,
    mutuelle: body.mutuelle,
    allergies: Array.isArray(body.allergies) ? body.allergies : [],
    prescriptions: [],
  };
  store.patients.push(patient);
  res.status(201).json(patient);
});

module.exports = router;
