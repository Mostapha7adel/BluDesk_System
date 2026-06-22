const prisma = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const { parsePagination, parseSort } = require('../../utils/helpers');

class ProjectsService {
  async findAll(query) {
    const { page, limit, skip } = parsePagination(query);
    const { search, status, clientName } = query;

    const where = { deletedAt: null };
    if (status) where.status = status;
    if (clientName) where.clientName = { contains: clientName };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { clientName: { contains: search } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: parseSort(query),
        include: {
          assignedEmployees: {
            include: { employee: true },
          },
          _count: { select: { assignedEmployees: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: projects,
      pagination: { page, limit, total, totalPages },
    };
  }

  async findById(id) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        assignedEmployees: {
          include: { employee: true },
        },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        installments: { orderBy: { date: 'desc' } },
      },
    });
    if (!project) throw new AppError('Project not found', 404);
    return project;
  }

  async create(data) {
    const { employeeIds, ...projectData } = data;

    if (employeeIds && employeeIds.length > 0) {
      const validEmployees = await prisma.employee.count({
        where: { id: { in: employeeIds }, deletedAt: null, status: 'ACTIVE' },
      });
      if (validEmployees !== employeeIds.length) {
        throw new AppError('One or more employees are inactive or deleted', 400);
      }
    }

    const allowedFields = {
      name: projectData.name,
      clientName: projectData.clientName,
      description: projectData.description,
      totalCost: projectData.totalCost,
      depositAmount: projectData.depositAmount || 0,
      remainingAmount: (projectData.totalCost || 0) - (projectData.depositAmount || 0),
      startDate: projectData.startDate,
      deliveryDate: projectData.deliveryDate,
      status: projectData.status || 'NEW',
    };
    Object.keys(allowedFields).forEach((k) => { if (allowedFields[k] === undefined) delete allowedFields[k]; });

    const project = await prisma.project.create({
      data: {
        ...allowedFields,
        statusHistory: {
          create: {
            toStatus: projectData.status || 'NEW',
            fromStatus: null,
          },
        },
        ...(employeeIds && employeeIds.length > 0
          ? {
              assignedEmployees: {
                create: employeeIds.map((employeeId) => ({ employeeId })),
              },
            }
          : {}),
      },
      include: {
        assignedEmployees: {
          include: { employee: true },
        },
        statusHistory: true,
      },
    });

    return project;
  }

  async update(id, data) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new AppError('Project not found', 404);

    const { employeeIds, ...updateData } = data;

    if (employeeIds !== undefined) {
      if (employeeIds.length > 0) {
        const validEmployees = await prisma.employee.count({
          where: { id: { in: employeeIds }, deletedAt: null, status: 'ACTIVE' },
        });
        if (validEmployees !== employeeIds.length) {
          throw new AppError('One or more employees are inactive or deleted', 400);
        }
      }
    }

    const allowedFields = {};
    if (updateData.name !== undefined) allowedFields.name = updateData.name;
    if (updateData.clientName !== undefined) allowedFields.clientName = updateData.clientName;
    if (updateData.description !== undefined) allowedFields.description = updateData.description;
    if (updateData.totalCost !== undefined || updateData.depositAmount !== undefined) {
      const totalCost = updateData.totalCost ?? parseFloat(project.totalCost);
      const depositAmount = updateData.depositAmount ?? parseFloat(project.depositAmount);
      allowedFields.remainingAmount = totalCost - depositAmount;
      if (updateData.totalCost !== undefined) allowedFields.totalCost = updateData.totalCost;
      if (updateData.depositAmount !== undefined) allowedFields.depositAmount = updateData.depositAmount;
    }
    if (updateData.startDate !== undefined) allowedFields.startDate = updateData.startDate;
    if (updateData.deliveryDate !== undefined) allowedFields.deliveryDate = updateData.deliveryDate;

    let statusChanged = false;
    if (updateData.status && updateData.status !== project.status) {
      allowedFields.status = updateData.status;
      statusChanged = true;
    }

    const projectUpdated = await prisma.$transaction(async (tx) => {
      if (employeeIds !== undefined) {
        await tx.projectEmployee.deleteMany({ where: { projectId: id } });
        if (employeeIds.length > 0) {
          await tx.projectEmployee.createMany({
            data: employeeIds.map((employeeId) => ({ projectId: id, employeeId })),
          });
        }
      }

      return tx.project.update({
        where: { id },
        data: {
          ...allowedFields,
          ...(statusChanged
            ? {
                statusHistory: {
                  create: {
                    toStatus: updateData.status,
                    fromStatus: project.status,
                  },
                },
              }
            : {}),
        },
        include: {
          assignedEmployees: {
            include: { employee: true },
          },
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      });
    });

    return projectUpdated;
  }

  async delete(id) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new AppError('Project not found', 404);

    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async updateStatus(id, status, userId) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new AppError('Project not found', 404);

    return prisma.project.update({
      where: { id },
      data: {
        status,
        statusHistory: {
          create: { toStatus: status, fromStatus: project.status, changedBy: userId },
        },
      },
      include: {
        assignedEmployees: { include: { employee: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async addInstallment(id, data) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new AppError('Project not found', 404);

    return prisma.$transaction(async (tx) => {
      const installment = await tx.paymentInstallment.create({
        data: { projectId: id, amount: data.amount, date: data.date || new Date(), notes: data.notes },
      });

      const totalPaid = await tx.paymentInstallment.aggregate({
        where: { projectId: id },
        _sum: { amount: true },
      });

      await tx.project.update({
        where: { id },
        data: { remainingAmount: parseFloat(project.totalCost) - parseFloat(totalPaid._sum.amount || 0) },
      });

      return installment;
    });
  }

  async getInstallments(id) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new AppError('Project not found', 404);

    const installments = await prisma.paymentInstallment.findMany({
      where: { projectId: id },
      orderBy: { date: 'desc' },
    });

    const totalPaid = installments.reduce((sum, inst) => sum + parseFloat(inst.amount), 0);

    return { installments, totalPaid, remainingAmount: parseFloat(project.totalCost) - totalPaid };
  }

  async getStatusHistory(id, query = {}) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new AppError('Project not found', 404);

    const { page, limit, skip } = parsePagination(query);

    const [history, total] = await Promise.all([
      prisma.projectStatusHistory.findMany({
        where: { projectId: id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.projectStatusHistory.count({ where: { projectId: id } }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return { data: history, pagination: { page, limit, total, totalPages } };
  }
}

module.exports = new ProjectsService();
