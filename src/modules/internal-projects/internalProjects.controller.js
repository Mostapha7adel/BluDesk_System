const internalProjectsService = require('./internalProjects.service');
const ApiResponse = require('../../utils/response');

class InternalProjectsController {
  async findAll(req, res, next) {
    try {
      const result = await internalProjectsService.findAll(req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Internal projects fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const project = await internalProjectsService.findById(parseInt(req.params.id));
      return ApiResponse.success(res, project, 'Internal project fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const project = await internalProjectsService.create(req.body);
      return ApiResponse.created(res, project, 'Internal project created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const project = await internalProjectsService.update(parseInt(req.params.id), req.body);
      return ApiResponse.success(res, project, 'Internal project updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await internalProjectsService.delete(parseInt(req.params.id));
      return ApiResponse.success(res, null, 'Internal project deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async addNote(req, res, next) {
    try {
      const note = await internalProjectsService.addNote(
        parseInt(req.params.id),
        req.body.content,
        req.user.id
      );
      return ApiResponse.created(res, note, 'Note added successfully');
    } catch (error) {
      next(error);
    }
  }

  async addTeamMember(req, res, next) {
    try {
      const member = await internalProjectsService.addTeamMember(
        parseInt(req.params.id),
        req.body
      );
      return ApiResponse.created(res, member, 'Team member added successfully');
    } catch (error) {
      next(error);
    }
  }

  async removeTeamMember(req, res, next) {
    try {
      await internalProjectsService.removeTeamMember(
        parseInt(req.params.id),
        parseInt(req.params.memberId)
      );
      return ApiResponse.success(res, null, 'Team member removed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InternalProjectsController();
