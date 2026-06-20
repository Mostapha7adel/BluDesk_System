const Joi = require('joi');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must be at most 100 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Valid email is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).max(128).pattern(passwordPattern).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character',
    'any.required': 'Password is required',
  }),
  phone: Joi.string().max(20).allow('', null),
  roleId: Joi.number().integer().positive().required().messages({
    'any.required': 'Role is required',
  }),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').default('ACTIVE'),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  phone: Joi.string().max(20).allow('', null),
  roleId: Joi.number().integer().positive(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED'),
}).min(1).messages({
  'object.min': 'At least one field must be provided',
});

module.exports = { createUserSchema, updateUserSchema };
