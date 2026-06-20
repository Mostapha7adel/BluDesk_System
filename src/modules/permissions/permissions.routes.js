const router = require('express').Router();
const Joi = require('joi');
const permissionsController = require('./permissions.controller');
const { validateParams } = require('../../middlewares/validate');
const authenticate = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/rbac');

const paramId = Joi.object({ id: Joi.number().integer().positive().required() });

router.use(authenticate);

router.get('/', authorize('roles.read'), permissionsController.findAll);
router.get('/:id', validateParams(paramId), authorize('roles.read'), permissionsController.findById);

module.exports = router;
