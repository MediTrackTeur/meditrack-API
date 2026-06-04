'use strict';

const request = require('supertest');
const app = require('../src/app');
const { reset, store } = require('../src/data/store');
const { generateAlerts } = require('../src/services/alertService');

const REFERENCE_DATE = '2026-06-01';

beforeEach(() => {
  reset();
});

describe('alertService.generateAlerts (unitaire)', () => {
  test('genere une alerte restock pour med-0002 et med-0003', () => {
    const alerts = generateAlerts(store.medications, REFERENCE_DATE);
    const restocks = alerts.filter((a) => a.type === 'restock').map((a) => a.medicationId);
    expect(restocks).toContain('med-0002'); // stock 12 <= 30
    expect(restocks).toContain('med-0003'); // stock 5 <= 10
  });

  test('genere au moins une alerte expiry (med-0002, ~9 jours -> warning)', () => {
    const alerts = generateAlerts(store.medications, REFERENCE_DATE);
    const expiry = alerts.find((a) => a.type === 'expiry' && a.medicationId === 'med-0002');
    expect(expiry).toBeDefined();
    expect(expiry.level).toBe('warning');
  });

  test('med-0001 ne genere aucune alerte', () => {
    const alerts = generateAlerts(store.medications, REFERENCE_DATE);
    const forMed1 = alerts.filter((a) => a.medicationId === 'med-0001');
    expect(forMed1).toHaveLength(0);
  });
});

describe('Alerts API', () => {
  test('GET /alerts -> 200, body est un tableau', async () => {
    const res = await request(app).get('/alerts').query({ referenceDate: REFERENCE_DATE });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
