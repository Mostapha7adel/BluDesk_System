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

  async updateStatus(req, res, next) {
    try {
      const project = await projectsService.updateStatus(parseInt(req.params.id), req.body.status, req.user.id);
      return ApiResponse.success(res, project, 'Project status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async addInstallment(req, res, next) {
    try {
      const installment = await projectsService.addInstallment(parseInt(req.params.id), req.body, req.user?.id);
      return ApiResponse.created(res, installment, 'Payment installment added successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateInstallment(req, res, next) {
    try {
      const installment = await projectsService.updateInstallment(parseInt(req.params.id), parseInt(req.params.installmentId), req.body, req.user?.id);
      return ApiResponse.success(res, installment, 'Installment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteInstallment(req, res, next) {
    try {
      const result = await projectsService.deleteInstallment(parseInt(req.params.id), parseInt(req.params.installmentId), req.user?.id);
      return ApiResponse.success(res, result, 'Installment deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getInstallments(req, res, next) {
    try {
      const result = await projectsService.getInstallments(parseInt(req.params.id));
      return ApiResponse.success(res, result, 'Installments fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProjectsController();
