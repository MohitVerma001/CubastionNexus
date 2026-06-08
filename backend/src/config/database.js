const { Pool } = require('pg');
const config   = require('./env');
const logger   = require('../utils/logger');

const { host, port, name, user, password, ssl } = config.database;

const pool = new Pool({
  host,
  port,
  database: name,
  user,
  password,
  ssl: ssl ? { rejectUnauthorized: false } : false,
  max:                  20,
  idleTimeoutMillis:    30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle database client', { message: err.message });
  process.exit(-1);
});

// Verify the connection once at startup; fail fast if the DB is unreachable.
pool.connect()
  .then((client) => {
    client.release();
    logger.info('Database connection established', { host, database: name });
  })
  .catch((err) => {
    logger.error('Database connection failed', { host, database: name, message: err.message });
    process.exit(1);
  });

/**
 * Execute a parameterised SQL query.
 * @param {string} sql - The SQL statement.
 * @param {Array}  [params] - Positional parameters for the statement.
 */
const query = async (sql, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(sql, params);
    logger.debug('Query executed', { duration: `${Date.now() - start}ms`, rows: result.rowCount });
    return result;
  } catch (err) {
    // Never include params in the error log — they may contain sensitive data.
    logger.error('Query failed', { message: err.message, duration: `${Date.now() - start}ms` });
    throw err;
  }
};

/**
 * Acquire a dedicated client from the pool (use for transactions).
 * Caller is responsible for calling client.release().
 */
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };
