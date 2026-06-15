import express from 'express';
import { catchAsync } from '../utils/errors.js';

const router = express.Router();

// Helper 1: Callback-style async operation
const simulateDBCallback = (query, callback) => {
  setTimeout(() => {
    if (!query) {
      return callback(new Error('Query is empty'), null);
    }
    callback(null, { query, recordCount: 42, source: 'Callback Database' });
  }, 300);
};

const simulateLogCallback = (data, callback) => {
  setTimeout(() => {
    callback(null, { ...data, loggedAt: new Date().toISOString() });
  }, 200);
};

// Helper 2: Promise-style async operation
const simulateDBPromise = (query) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!query) {
        return reject(new Error('Query is empty'));
      }
      resolve({ query, recordCount: 108, source: 'Promise Database' });
    }, 300);
  });
};

const simulateLogPromise = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...data, loggedAt: new Date().toISOString() });
    }, 200);
  });
};

// ==========================================
// 1. CALLBACK PATTERN (Demonstrates nesting/callback hell)
// ==========================================
router.get('/callbacks', (req, res) => {
  const startTime = Date.now();
  const query = req.query.q || 'SELECT * FROM users';

  console.log('[ASYNC] Executing callback pattern...');
  
  // Call 1: Database call
  simulateDBCallback(query, (dbErr, dbResult) => {
    if (dbErr) {
      console.error('[ASYNC-CALLBACK] Database error:', dbErr.message);
      return res.status(500).json({ status: 'error', message: dbErr.message });
    }

    // Call 2: Logging call (nested - starting the callback hell pyramid)
    simulateLogCallback(dbResult, (logErr, logResult) => {
      if (logErr) {
        console.error('[ASYNC-CALLBACK] Logging error:', logErr.message);
        return res.status(500).json({ status: 'error', message: logErr.message });
      }

      // Return result
      const duration = Date.now() - startTime;
      res.status(200).json({
        pattern: 'Callbacks',
        durationMs: duration,
        message: 'Successfully processed request using nested callbacks',
        data: logResult
      });
    });
  });
});

// ==========================================
// 2. PROMISE PATTERN (Demonstrates method chaining .then/.catch)
// ==========================================
router.get('/promises', (req, res) => {
  const startTime = Date.now();
  const query = req.query.q || 'SELECT * FROM users';

  console.log('[ASYNC] Executing promise chain pattern...');

  // Start Promise chain
  simulateDBPromise(query)
    .then((dbResult) => {
      // Return next Promise for chaining
      return simulateLogPromise(dbResult);
    })
    .then((finalResult) => {
      const duration = Date.now() - startTime;
      res.status(200).json({
        pattern: 'Promises',
        durationMs: duration,
        message: 'Successfully processed request using Promise chaining (.then)',
        data: finalResult
      });
    })
    .catch((err) => {
      console.error('[ASYNC-PROMISE] Promise caught error:', err.message);
      res.status(500).json({ status: 'error', message: err.message });
    });
});

// ==========================================
// 3. ASYNC / AWAIT PATTERN (Modern Node.js best practice)
// ==========================================
// We wrap this with catchAsync so Express errors are safely sent to global error handler
router.get('/async-await', catchAsync(async (req, res) => {
  const startTime = Date.now();
  const query = req.query.q || 'SELECT * FROM users';

  console.log('[ASYNC] Executing async/await pattern...');

  // Simple sequential await that reads like synchronous code
  const dbResult = await simulateDBPromise(query);
  const finalResult = await simulateLogPromise(dbResult);

  const duration = Date.now() - startTime;
  res.status(200).json({
    pattern: 'Async/Await',
    durationMs: duration,
    message: 'Successfully processed request using modern async/await',
    data: finalResult
  });
}));

export default router;
