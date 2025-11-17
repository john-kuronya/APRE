const request = require('supertest');
const express = require('express');
const router = require('../src/routes/reports/customer-feedback'); // adjust if needed

// Mock the mongo util so we don't hit a real database
jest.mock('../src/utils/mongo', () => ({
  mongo: (callback, next) => {
    const mockDb = {
      collection: () => ({
        aggregate: () => ({
          toArray: async () => [
            {
              channels: ['Email', 'Phone'],
              ratingAvg: [[4.5], [3.5]]
            }
          ]
        })
      })
    };
    return callback(mockDb);
  }
}));

describe('GET /channel-rating-by-month', () => {
  const app = express();
  app.use('/api/reports/customer-feedback', router);

  it('returns 400 when month is missing', async () => {
    const res = await request(app).get('/api/reports/customer-feedback/channel-rating-by-month');
    expect(res.status).toBe(400);
  });

  it('returns empty array when Mongo returns no data', async () => {
    // Override mock to return []
    const mongoModule = require('../src/utils/mongo');
    mongoModule.mongo = jest.fn().mockImplementationOnce((callback, next) => {
      const mockDb = {
        collection: () => ({
          aggregate: () => ({
            toArray: async () => []
          })
        })
      };
      return callback(mockDb);
    });

    const res = await request(app)
      .get('/api/reports/customer-feedback/channel-rating-by-month')
      .query({ month: 12 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns channels and ratingAvg when data exists', async () => {
    const res = await request(app)
      .get('/api/reports/customer-feedback/channel-rating-by-month')
      .query({ month: 1 });

    expect(res.status).toBe(200);
    expect(res.body[0].channels).toEqual(['Email', 'Phone']);
    expect(res.body[0].ratingAvg).toEqual([[4.5], [3.5]]);
  });
});
