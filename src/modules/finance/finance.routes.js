const router = require('express').Router();
const Joi = require('joi');
const financeController = require('./finance.controller');
const { validate, validateParams } = require('../../middlewares/validate');
const authenticate = require('../../middlewares/auth');
const { authorize, authorizeRole } = require('../../middlewares/rbac');
const auditLog = require('../../middlewares/audit');
const {
  createTreasurySchema,
  updateTreasurySchema,
  createTransactionSchema,
} = require('../../validations/finance');

const paramId = Joi.object({ id: Joi.number().integer().positive().required() });

router.use(authenticate);

// Treasury
router
  .route('/treasuries')
  .get(authorize('treasury.read'), financeController.getTreasuries)
  .post(authorize('treasury.create'), validate(createTreasurySchema), auditLog('CREATE'), financeController.createTreasury);

router
  .route('/treasuries/:id')
  .get(validateParams(paramId), authorize('treasury.read'), financeController.getTreasuryById)
  .put(validateParams(paramId), authorize('treasury.update'), validate(updateTreasurySchema), auditLog('UPDATE'), financeController.updateTreasury);

// Transactions
router.get('/transactions', authorize('finance.read'), financeController.getTransactions);
router.post('/transactions', authorize('finance.create_transaction'), validate(createTransactionSchema), auditLog('CREATE'), financeController.createTransaction);

router.put('/transactions/:id/cancel', validateParams(paramId), authorizeRole('super_admin'), auditLog('UPDATE'), financeController.cancelTransaction);

// Reports
router.get('/reports', authorize('finance.generate_report'), financeController.getFinancialReport);

module.exports = router;
