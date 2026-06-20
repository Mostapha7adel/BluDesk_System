const prisma = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const { parsePagination } = require('../../utils/helpers');

class RolesService {
  async findAll(query) {
    const { page, limit, skip } = parsePagination(query);

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { users: true } },
        },
      }),
      prisma.role.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: roles,
      pagination: { page, limit, total, totalPages },
    };
  }

  async findById(id) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
        _count: { select: { users: true } },
      },
    });
    if (!role) throw new AppError('Role not found', 404);
    return role;
  }

  async create(data) {
    const existing = await prisma.role.findUnique({ where: { name: data.name } });
    if (existing) throw new AppError('Role name already exists', 409);

    const slug = data.name.toLowerCase().replace(/\s+/g, '_');

    const role = await prisma.role.create({
      data: { ...data, slug },
    });

    return role;
  }

  async update(id, data) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throw new AppError('Role not found', 404);
    if (role.isSystem) throw new AppError('System roles cannot be modified', 403);

    if (data.name) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, '_');
    }

    return prisma.role.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throw new AppError('Role not found', 404);
    if (role.isSystem) throw new AppError('System roles cannot be deleted', 403);

    const userCount = await prisma.user.count({ where: { roleId: id } });
    if (userCount > 0) {
      throw new AppError('Cannot delete role with assigned users', 400);
    }

    await prisma.role.delete({ where: { id } });
  }

  async assignPermissions(roleId, permissionIds) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new AppError('Role not found', 404);

    const existingPermissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });

    if (existingPermissions.length !== permissionIds.length) {
      throw new AppError('Some permissions not found', 404);
    }

    await prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
      skipDuplicates: true,
    });

    return this.findById(roleId);
  }

  async removePermission(roleId, permissionId) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new AppError('Role not found', 404);

    await prisma.rolePermission.deleteMany({
      where: { roleId, permissionId },
    });

    return this.findById(roleId);
  }

  async getPermissionsByRole(roleId) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });
    if (!role) throw new AppError('Role not found', 404);
    return role.rolePermissions.map((rp) => rp.permission);
  }
}

module.exports = new RolesService();
