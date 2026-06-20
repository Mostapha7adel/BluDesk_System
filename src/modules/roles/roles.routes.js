const router = require('express').Router();
const Joi = require('joi');
const rolesController = require('./roles.controller');
const { validate, validateParams } = require('../../middlewares/validate');
const authenticate = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/rbac');
const auditLog = require('../../middlewares/audit');
const { createRoleSchema, updateRoleSchema, assignPermissionsSchema } = require('../../validations/role');

const paramId = Joi.object({ id: Joi.number().integer().positive().required() });
const permissionParamId = Joi.object({ id: Joi.number().integer().positive().required(), permissionId: Joi.number().integer().positive().required() });

router.use(authenticate);

router
  .route('/')
  .get(authorize('roles.read'), rolesController.findAll)
  .post(authorize('roles.create'), validate(createRoleSchema), auditLog('CREATE'), rolesController.create);

router
  .route('/:id')
  .get(validateParams(paramId), authorize('roles.read'), rolesController.findById)
  .put(validateParams(paramId), authorize('roles.update'), validate(updateRoleSchema), auditLog('UPDATE'), rolesController.update)
  .delete(validateParams(paramId), authorize('roles.delete'), auditLog('DELETE'), rolesController.delete);

router.get('/:id/permissions', validateParams(paramId), authorize('roles.read'), rolesController.getPermissionsByRole);
router.put('/:id/permissions', validateParams(paramId), authorize('permissions.assign'), validate(assignPermissionsSchema), auditLog('PERMISSION_CHANGE'), rolesController.assignPermissions);
router.delete('/:id/permissions/:permissionId', validateParams(permissionParamId), authorize('permissions.remove'), auditLog('PERMISSION_CHANGE'), rolesController.removePermission);

module.exports = router;
