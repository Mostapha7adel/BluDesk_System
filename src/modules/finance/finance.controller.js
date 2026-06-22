const financeService = require('./finance.service');
const ApiResponse = require('../../utils/response');

class FinanceController {
  // Treasury
  async getTreasuries(req, res, next) {
    try {
      const result = await financeService.getTreasuries(req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Treasuries fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTreasuryById(req, res, next) {
    try {
      const treasury = await financeService.getTreasuryById(parseInt(req.params.id), req.query);
      return ApiResponse.success(res, treasury, 'Treasury fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async createTreasury(req, res, next) {
    try {
      const treasury = await financeService.createTreasury(req.body);
      return ApiResponse.created(res, treasury, 'Treasury created successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateTreasury(req, res, next) {
    try {
      const treasury = await financeService.updateTreasury(parseInt(req.params.id), req.body);
      return ApiResponse.success(res, treasury, 'Treasury updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Transactions
  async createTransaction(req, res, next) {
    try {
      const transaction = await financeService.createTransaction(req.body, req.user.id);
      return ApiResponse.created(res, transaction, 'Transaction created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const result = await financeService.getTransactions(req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Transactions fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateTransaction(req, res, next) {
    try {
      const transaction = await financeService.updateTransaction(parseInt(req.params.id), req.body, req.user.id);
      return ApiResponse.success(res, transaction, 'Transaction updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async cancelTransaction(req, res, next) {
    try {
      const transaction = await financeService.cancelTransaction(parseInt(req.params.id), req.user.id);
      return ApiResponse.success(res, transaction, 'Transaction cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  // Reports
  async getFinancialReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await financeService.getFinancialReport(startDate, endDate, req.query);
      return ApiResponse.success(res, report, 'Financial report generated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FinanceController();
