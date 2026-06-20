const Joi = require('joi');

const createTreasurySchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Treasury name is required',
  }),
  balance: Joi.number().min(0).precision(2).default(0),
  description: Joi.string().max(500).allow('', null),
});

const updateTreasurySchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().max(500).allow('', null),
  isActive: Joi.boolean(),
}).min(1);

const createTransactionSchema = Joi.object({
  treasuryId: Joi.number().integer().positive().required().messages({
    'any.required': 'Treasury is required',
  }),
  type: Joi.string().valid('INCOME', 'EXPENSE', 'DEPOSIT').required().messages({
    'any.required': 'Transaction type is required',
  }),
  amount: Joi.number().positive().precision(2).required().messages({
    'any.required': 'Amount is required',
  }),
  description: Joi.string().max(500).allow('', null),
  reference: Joi.string().max(100).allow('', null),
  date: Joi.date().iso().default(() => new Date()),
});

const createExpenseSchema = Joi.object({
  category: Joi.string()
    .valid('SALARIES', 'HOSTING', 'RENT', 'MARKETING', 'EQUIPMENT', 'MISCELLANEOUS')
    .required()
    .messages({ 'any.required': 'Category is required' }),
  amount: Joi.number().positive().precision(2).required().messages({
    'any.required': 'Amount is required',
  }),
  description: Joi.string().max(500).allow('', null),
  date: Joi.date().iso().required().messages({
    'any.required': 'Date is required',
  }),
});

const updateExpenseSchema = Joi.object({
  category: Joi.string().valid('SALARIES', 'HOSTING', 'RENT', 'MARKETING', 'EQUIPMENT', 'MISCELLANEOUS'),
  amount: Joi.number().positive().precision(2),
  description: Joi.string().max(500).allow('', null),
  date: Joi.date().iso(),
}).min(1);

module.exports = {
  createTreasurySchema,
  updateTreasurySchema,
  createTransactionSchema,
  createExpenseSchema,
  updateExpenseSchema,
};
