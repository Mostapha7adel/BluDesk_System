const Joi = require('joi');

const createProjectSchema = Joi.object({
  name: Joi.string().min(2).max(200).required().messages({
    'any.required': 'Project name is required',
  }),
  clientName: Joi.string().min(2).max(200).required().messages({
    'any.required': 'Client name is required',
  }),
  description: Joi.string().max(5000).allow('', null),
  totalCost: Joi.number().positive().precision(2).required().messages({
    'any.required': 'Total cost is required',
  }),
  depositAmount: Joi.number().min(0).precision(2).default(0),
  startDate: Joi.date().iso().required().messages({
    'any.required': 'Start date is required',
  }),
  deliveryDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
    'any.required': 'Delivery date is required',
    'date.greater': 'Delivery date must be after start date',
  }),
  employeeIds: Joi.array().items(Joi.number().integer().positive()),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(2).max(200),
  clientName: Joi.string().min(2).max(200),
  description: Joi.string().max(5000).allow('', null),
  totalCost: Joi.number().positive().precision(2),
  depositAmount: Joi.number().min(0).precision(2),
  startDate: Joi.date().iso(),
  deliveryDate: Joi.date().iso().when('startDate', {
    is: Joi.date().required(),
    then: Joi.date().greater(Joi.ref('startDate')),
  }),
  status: Joi.string().valid('NEW', 'ANALYSIS', 'DESIGN', 'DEVELOPMENT', 'TESTING', 'COMPLETED', 'CANCELLED'),
  employeeIds: Joi.array().items(Joi.number().integer().positive()),
}).min(1);

const paramId = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports = { createProjectSchema, updateProjectSchema, paramId };
