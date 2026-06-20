const settingsService = require('./settings.service');
const ApiResponse = require('../../utils/response');

class SettingsController {
  async getSystemHealth(req, res, next) {
    try {
      const health = await settingsService.getSystemHealth();
      return ApiResponse.success(res, health);
    } catch (error) {
      next(error);
    }
  }

  async createBackup(req, res, next) {
    try {
      const backup = await settingsService.createBackup();
      return res.download(backup.filepath, backup.filename);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SettingsController();
