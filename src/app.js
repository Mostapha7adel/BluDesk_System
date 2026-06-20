const cluster = require('cluster');
const os = require('os');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const path = require('path');

const config = require('./config');
config.validateJwtSecrets();
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');
const { handleUploadError } = require('./middlewares/upload');
const logger = require('./utils/logger');

const numCPUs = os.cpus().length;

if (cluster.isMaster && process.env.NODE_ENV !== 'test' && process.env.PM2_USAGE !== 'true') {
  logger.info(`Master ${process.pid} is running`);
  logger.info(`Starting ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.error(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

  return;
}

const app = express();

// ─── Security Middleware ───

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: { defaultSrc: ["'self'"] },
}));
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

const corsOptions = {
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(config.apiPrefix, limiter);

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/auth/login', loginLimiter);

// ─── Body Parsing ───

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(hpp());

// Prevent XSS — recursive sanitization
const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    return val.replace(/[<>"'&]/g, (char) => ({
      '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;',
    }[char]));
  }
  if (Array.isArray(val)) return val.map(sanitizeValue);
  if (val && typeof val === 'object') {
    const sanitized = {};
    for (const k of Object.keys(val)) sanitized[k] = sanitizeValue(val[k]);
    return sanitized;
  }
  return val;
};

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  next();
});

// ─── Request Timeout ───

app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).json({ success: false, message: 'Request timeout' });
    req.destroy();
  });
  next();
});

// ─── Compression ───

app.use(compression());

// ─── Logging ───

if (config.nodeEnv !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

// ─── Static Files ───

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '1d', immutable: true }));

// ─── API Routes ───

app.use(config.apiPrefix, routes);

// ─── 404 Handler ───

app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Error Handlers ───

app.use(handleUploadError);
app.use(errorHandler);

// ─── Server ───

if (require.main === module) {
  app.listen(config.port, () => {
    logger.info(`BlueDesk ERP running on port ${config.port} in ${config.nodeEnv} mode`);
    logger.info(`Server: http://localhost:${config.port}${config.apiPrefix}/health`);
  });
}

module.exports = app;
