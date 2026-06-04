'use strict';

const request = require('supertest');
const app = require('../src/app');
const { reset } = require('../src/data/store');

beforeEach(() => {
  reset();
});

describe('Prescriptions API', () => {
  test('POST /prescriptions avec medicationId inconnu -> 404 not found', async () => {
    const res = await request(app)
      .post('/prescriptions')
      .send({
        patientId: 'pat-0001',
        prescribedBy: 'Dr House',
        issuedAt: '2026-06-01',
        expiresAt: '2026-07-01',
        lines: [{ medicationId: 'med-9999', quantity: 1, dosage: '1/j' }],
      });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/);
  });

  test('POST /prescriptions valide (< 3 mois) -> 201', async () => {
    const res = await request(app)
      .post('/prescriptions')
      .send({
        patientId: 'pat-0001',
        prescribedBy: 'Dr House',
        issuedAt: '2026-06-01',
        expiresAt: '2026-07-01',
        lines: [{ medicationId: 'med-0001', quantity: 1, dosage: '1/j' }],
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  test('POST /prescriptions avec validite > 3 mois -> 400 expired', async () => {
    const res = await request(app)
      .post('/prescriptions')
      .send({
        patientId: 'pat-0001',
        prescribedBy: 'Dr House',
        issuedAt: '2026-06-01',
        expiresAt: '2026-12-01',
        lines: [{ medicationId: 'med-0001', quantity: 1, dosage: '1/j' }],
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/expired/);
  });
});
