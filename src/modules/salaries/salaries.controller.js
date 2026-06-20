const salariesService = require('./salaries.service');
const ApiResponse = require('../../utils/response');

class SalariesController {
  async findAll(req, res, next) {
    try {
      const result = await salariesService.findAll(req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Salaries fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const payment = await salariesService.findById(parseInt(req.params.id));
      return ApiResponse.success(res, payment, 'Salary payment fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const payment = await salariesService.create(req.body);
      return ApiResponse.created(res, payment, 'Salary payment created successfully');
    } catch (error) {
      next(error);
    }
  }

  async approve(req, res, next) {
    try {
      const payment = await salariesService.updateStatus(
        parseInt(req.params.id),
        { status: 'APPROVED', notes: req.body.notes },
        req.user.id
      );
      return ApiResponse.success(res, payment, 'Salary approved successfully');
    } catch (error) {
      next(error);
    }
  }

  async pay(req, res, next) {
    try {
      const payment = await salariesService.updateStatus(
        parseInt(req.params.id),
        { status: 'PAID', notes: req.body.notes },
        req.user.id
      );
      return ApiResponse.success(res, payment, 'Salary marked as paid');
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const payment = await salariesService.updateStatus(
        parseInt(req.params.id),
        { status: 'CANCELLED', notes: req.body.notes },
        req.user.id
      );
      return ApiResponse.success(res, payment, 'Salary payment cancelled');
    } catch (error) {
      next(error);
    }
  }

  async getPendingApprovals(req, res, next) {
    try {
      const payments = await salariesService.getPendingApprovals();
      return ApiResponse.success(res, payments, 'Pending approvals fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SalariesController();