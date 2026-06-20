const bcrypt = require('bcryptjs');
const prisma = require('../../config/database');
const config = require('../../config');
const { sanitizeUser, parsePagination, parseSort } = require('../../utils/helpers');
const { AppError } = require('../../middlewares/errorHandler');
const logger = require('../../utils/logger');

class UsersService {
  async findAll(query) {
    const { page, limit, skip } = parsePagination(query);
    const { search, status, roleId } = query;

    const where = { deletedAt: null };

    if (status) where.status = status;
    if (roleId) where.roleId = parseInt(roleId);
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: parseSort(query),
        include: { role: true },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users.map(sanitizeUser),
      pagination: { page, limit, total, totalPages },
    };
  }

  async findById(id) {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: { role: true },
    });
    if (!user) throw new AppError('User not found', 404);
    return sanitizeUser(user);
  }

  async create(data) {
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) throw new AppError('Email already exists', 409);

    const role = await prisma.role.findUnique({ where: { id: data.roleId } });
    if (!role) throw new AppError('Role not found', 404);

    const hashedPassword = await bcrypt.hash(data.password, config.bcrypt.saltRounds);

    const allowedFields = { name: data.name, email: data.email, password: hashedPassword, phone: data.phone, roleId: data.roleId, status: data.status };

    const user = await prisma.user.create({
      data: allowedFields,
      include: { role: true },
    });

    return sanitizeUser(user);
  }

  async update(id, data) {
    const user = await prisma.user.findUnique({ where: { id, deletedAt: null } });
    if (!user) throw new AppError('User not found', 404);

    const allowedFields = {};
    if (data.name !== undefined) allowedFields.name = data.name;
    if (data.email !== undefined) {
      if (data.email !== user.email) {
        const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingEmail) throw new AppError('Email already exists', 409);
      }
      allowedFields.email = data.email;
    }
    if (data.phone !== undefined) allowedFields.phone = data.phone;
    if (data.roleId !== undefined) {
      const role = await prisma.role.findUnique({ where: { id: data.roleId } });
      if (!role) throw new AppError('Role not found', 404);
      allowedFields.roleId = data.roleId;
    }
    if (data.status !== undefined) allowedFields.status = data.status;
    if (data.password !== undefined) {
      allowedFields.password = await bcrypt.hash(data.password, config.bcrypt.saltRounds);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: allowedFields,
      include: { role: true },
    });

    return sanitizeUser(updated);
  }

  async softDelete(id) {
    const user = await prisma.user.findUnique({ where: { id, deletedAt: null } });
    if (!user) throw new AppError('User not found', 404);

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }

  async restore(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || !user.deletedAt) throw new AppError('User not found or not deleted', 404);

    await prisma.user.update({
      where: { id },
      data: { deletedAt: null, status: 'ACTIVE' },
    });
  }

  async getDeletedUsers(query) {
    const { page, limit, skip } = parsePagination(query);

    const where = { deletedAt: { not: null } };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { deletedAt: 'desc' },
        include: { role: true },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users.map(sanitizeUser),
      pagination: { page, limit, total, totalPages },
    };
  }
}

module.exports = new UsersService();
