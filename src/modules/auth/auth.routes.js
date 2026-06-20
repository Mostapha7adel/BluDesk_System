const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const authController = require('./auth.controller');
const { validate } = require('../../middlewares/validate');
const authenticate = require('../../middlewares/auth');
const {
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require('../../validations/auth');

const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many refresh attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many password reset requests, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', refreshLimiter, validate(refreshTokenSchema), authController.refreshToken);
router.post('/forgot-password', forgotLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);

router.use(authenticate);
router.post('/change-password', validate(changePasswordSchema), authController.changePassword);
router.get('/profile', authController.getProfile);

module.exports = router;
