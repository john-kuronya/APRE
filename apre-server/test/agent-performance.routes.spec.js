/**
 * Author: John Kuronya
 * Date: 11/3/2024
 * File: agent-performance.routes.spec.js
 * Description: Tests for agent-performance.routes.js
 */

import request from 'supertest';
import express from 'express';
import cors from 'cors';
import agentPerformanceRoutes from '../src/routes/agent-performance.routes.js';

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/agent-performance', agentPerformanceRoutes);
  return app;
}

describe('GET /api/agent-performance/by-year', () => {
  it('returns 400 when year is missing or invalid', async () => {
    const app = createApp();
    const res = await request(app).get('/api/agent-performance/by-year');
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it('returns data for a valid year', async () => {
    const app = createApp();
    const res = await request(app).get('/api/agent-performance/by-year?year=2024');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.labels)).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.labels.length).toBe(res.body.data.length);
  });

  it('returns 404 when year not found', async () => {
    const app = createApp();
    const res = await request(app).get('/api/agent-performance/by-year?year=1999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeTruthy();
  });
});
