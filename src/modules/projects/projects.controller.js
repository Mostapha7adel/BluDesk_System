const projectsService = require('./projects.service');
const ApiResponse = require('../../utils/response');

class ProjectsController {
  async findAll(req, res, next) {
    try {
      const result = await projectsService.findAll(req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Projects fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const project = await projectsService.findById(parseInt(req.params.id));
      return ApiResponse.success(res, project, 'Project fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const project = await projectsService.create(req.body);
      return ApiResponse.created(res, project, 'Project created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const project = await projectsService.update(parseInt(req.params.id), req.body);
      return ApiResponse.success(res, project, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await projectsService.delete(parseInt(req.params.id));
      return ApiResponse.success(res, null, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStatusHistory(req, res, next) {
    try {
      const history = await projectsService.getStatusHistory(parseInt(req.params.id), req.query);
      return ApiResponse.success(res, history, 'Status history fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProjectsController();
