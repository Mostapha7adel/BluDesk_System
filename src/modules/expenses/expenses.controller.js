const expensesService = require('./expenses.service');
const ApiResponse = require('../../utils/response');

class ExpensesController {
  async findAll(req, res, next) {
    try {
      const result = await expensesService.findAll(req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Expenses fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const expense = await expensesService.findById(parseInt(req.params.id));
      return ApiResponse.success(res, expense, 'Expense fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const expense = await expensesService.create(req.body, req.user.id);
      return ApiResponse.created(res, expense, 'Expense created successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const expense = await expensesService.update(parseInt(req.params.id), req.body);
      return ApiResponse.success(res, expense, 'Expense updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await expensesService.delete(parseInt(req.params.id));
      return ApiResponse.success(res, null, 'Expense deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyReport(req, res, next) {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const report = await expensesService.getMonthlyReport(year, month);
      return ApiResponse.success(res, report, 'Monthly report generated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExpensesController();
