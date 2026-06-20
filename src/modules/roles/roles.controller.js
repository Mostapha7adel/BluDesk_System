const rolesService = require('./roles.service');
const ApiResponse = require('../../utils/response');

class RolesController {
  async findAll(req, res, next) {
    try {
      const result = await rolesService.findAll(req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Roles fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const role = await rolesService.findById(parseInt(req.params.id));
      return ApiResponse.success(res, role, 'Role fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const role = await rolesService.create(req.body);
      return ApiResponse.created(res, role, 'Role created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const role = await rolesService.update(parseInt(req.params.id), req.body);
      return ApiResponse.success(res, role, 'Role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await rolesService.delete(parseInt(req.params.id));
      return ApiResponse.success(res, null, 'Role deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async assignPermissions(req, res, next) {
    try {
      const role = await rolesService.assignPermissions(
        parseInt(req.params.id),
        req.body.permissionIds
      );
      return ApiResponse.success(res, role, 'Permissions assigned successfully');
    } catch (error) {
      next(error);
    }
  }

  async removePermission(req, res, next) {
    try {
      const role = await rolesService.removePermission(
        parseInt(req.params.id),
        parseInt(req.params.permissionId)
      );
      return ApiResponse.success(res, role, 'Permission removed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPermissionsByRole(req, res, next) {
    try {
      const permissions = await rolesService.getPermissionsByRole(parseInt(req.params.id));
      return ApiResponse.success(res, permissions, 'Permissions fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RolesController();
