const router = require('express').Router();
const Joi = require('joi');
const employeesController = require('./employees.controller');
const { validate, validateParams } = require('../../middlewares/validate');
const authenticate = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/rbac');
const auditLog = require('../../middlewares/audit');
const { upload } = require('../../middlewares/upload');
const { createEmployeeSchema, updateEmployeeSchema } = require('../../validations/employee');

const paramId = Joi.object({ id: Joi.number().integer().positive().required() });

router.use(authenticate);

const attachImage = (req, res, next) => {
  if (req.file) req.body.image = req.file.filename;
  next();
};

router
  .route('/')
  .get(authorize('employees.read'), employeesController.findAll)
  .post(
    authorize('employees.create'),
    upload.single('image'),
    attachImage,
    validate(createEmployeeSchema),
    auditLog('CREATE'),
    employeesController.create
  );

router
  .route('/:id')
  .get(validateParams(paramId), authorize('employees.read'), employeesController.findById)
  .put(
    validateParams(paramId),
    authorize('employees.update'),
    upload.single('image'),
    attachImage,
    validate(updateEmployeeSchema),
    auditLog('UPDATE'),
    employeesController.update
  )
  .delete(validateParams(paramId), authorize('employees.delete'), auditLog('DELETE'), employeesController.delete);

router.put('/:id/archive', validateParams(paramId), authorize('employees.archive'), auditLog('UPDATE'), employeesController.archive);
router.put('/:id/restore', validateParams(paramId), authorize('employees.restore'), auditLog('UPDATE'), employeesController.restore);

module.exports = router;
