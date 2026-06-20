const usersService = require('./users.service');
const ApiResponse = require('../../utils/response');

class UsersController {
  async findAll(req, res, next) {
    try {
      const result = await usersService.findAll(req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Users fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const user = await usersService.findById(parseInt(req.params.id));
      return ApiResponse.success(res, user, 'User fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const user = await usersService.create(req.body);
      return ApiResponse.created(res, user, 'User created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const user = await usersService.update(parseInt(req.params.id), req.body);
      return ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async softDelete(req, res, next) {
    try {
      await usersService.softDelete(parseInt(req.params.id));
      return ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req, res, next) {
    try {
      await usersService.restore(parseInt(req.params.id));
      return ApiResponse.success(res, null, 'User restored successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDeletedUsers(req, res, next) {
    try {
      const result = await usersService.getDeletedUsers(req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Deleted users fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsersController();
