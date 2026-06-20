const Joi = require('joi');

const createEmployeeSchema = Joi.object({
  employeeNumber: Joi.string().max(20).required().messages({
    'any.required': 'Employee number is required',
  }),
  nationalId: Joi.string().max(20).allow('', null),
  image: Joi.string().max(255).allow('', null),
  name: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().max(20).allow('', null),
  position: Joi.string().max(100).required().messages({
    'any.required': 'Position is required',
  }),
  department: Joi.string().max(100).required().messages({
    'any.required': 'Department is required',
  }),
  salary: Joi.number().positive().precision(2).required().messages({
    'any.required': 'Salary is required',
  }),
  hireDate: Joi.date().iso().required().messages({
    'any.required': 'Hire date is required',
    'date.format': 'Hire date must be ISO format',
  }),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED').default('ACTIVE'),
});

const updateEmployeeSchema = Joi.object({
  nationalId: Joi.string().max(20).allow('', null),
  image: Joi.string().max(255).allow('', null),
  name: Joi.string().min(2).max(100),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().max(20).allow('', null),
  position: Joi.string().max(100),
  department: Joi.string().max(100),
  salary: Joi.number().positive().precision(2),
  hireDate: Joi.date().iso(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'),
}).min(1);

module.exports = { createEmployeeSchema, updateEmployeeSchema };
