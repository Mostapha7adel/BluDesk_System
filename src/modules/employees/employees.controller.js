const employeesService = require('./employees.service');
const ApiResponse = require('../../utils/response');

class EmployeesController {
  async findAll(req, res, next) {
    try {
      const result = await employeesService.findAll(req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Employees fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const employee = await employeesService.findById(parseInt(req.params.id));
      return ApiResponse.success(res, employee, 'Employee fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const employee = await employeesService.create(req.body);
      return ApiResponse.created(res, employee, 'Employee created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const employee = await employeesService.update(parseInt(req.params.id), req.body);
      return ApiResponse.success(res, employee, 'Employee updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await employeesService.delete(parseInt(req.params.id));
      return ApiResponse.success(res, null, 'Employee deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async archive(req, res, next) {
    try {
      await employeesService.archive(parseInt(req.params.id));
      return ApiResponse.success(res, null, 'Employee archived successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req, res, next) {
    try {
      await employeesService.restore(parseInt(req.params.id));
      return ApiResponse.success(res, null, 'Employee restored successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmployeesController();
