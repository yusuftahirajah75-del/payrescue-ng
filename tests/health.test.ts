import request from 'supertest';
import { createApp } from '../src/app';

describe('Health & Observability API', () => {
  const app = createApp();

  it('GET /health should return 200 with standard response envelope and requestId', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.service).toBe('payrescue-backend');
    expect(res.body.requestId).toBeDefined();
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('GET /api/v1/health should return 200 with API version metadata', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.version).toBe('1.0.0');
  });

  it('GET /non-existent-route should return 404 with standard error envelope', async () => {
    const res = await request(app).get('/non-existent-route');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
    expect(res.body.requestId).toBeDefined();
  });
});
