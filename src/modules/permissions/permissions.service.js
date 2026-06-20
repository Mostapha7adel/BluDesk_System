const prisma = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

class PermissionsService {
  async findAll(query) {
    const { group } = query;
    const where = {};
    if (group) where.group = group;

    const permissions = await prisma.permission.findMany({
      where,
      orderBy: [{ group: 'asc' }, { name: 'asc' }],
    });

    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.group]) acc[perm.group] = [];
      acc[perm.group].push(perm);
      return acc;
    }, {});

    return { data: permissions, grouped };
  }

  async findById(id) {
    const permission = await prisma.permission.findUnique({ where: { id } });
    if (!permission) throw new AppError('Permission not found', 404);
    return permission;
  }
}

module.exports = new PermissionsService();
