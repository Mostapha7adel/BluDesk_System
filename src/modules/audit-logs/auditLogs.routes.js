const router = require('express').Router();
const Joi = require('joi');
const auditLogsController = require('./auditLogs.controller');
const { validateParams } = require('../../middlewares/validate');
const authenticate = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/rbac');

const paramId = Joi.object({ id: Joi.number().integer().positive().required() });

router.use(authenticate);

router.get('/actions', authorize('audit_logs.read'), auditLogsController.getActions);
router.get('/', authorize('audit_logs.read'), auditLogsController.findAll);
router.get('/:id', validateParams(paramId), authorize('audit_logs.read'), auditLogsController.findById);

module.exports = router;
