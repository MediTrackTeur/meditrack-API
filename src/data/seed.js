'use strict';

// Donnees de seed (immuables). Le store en repart via une copie profonde.
const medications = [
  { id: 'med-0001', name: 'Amoxicilline 500mg', dci: 'Amoxicilline', form: 'capsule', stock: 48, threshold: 20, expiresAt: '2027-03-01', price: 3.20 },
  { id: 'med-0002', name: 'Doliprane 1000mg', dci: 'Paracetamol', form: 'comprime', stock: 12, threshold: 30, expiresAt: '2026-06-10', price: 2.50 },
  { id: 'med-0003', name: 'Ventoline 100 microg', dci: 'Salbutamol', form: 'inhalateur', stock: 5, threshold: 10, expiresAt: '2026-12-31', price: 7.80 },
];

const patients = [
  { id: 'pat-0001', lastName: 'Martin', firstName: 'Sophie', birthDate: '1985-03-22', mutuelle: 'MGEN', allergies: ['penicillines'], prescriptions: [] },
];

const prescriptions = [];

module.exports = { medications, patients, prescriptions };
