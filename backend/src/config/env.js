require('dotenv').config();

const REQUIRED = [
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
];

REQUIRED.forEach((name) => {
  if (!process.env[name]) {
    throw new Error(
      `[env] Missing required environment variable: ${name}\n` +
      `      Add it to your .env file (see .env.example for reference).`
    );
  }
});

const toInt = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
};

const toBool = (value, fallback) =>
  value === undefined ? fallback : value === 'true';

const config = Object.freeze({
  server: Object.freeze({
    port:        toInt(process.env.PORT, 3001),
    nodeEnv:     process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  }),

  database: Object.freeze({
    host:     process.env.DB_HOST,
    port:     toInt(process.env.DB_PORT, 5432),
    name:     process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    ssl:      toBool(process.env.DB_SSL, false),
  }),

  jwt: Object.freeze({
    secret:           process.env.JWT_SECRET,
    expiresIn:        process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret:    process.env.REFRESH_TOKEN_SECRET,
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  }),

  cookie: Object.freeze({
    secure:   toBool(process.env.COOKIE_SECURE, false),
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
  }),

  sendgrid: Object.freeze({
    apiKey:   process.env.SENDGRID_API_KEY || '',
    from:     process.env.EMAIL_FROM     || 'noreply@cubastion.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Cubastion Nexus',
  }),

  upload: Object.freeze({
    dir:         process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: toInt(process.env.MAX_FILE_SIZE, 10 * 1024 * 1024),
  }),

  app: Object.freeze({
    name: process.env.APP_NAME || 'Cubastion Nexus',
    url:  process.env.APP_URL  || 'http://localhost:3001',
  }),
});

module.exports = config;
