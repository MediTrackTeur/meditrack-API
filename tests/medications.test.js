'use strict';

const request = require('supertest');
const app = require('../src/app');
const { reset } = require('../src/data/store');

beforeEach(() => {
  reset();
});

describe('Medications API', () => {
  test('GET /health -> 200 status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /medications -> 200, data est un tableau contenant med-0001', async () => {
    const res = await request(app).get('/medications');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    const ids = res.body.data.map((m) => m.id);
    expect(ids).toContain('med-0001');
  });

  test('GET /medications/med-0001 -> 200', async () => {
    const res = await request(app).get('/medications/med-0001');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('med-0001');
  });

  test('GET /medications/med-9999 -> 404', async () => {
    const res = await request(app).get('/medications/med-9999');
    expect(res.status).toBe(404);
  });

  test('POST /medications valide -> 201 avec un id', async () => {
    const res = await request(app)
      .post('/medications')
      .send({ name: 'Aspirine 500mg', dci: 'Acide acetylsalicylique', form: 'comprime', stock: 100 });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });
});
