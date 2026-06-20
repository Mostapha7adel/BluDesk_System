const router = require('express').Router();
const settingsController = require('./settings.controller');
const authenticate = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/rbac');

router.use(authenticate);

router.get('/system-health', authorize('settings.read'), settingsController.getSystemHealth);
router.get('/backup', authorize('settings.backup'), settingsController.createBackup);

module.exports = router;
