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

app.disable('x-powered-by');

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'same-origin' },
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'self'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

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
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(config.apiPrefix, limiter);

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many login attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/auth/login', loginLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(hpp());

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

app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).json({ success: false, message: 'Request timeout' });
    req.destroy();
  });
  next();
});

app.use((req, res, next) => {
  if (req.path.startsWith(config.apiPrefix)) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

app.use(compression());

if (config.nodeEnv !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
    skip: (req) => req.path === '/api/v1/health',
  }));
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  immutable: true,
  etag: true,
  lastModified: true,
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
  },
}));
app.get('/api/v1/uploads/:file', (req, res, next) => {
  const filePath = path.resolve(__dirname, 'uploads', req.params.file);
  if (!filePath.startsWith(path.resolve(__dirname, 'uploads'))) return res.status(403).json({ success: false, message: 'Forbidden' });
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ success: false, message: 'File not found' });
    }
  });
});

app.use(config.apiPrefix, routes);

app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(handleUploadError);
app.use(errorHandler);

if (require.main === module) {
  app.listen(config.port, () => {
    logger.info(`BlueDesk ERP running on port ${config.port} in ${config.nodeEnv} mode`);
  });
}

module.exports = app;
