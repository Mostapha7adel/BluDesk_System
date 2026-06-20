const auditLogsService = require('./auditLogs.service');
const ApiResponse = require('../../utils/response');

class AuditLogsController {
  async findAll(req, res, next) {
    try {
      const result = await auditLogsService.findAll(req.query);
      return ApiResponse.paginated(res, result.data, result.pagination, 'Audit logs fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const log = await auditLogsService.findById(parseInt(req.params.id));
      return ApiResponse.success(res, log, 'Audit log fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async getActions(req, res, next) {
    try {
      const actions = await auditLogsService.getActions();
      return ApiResponse.success(res, actions, 'Actions fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuditLogsController();
