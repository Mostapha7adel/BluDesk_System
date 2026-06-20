const Joi = require('joi');

const paramId = Joi.object({
  id: Joi.number().integer().positive().required(),
  memberId: Joi.number().integer().positive().optional(),
});

const createInternalProjectSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(5000).allow('', null),
  status: Joi.string().valid('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED').default('PLANNING'),
  progress: Joi.number().min(0).max(100).default(0),
  startDate: Joi.date().iso().allow(null),
  endDate: Joi.date().iso().allow(null),
  teamMembers: Joi.array().items(
    Joi.object({ name: Joi.string().required(), role: Joi.string().required() })
  ),
});

const updateInternalProjectSchema = Joi.object({
  name: Joi.string().min(2).max(200),
  description: Joi.string().max(5000).allow('', null),
  status: Joi.string().valid('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'),
  progress: Joi.number().min(0).max(100),
  startDate: Joi.date().iso().allow(null),
  endDate: Joi.date().iso().allow(null),
  teamMembers: Joi.array().items(
    Joi.object({ name: Joi.string().required(), role: Joi.string().required() })
  ),
}).min(1);

const noteSchema = Joi.object({
  content: Joi.string().required().max(5000),
});

const teamMemberSchema = Joi.object({
  name: Joi.string().required().max(100),
  role: Joi.string().required().max(100),
});

const teamMemberIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  memberId: Joi.number().integer().positive().required(),
});

module.exports = {
  paramId,
  createInternalProjectSchema,
  updateInternalProjectSchema,
  noteSchema,
  teamMemberSchema,
  teamMemberIdSchema,
};
