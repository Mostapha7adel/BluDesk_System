const router = require('express').Router();
const Joi = require('joi');
const salariesController = require('./salaries.controller');
const { validate, validateParams } = require('../../middlewares/validate');
const authenticate = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/rbac');
const auditLog = require('../../middlewares/audit');
const { createSalarySchema, updateSalarySchema, updateSalaryNotesSchema } = require('../../validations/salary');

const paramId = Joi.object({ id: Joi.number().integer().positive().required() });

router.use(authenticate);

router.get('/pending', authorize('salaries.approve'), salariesController.getPendingApprovals);

router
  .route('/')
  .get(authorize('salaries.read'), salariesController.findAll)
  .post(authorize('salaries.create'), validate(createSalarySchema), auditLog('CREATE'), salariesController.create);

router
  .route('/:id')
  .get(validateParams(paramId), authorize('salaries.read'), salariesController.findById)
  .put(validateParams(paramId), authorize('salaries.create'), validate(updateSalarySchema), auditLog('UPDATE'), salariesController.update);

router.put('/:id/approve', validateParams(paramId), authorize('salaries.approve'), validate(updateSalaryNotesSchema), auditLog('UPDATE'), salariesController.approve);
router.put('/:id/pay', validateParams(paramId), authorize('salaries.approve'), validate(updateSalaryNotesSchema), auditLog('UPDATE'), salariesController.pay);
router.put('/:id/cancel', validateParams(paramId), authorize('salaries.approve'), validate(updateSalaryNotesSchema), auditLog('UPDATE'), salariesController.cancel);

module.exports = router;
