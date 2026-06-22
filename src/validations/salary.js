const Joi = require('joi');

const createSalarySchema = Joi.object({
  employeeId: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().precision(2).required(),
  transportAllowance: Joi.number().min(0).precision(2).default(0),
  bonus: Joi.number().min(0).precision(2).default(0),
  loan: Joi.number().min(0).precision(2).default(0),
  deduction: Joi.number().min(0).precision(2).default(0),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2020).max(2100).required(),
  notes: Joi.string().max(500).allow('', null),
});

const updateSalarySchema = Joi.object({
  amount: Joi.number().positive().precision(2),
  transportAllowance: Joi.number().min(0).precision(2),
  bonus: Joi.number().min(0).precision(2),
  loan: Joi.number().min(0).precision(2),
  deduction: Joi.number().min(0).precision(2),
  notes: Joi.string().max(500).allow('', null),
}).min(1);

const updateSalaryStatusSchema = Joi.object({
  status: Joi.string().valid('APPROVED', 'PAID', 'CANCELLED').required(),
  notes: Joi.string().max(500).allow('', null),
});

const updateSalaryNotesSchema = Joi.object({
  notes: Joi.string().max(500).allow('', null),
});

module.exports = { createSalarySchema, updateSalarySchema, updateSalaryStatusSchema, updateSalaryNotesSchema };
