const router = require('express').Router();
const internalProjectsController = require('./internalProjects.controller');
const { validate, validateParams } = require('../../middlewares/validate');
const authenticate = require('../../middlewares/auth');
const { authorize } = require('../../middlewares/rbac');
const auditLog = require('../../middlewares/audit');
const {
  paramId, createInternalProjectSchema, updateInternalProjectSchema,
  noteSchema, teamMemberSchema, teamMemberIdSchema,
} = require('../../validations/internal-project');

router.use(authenticate);

router
  .route('/')
  .get(authorize('internal_projects.read'), internalProjectsController.findAll)
  .post(
    authorize('internal_projects.create'),
    validate(createInternalProjectSchema),
    auditLog('CREATE'),
    internalProjectsController.create
  );

router
  .route('/:id')
  .get(validateParams(paramId), authorize('internal_projects.read'), internalProjectsController.findById)
  .put(
    validateParams(paramId),
    authorize('internal_projects.update'),
    validate(updateInternalProjectSchema),
    auditLog('UPDATE'),
    internalProjectsController.update
  )
  .delete(validateParams(paramId), authorize('internal_projects.delete'), auditLog('DELETE'), internalProjectsController.delete);

router.post(
  '/:id/notes',
  validateParams(paramId),
  authorize('internal_projects.update'),
  validate(noteSchema),
  auditLog('CREATE'),
  internalProjectsController.addNote
);

router.post(
  '/:id/team-members',
  validateParams(paramId),
  authorize('internal_projects.update'),
  validate(teamMemberSchema),
  auditLog('CREATE'),
  internalProjectsController.addTeamMember
);

router.delete(
  '/:id/team-members/:memberId',
  validateParams(teamMemberIdSchema),
  authorize('internal_projects.update'),
  auditLog('DELETE'),
  internalProjectsController.removeTeamMember
);

module.exports = router;
