const router = require('express').Router();
const projectsController = require('./projects.controller');
const { validate, validateParams } = require('../../middlewares/validate');
const authenticate = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/rbac');
const auditLog = require('../../middlewares/audit');
const { createProjectSchema, updateProjectSchema, paramId } = require('../../validations/project');

router.use(authenticate);

router
  .route('/')
  .get(authorize('projects.read'), projectsController.findAll)
  .post(authorize('projects.create'), validate(createProjectSchema), auditLog('CREATE'), projectsController.create);

router
  .route('/:id')
  .get(validateParams(paramId), authorize('projects.read'), projectsController.findById)
  .put(validateParams(paramId), authorize('projects.update'), validate(updateProjectSchema), auditLog('UPDATE'), projectsController.update)
  .delete(validateParams(paramId), authorize('projects.delete'), auditLog('DELETE'), projectsController.delete);

router.get('/:id/status-history', validateParams(paramId), authorize('projects.read'), projectsController.getStatusHistory);

module.exports = router;
