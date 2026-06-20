const prisma = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const { parsePagination, parseSort } = require('../../utils/helpers');

class AuditLogsService {
  async findAll(query) {
    const { page, limit, skip } = parsePagination(query);
    const { action, entity, userId, startDate, endDate } = query;

    const where = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (userId) where.userId = parseInt(userId);
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: parseSort(query),
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: logs,
      pagination: { page, limit, total, totalPages },
    };
  }

  async findById(id) {
    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    if (!log) throw new AppError('Audit log not found', 404);
    return log;
  }

  async getActions() {
    return Object.values(require('@prisma/client').AuditAction);
  }
}

module.exports = new AuditLogsService();
