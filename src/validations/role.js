const Joi = require('joi');

const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'any.required': 'Role name is required',
  }),
  description: Joi.string().max(500).allow('', null),
});

const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  description: Joi.string().max(500).allow('', null),
}).min(1);

const assignPermissionsSchema = Joi.object({
  permissionIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    'array.min': 'At least one permission is required',
    'any.required': 'Permission IDs are required',
  }),
});

module.exports = { createRoleSchema, updateRoleSchema, assignPermissionsSchema };
