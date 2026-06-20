const router = require('express').Router();
const Joi = require('joi');
const usersController = require('./users.controller');
const { validate, validateParams } = require('../../middlewares/validate');
const authenticate = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/rbac');
const auditLog = require('../../middlewares/audit');
const { createUserSchema, updateUserSchema } = require('../../validations/user');

const paramId = Joi.object({ id: Joi.number().integer().positive().required() });

router.use(authenticate);

router
  .route('/')
  .get(authorize('users.read'), usersController.findAll)
  .post(authorize('users.create'), validate(createUserSchema), auditLog('CREATE'), usersController.create);

router.get('/deleted', authorize('users.read'), usersController.getDeletedUsers);

router
  .route('/:id')
  .get(validateParams(paramId), authorize('users.read'), usersController.findById)
  .put(validateParams(paramId), authorize('users.update'), validate(updateUserSchema), auditLog('UPDATE'), usersController.update)
  .delete(validateParams(paramId), authorize('users.delete'), auditLog('DELETE'), usersController.softDelete);

router.put('/:id/restore', validateParams(paramId), authorize('users.restore'), auditLog('UPDATE'), usersController.restore);

module.exports = router;
