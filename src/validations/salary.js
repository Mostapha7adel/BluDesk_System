const Joi = require('joi');

const createSalarySchema = Joi.object({
  employeeId: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().precision(2).required(),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2020).max(2100).required(),
  notes: Joi.string().max(500).allow('', null),
});

const updateSalaryStatusSchema = Joi.object({
  status: Joi.string().valid('APPROVED', 'PAID', 'CANCELLED').required(),
  notes: Joi.string().max(500).allow('', null),
});

const updateSalaryNotesSchema = Joi.object({
  notes: Joi.string().max(500).allow('', null),
});

module.exports = { createSalarySchema, updateSalaryStatusSchema, updateSalaryNotesSchema };