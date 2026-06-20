const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

transporter.verify().then(() => {
  logger.info('Email transporter ready');
}).catch((err) => {
  logger.warn('Email transporter not configured:', err.message);
});

module.exports = transporter;
