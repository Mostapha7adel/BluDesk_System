const ApiResponse = require('../utils/response');

const authorize = (...allowedPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    const hasPermission = allowedPermissions.some((permission) =>
      req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      return ApiResponse.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    const userRoleSlug = req.user.role.slug;
    if (!allowedRoles.includes(userRoleSlug)) {
      return ApiResponse.forbidden(res, 'Role not authorized');
    }

    next();
  };
};

module.exports = { authorize, authorizeRole };
