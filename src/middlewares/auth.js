const { verifyAccessToken } = require('../utils/token');
const ApiResponse = require('../utils/response');
const prisma = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return ApiResponse.unauthorized(res, 'Access token is required');
    }

    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return ApiResponse.unauthorized(res, 'User not found or inactive');
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.role.rolePermissions.map((rp) => rp.permission.slug),
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Access token expired');
    }
    return ApiResponse.unauthorized(res, 'Invalid access token');
  }
};

module.exports = authenticate;
