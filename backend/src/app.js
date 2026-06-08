// env.js must be loaded first — it validates required variables and calls dotenv
const config = require('./config/env');

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const compression  = require('compression');
const cookieParser = require('cookie-parser');
const path         = require('path');

const { apiLimiter }          = require('./middleware/rateLimiter.middleware');
const { errorHandler }        = require('./middleware/errorHandler.middleware');
const routes                  = require('./routes');
const logger                  = require('./utils/logger');
const { pool }                = require('./config/database');
const { startSLACheckJob }    = require('./jobs/slaCheck.job');

const app  = express();
const PORT = config.server.port;

// ── Security & compression ────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin:         config.server.frontendUrl,
  credentials:    true,
  methods:        ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body & cookie parsing ─────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Static file serving (uploaded attachments) ────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Health check (no rate-limit, no auth) ────────────────────────────────────
app.get('/health', async (_req, res) => {
  let dbStatus = 'connected';
  try {
    const client = await pool.connect();
    client.release();
  } catch {
    dbStatus = 'error';
  }
  res.json({
    status:      'ok',
    timestamp:   new Date().toISOString(),
    environment: config.server.nodeEnv,
    database:    dbStatus,
  });
});

// ── API routes (routes/index.js owns the /api/v1 prefix) ─────────────────────
// apiLimiter is applied per-route inside index.js so the webhook route is excluded
app.use(routes);

// ── 404 — must come after all routes ─────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler — must be last ──────────────────────────────────────
app.use(errorHandler);

// ── Server startup ────────────────────────────────────────────────────────────
const start = async () => {
  try {
    const client = await pool.connect();
    client.release();
    logger.info('Database connection verified');

    startSLACheckJob();
    logger.info('SLA check job started (every 15 minutes)');

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT} [${config.server.nodeEnv}]`);
    });
  } catch (err) {
    logger.error('Startup failed', { message: err.message });
    process.exit(1);
  }
};

start();

module.exports = app;
