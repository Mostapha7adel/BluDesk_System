const permissionsService = require('./permissions.service');
const ApiResponse = require('../../utils/response');

class PermissionsController {
  async findAll(req, res, next) {
    try {
      const result = await permissionsService.findAll(req.query);
      return ApiResponse.success(res, result, 'Permissions fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const permission = await permissionsService.findById(parseInt(req.params.id));
      return ApiResponse.success(res, permission, 'Permission fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PermissionsController();
