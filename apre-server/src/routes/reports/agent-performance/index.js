/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre agent performance API for the agent performance reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const createError = require('http-errors');

const router = express.Router();

/**
 * Mock totals-by-year dataset (replace with Mongo/Mongoose later)
 * Shape returned to the client: { labels: string[], data: number[] }
 */
const YEAR_TOTALS = {
  2023: { labels: ['Q1','Q2','Q3','Q4'], data: [120,140,135,150] },
  2024: { labels: ['Q1','Q2','Q3','Q4'], data: [160,155,170,180] },
  2025: { labels: ['Q1','Q2','Q3','Q4'], data: [175,182,190,205] }
};

/**
 * GET /by-year?year=2024
 * Returns quarter labels and totals for the given year.
 * Mounted at: /api/reports/agent-performance/by-year
 */
router.get('/by-year', (req, res, next) => {
  try {
    const y = (req.query.year || '').toString().trim();
    const year = Number(y);

    if (!y || Number.isNaN(year)) {
      return next(createError(400, 'Missing or invalid ?year'));
    }

    const found = YEAR_TOTALS[year];
    if (!found) {
      return next(createError(404, 'No performance data for that year.'));
    }

    return res.json(found);
  } catch (err) {
    return next(err);
  }
});

/**
 * @description
 *
 * GET /call-duration-by-date-range
 *
 * Fetches call duration data for agents within a specified date range.
 *
 * Example:
 * /call-duration-by-date-range?startDate=2023-01-01&endDate=2023-01-31
 */
router.get('/call-duration-by-date-range', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, 'Start date and end date are required'));
    }

    console.log('Fetching call duration report for date range:', startDate, endDate);

    mongo(async db => {
      const data = await db.collection('agentPerformance').aggregate([
        {
          $match: {
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $lookup: {
            from: 'agents',
            localField: 'agentId',
            foreignField: 'agentId',
            as: 'agentDetails'
          }
        },
        { $unwind: '$agentDetails' },
        {
          $group: {
            _id: '$agentDetails.name',
            totalCallDuration: { $sum: '$callDuration' }
          }
        },
        {
          $project: {
            _id: 0,
            agent: '$_id',
            callDuration: '$totalCallDuration'
          }
        },
        {
          $group: {
            _id: null,
            agents: { $push: '$agent' },
            callDurations: { $push: '$callDuration' }
          }
        },
        { $project: { _id: 0, agents: 1, callDurations: 1 } }
      ]).toArray();

      res.send(data);
    }, next);
  } catch (err) {
    console.error('Error in /call-duration-by-date-range', err);
    next(err);
  }
});

module.exports = router;
