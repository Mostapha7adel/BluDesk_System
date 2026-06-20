const prisma = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const { parsePagination, parseSort } = require('../../utils/helpers');

class ExpensesService {
  async findAll(query) {
    const { page, limit, skip } = parsePagination(query);
    const { category, startDate, endDate } = query;

    const where = { deletedAt: null };
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: parseSort(query, 'date'),
      }),
      prisma.expense.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const summary = await this.getSummary(where);

    return {
      data: expenses,
      pagination: { page, limit, total, totalPages },
      summary,
    };
  }

  async findById(id) {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new AppError('Expense not found', 404);
    return expense;
  }

  async create(data, userId) {
    return prisma.expense.create({
      data: { ...data, createdBy: userId },
    });
  }

  async update(id, data) {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new AppError('Expense not found', 404);

    const allowedFields = {};
    if (data.category !== undefined) allowedFields.category = data.category;
    if (data.amount !== undefined) allowedFields.amount = data.amount;
    if (data.description !== undefined) allowedFields.description = data.description;
    if (data.date !== undefined) allowedFields.date = data.date;
    if (data.receipt !== undefined) allowedFields.receipt = data.receipt;

    return prisma.expense.update({ where: { id }, data: allowedFields });
  }

  async delete(id) {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new AppError('Expense not found', 404);

    await prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getMonthlyReport(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const where = {
      deletedAt: null,
      date: { gte: startDate, lte: endDate },
    };

    const [aggregation, expenses, totalCount] = await Promise.all([
      prisma.expense.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        take: 1000,
      }),
      prisma.expense.count({ where }),
    ]);

    const byCategory = expenses.reduce((acc, e) => {
      if (!acc[e.category]) acc[e.category] = { count: 0, total: 0 };
      acc[e.category].count++;
      acc[e.category].total += parseFloat(e.amount);
      return acc;
    }, {});

    return {
      year,
      month,
      totalExpenses: parseFloat(aggregation._sum?.amount || 0),
      totalCount,
      byCategory,
      expenses,
    };
  }

  async getSummary(where = {}) {
    const aggregation = await prisma.expense.aggregate({
      where,
      _sum: { amount: true },
      _count: true,
    });

    const byCategoryRaw = await prisma.expense.groupBy({
      by: ['category'],
      where,
      _sum: { amount: true },
    });

    const byCategory = byCategoryRaw.reduce((acc, item) => {
      acc[item.category] = parseFloat(item._sum.amount || 0);
      return acc;
    }, {});

    return {
      total: parseFloat(aggregation._sum?.amount || 0),
      byCategory,
      count: aggregation._count,
    };
  }
}

module.exports = new ExpensesService();