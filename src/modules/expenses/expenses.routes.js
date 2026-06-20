const router = require('express').Router();
const Joi = require('joi');
const expensesController = require('./expenses.controller');
const { validate, validateParams } = require('../../middlewares/validate');
const authenticate = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/rbac');
const auditLog = require('../../middlewares/audit');
const { createExpenseSchema, updateExpenseSchema } = require('../../validations/finance');

const paramId = Joi.object({ id: Joi.number().integer().positive().required() });

router.use(authenticate);

router.get('/reports/monthly', authorize('expenses.read'), expensesController.getMonthlyReport);

router
  .route('/')
  .get(authorize('expenses.read'), expensesController.findAll)
  .post(authorize('expenses.create'), validate(createExpenseSchema), auditLog('CREATE'), expensesController.create);

router
  .route('/:id')
  .get(validateParams(paramId), authorize('expenses.read'), expensesController.findById)
  .put(validateParams(paramId), authorize('expenses.update'), validate(updateExpenseSchema), auditLog('UPDATE'), expensesController.update)
  .delete(validateParams(paramId), authorize('expenses.delete'), auditLog('DELETE'), expensesController.delete);

module.exports = router;
