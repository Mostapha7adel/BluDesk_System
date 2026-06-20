const prisma = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const { parsePagination, parseSort } = require('../../utils/helpers');
const cache = require('../../utils/cache');

class SalariesService {
  async findAll(query) {
    const { page, limit, skip } = parsePagination(query);
    const { employeeId, status, month, year } = query;

    const where = {};
    if (employeeId) where.employeeId = parseInt(employeeId);
    if (status) where.status = status;
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    const [payments, total] = await Promise.all([
      prisma.salaryPayment.findMany({
        where,
        skip,
        take: limit,
        orderBy: parseSort(query),
        include: {
          employee: { select: { id: true, name: true, employeeNumber: true, position: true, department: true, salary: true, image: true } },
        },
      }),
      prisma.salaryPayment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return { data: payments, pagination: { page, limit, total, totalPages } };
  }

  async findById(id) {
    const payment = await prisma.salaryPayment.findUnique({
      where: { id },
      include: { employee: { select: { id: true, name: true, employeeNumber: true, position: true, department: true, salary: true, image: true } } },
    });
    if (!payment) throw new AppError('Salary payment not found', 404);
    return payment;
  }

  async create(data) {
    const employee = await prisma.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) throw new AppError('Employee not found', 404);

    const existing = await prisma.salaryPayment.findUnique({
      where: { employeeId_month_year: { employeeId: data.employeeId, month: data.month, year: data.year } },
    });
    if (existing) throw new AppError('Salary already exists for this employee in this month/year', 409);

    return prisma.salaryPayment.create({
      data: { employeeId: data.employeeId, amount: data.amount, month: data.month, year: data.year, notes: data.notes },
      include: { employee: { select: { id: true, name: true, employeeNumber: true, position: true, department: true, salary: true, image: true } } },
    });
  }

  async updateStatus(id, data, userId) {
    const payment = await prisma.salaryPayment.findUnique({
      where: { id },
      include: { employee: { select: { id: true, name: true } } },
    });
    if (!payment) throw new AppError('Salary payment not found', 404);

    const VALID_TRANSITIONS = {
      PENDING: ['APPROVED', 'CANCELLED'],
      APPROVED: ['PAID', 'CANCELLED'],
      PAID: [],
      CANCELLED: [],
    };

    const allowed = VALID_TRANSITIONS[payment.status];
    if (!allowed || !allowed.includes(data.status)) {
      throw new AppError(`Cannot transition from ${payment.status} to ${data.status}`, 400);
    }

    const updateData = { status: data.status, notes: data.notes ?? payment.notes };
    if (data.status === 'APPROVED' || data.status === 'PAID') {
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
    }

    if (data.status === 'PAID') {
      return prisma.$transaction(async (tx) => {
        const treasury = await tx.treasury.findFirst({ where: { isActive: true }, orderBy: { id: 'asc' } });
        if (!treasury) throw new AppError('No active treasury found', 400);

        const newBalance = parseFloat(treasury.balance) - parseFloat(payment.amount);
        if (newBalance < 0) throw new AppError('Insufficient treasury balance to pay salary', 400);

        await tx.financeTransaction.create({
          data: {
            treasuryId: treasury.id,
            type: 'EXPENSE',
            amount: payment.amount,
            description: `Salary payment - ${payment.employee?.name || `Employee #${payment.employeeId}`} - ${payment.month}/${payment.year}`,
            reference: `SAL-${payment.id}`,
            date: new Date(),
            createdBy: userId,
          },
        });

        await tx.treasury.update({
          where: { id: treasury.id },
          data: { balance: newBalance },
        });

        cache.del('finance:summary:{}');
        return tx.salaryPayment.update({
          where: { id },
          data: updateData,
          include: { employee: { select: { id: true, name: true, employeeNumber: true, position: true, department: true, salary: true, image: true } } },
        });
      });
    }

    return prisma.salaryPayment.update({
      where: { id },
      data: updateData,
      include: { employee: { select: { id: true, name: true, employeeNumber: true, position: true, department: true, salary: true, image: true } } },
    });
  }

  async getPendingApprovals() {
    return prisma.salaryPayment.findMany({
      where: { status: 'PENDING' },
      include: { employee: { select: { id: true, name: true, employeeNumber: true, position: true, department: true, salary: true, image: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = new SalariesService();