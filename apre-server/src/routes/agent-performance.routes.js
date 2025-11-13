/**
 * Author: John Kuronya
 * Date: 11/3/2024
 * File: agent-performance.routes.js
 * Description: Routes for agent performance data.
 */

import { Router } from 'express';
const router = Router();

/**
 * Mock dataset keyed by year.
 * I can replace with MongoDB/Mongoose later.
 */
const DATA = {
  2023: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    data: [120, 140, 135, 150], // e.g., total tickets resolved per quarter
  },
  2024: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    data: [160, 155, 170, 180],
  },
  2025: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    data: [175, 182, 190, 205],
  }
};

/**
 * GET /api/agent-performance/by-year?year=2024
 * Returns { labels: string[], data: number[] }
 */
router.get('/by-year', (req, res) => {
  const y = (req.query.year || '').toString().trim();
  const year = Number(y);

  if (!y || Number.isNaN(year)) {
    return res.status(400).json({ error: 'Missing or invalid ?year' });
  }

  const found = DATA[year];
  if (!found) {
    return res.status(404).json({ error: 'No performance data for the requested year.' });
  }

  return res.json(found);
});

export default router;
