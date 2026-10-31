// Main router, mounted at /api. Feature routers (auth, notes) are added here.
const { Router } = require('express');
const mongoose = require('mongoose');

const router = Router();

// Health check: "ok" only when the database connection is also up.
router.get('/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1; // 1 = connected
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? 'ok' : 'degraded', database: dbUp ? 'up' : 'down' });
});

router.use('/auth', require('./auth.routes'));
router.use('/notes', require('./note.routes'));

module.exports = router;
