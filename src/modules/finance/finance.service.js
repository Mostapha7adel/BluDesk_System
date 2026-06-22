const prisma = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const { parsePagination, parseSort } = require('../../utils/helpers');
const cache = require('../../utils/cache');

class FinanceService {
  // ─── Treasury ───

  async getTreasuries(query) {
    const { page, limit, skip } = parsePagination(query);
    const { isActive } = query;

    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [treasuries, total] = await Promise.all([
      prisma.treasury.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.treasury.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: treasuries,
      pagination: { page, limit, total, totalPages },
    };
  }

  async getTreasuryById(id, query = {}) {
    const { page, limit, skip } = parsePagination(query);

    const treasury = await prisma.treasury.findUnique({ where: { id } });
    if (!treasury) throw new AppError('Treasury not found', 404);

    const [transactions, total] = await Promise.all([
      prisma.financeTransaction.findMany({
        where: { treasuryId: id },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.financeTransaction.count({ where: { treasuryId: id } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      ...treasury,
      transactions,
      pagination: { page, limit, total, totalPages },
    };
  }

  async createTreasury(data) {
    return prisma.treasury.create({
      data: { name: data.name, balance: data.balance || 0, description: data.description },
    });
  }

  async updateTreasury(id, data) {
    const treasury = await prisma.treasury.findUnique({ where: { id } });
    if (!treasury) throw new AppError('Treasury not found', 404);

    const allowedFields = {};
    if (data.name !== undefined) allowedFields.name = data.name;
    if (data.description !== undefined) allowedFields.description = data.description;
    if (data.isActive !== undefined) allowedFields.isActive = data.isActive;

    return prisma.treasury.update({ where: { id }, data: allowedFields });
  }

  // ─── Transactions ───

  async createTransaction(data, userId) {
    return prisma.$transaction(async (tx) => {
      const treasury = await tx.treasury.findUnique({
        where: { id: data.treasuryId },
      });
      if (!treasury) throw new AppError('Treasury not found', 404);

      const amount = parseFloat(data.amount);
      const newBalance =
        data.type === 'INCOME' || data.type === 'DEPOSIT'
          ? parseFloat(treasury.balance) + amount
          : data.type === 'EXPENSE'
          ? parseFloat(treasury.balance) - amount
          : parseFloat(treasury.balance);

      if (newBalance < 0) {
        throw new AppError('Insufficient balance', 400);
      }

      const txn = await tx.financeTransaction.create({
        data: {
          treasuryId: data.treasuryId,
          type: data.type,
          amount,
          description: data.description,
          reference: data.reference,
          recurringType: data.recurringType || 'ONE_TIME',
          date: data.date || new Date(),
          createdBy: userId,
        },
      });

      await tx.treasury.update({
        where: { id: data.treasuryId },
        data: { balance: newBalance },
      });

      cache.flushAll();
      return txn;
    });
  }

  async updateTransaction(id, data, userId) {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.financeTransaction.findUnique({ where: { id } });
      if (!transaction) throw new AppError('Transaction not found', 404);
      if (transaction.cancelledAt) throw new AppError('Cannot edit a cancelled transaction', 400);

      const oldType = transaction.type;
      const oldAmount = parseFloat(transaction.amount);
      const newType = data.type || oldType;
      const newAmount = data.amount !== undefined ? parseFloat(data.amount) : oldAmount;

      const oldEffect = (oldType === 'INCOME' || oldType === 'DEPOSIT') ? oldAmount : -oldAmount;
      const newEffect = (newType === 'INCOME' || newType === 'DEPOSIT') ? newAmount : -newAmount;
      const balanceDelta = newEffect - oldEffect;

      if (balanceDelta !== 0) {
        const treasury = await tx.treasury.findUnique({ where: { id: transaction.treasuryId } });
        if (!treasury) throw new AppError('Treasury not found', 404);

        const newBalance = parseFloat(treasury.balance) + balanceDelta;
        if (newBalance < 0) throw new AppError('Insufficient balance after update', 400);

        await tx.treasury.update({
          where: { id: transaction.treasuryId },
          data: { balance: newBalance },
        });
      }

      const updateData = {};
      if (data.type) updateData.type = data.type;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.reference !== undefined) updateData.reference = data.reference;
      if (data.date !== undefined) updateData.date = data.date;
      if (data.recurringType !== undefined) updateData.recurringType = data.recurringType;

      cache.flushAll();
      return tx.financeTransaction.update({ where: { id }, data: updateData });
    });
  }

  async cancelTransaction(id, userId) {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.financeTransaction.findUnique({ where: { id } });
      if (!transaction) throw new AppError('Transaction not found', 404);
      if (transaction.cancelledAt) throw new AppError('Transaction already cancelled', 400);

      const treasury = await tx.treasury.findUnique({ where: { id: transaction.treasuryId } });
      if (!treasury) throw new AppError('Treasury not found', 404);

      let newBalance = parseFloat(treasury.balance);
      if (transaction.type === 'INCOME' || transaction.type === 'DEPOSIT') {
        newBalance -= parseFloat(transaction.amount);
      } else if (transaction.type === 'EXPENSE') {
        newBalance += parseFloat(transaction.amount);
      }

      if (newBalance < 0) {
        throw new AppError('Insufficient balance after reversal', 400);
      }

      await tx.treasury.update({
        where: { id: transaction.treasuryId },
        data: { balance: newBalance },
      });

      cache.flushAll();
      return tx.financeTransaction.update({
        where: { id },
        data: { cancelledAt: new Date(), cancelledBy: userId },
      });
    });
  }

  async getTransactions(query) {
    const { page, limit, skip } = parsePagination(query);
    const { treasuryId, type, startDate, endDate, includeCancelled } = query;

    const where = {};
    if (treasuryId) where.treasuryId = parseInt(treasuryId);
    if (type) where.type = type;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (includeCancelled !== 'true') where.cancelledAt = null;

    const [transactions, total] = await Promise.all([
      prisma.financeTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: parseSort(query, 'date'),
        include: { treasury: { select: { id: true, name: true } } },
      }),
      prisma.financeTransaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const summary = await this.getSummary(where);

    return {
      data: transactions,
      pagination: { page, limit, total, totalPages },
      summary,
    };
  }

  async getSummary(where = {}) {
    const whereActive = { ...where, cancelledAt: null };
    const stableKey = JSON.stringify(whereActive, Object.keys(whereActive).sort());
    const cacheKey = `finance:summary:${stableKey}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const [incomeAgg, depositAgg, expenseAgg, totalCount] = await Promise.all([
      prisma.financeTransaction.aggregate({
        where: { ...whereActive, type: 'INCOME' },
        _sum: { amount: true },
      }),
      prisma.financeTransaction.aggregate({
        where: { ...whereActive, type: 'DEPOSIT' },
        _sum: { amount: true },
      }),
      prisma.financeTransaction.aggregate({
        where: { ...whereActive, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
      prisma.financeTransaction.count({ where: whereActive }),
    ]);

    const totalIncome = parseFloat(incomeAgg._sum?.amount || 0) + parseFloat(depositAgg._sum?.amount || 0);
    const totalExpense = parseFloat(expenseAgg._sum?.amount || 0);

    const result = {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      totalTransactions: totalCount,
    };

    cache.set(cacheKey, result, 60);
    return result;
  }

  async getFinancialReport(startDate, endDate, query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const { includeCancelled } = query;

    const where = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (includeCancelled !== 'true') where.cancelledAt = null;

    const [transactions, totalTransactions] = await Promise.all([
      prisma.financeTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: parseSort(query, 'date'),
        include: { treasury: { select: { name: true } } },
      }),
      prisma.financeTransaction.count({ where }),
    ]);

    const treasuries = await prisma.treasury.findMany({
      where: { isActive: true },
    });

    const summary = await this.getSummary(where);

    const totalPages = Math.ceil(totalTransactions / limit);

    return {
      period: { startDate, endDate },
      treasuries: treasuries.map((t) => ({
        id: t.id,
        name: t.name,
        balance: t.balance,
      })),
      summary,
      transactions,
      pagination: { page, limit, total: totalTransactions, totalPages },
    };
  }
}

module.exports = new FinanceService();
