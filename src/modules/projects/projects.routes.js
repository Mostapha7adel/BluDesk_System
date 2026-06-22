const router = require('express').Router();
const Joi = require('joi');
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
router.patch('/:id/status', validateParams(paramId), authorize('projects.update'), validate(Joi.object({ status: Joi.string().valid('NEW', 'ANALYSIS', 'DESIGN', 'DEVELOPMENT', 'TESTING', 'COMPLETED', 'CANCELLED').required() })), auditLog('UPDATE'), projectsController.updateStatus);
router.post('/:id/installments', validateParams(paramId), authorize('projects.update'), validate(Joi.object({ amount: Joi.number().positive().precision(2).required(), date: Joi.date().iso(), notes: Joi.string().max(500).allow('', null) })), auditLog('CREATE'), projectsController.addInstallment);
router.get('/:id/installments', validateParams(paramId), authorize('projects.read'), projectsController.getInstallments);

module.exports = router;
