const authService = require('./auth.service');
const ApiResponse = require('../../utils/response');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password, req.ip, req.headers['user-agent']);
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        return ApiResponse.unauthorized(res, 'Refresh token is required');
      }
      const result = await authService.refreshToken(token, req.ip, req.headers['user-agent']);
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
      return ApiResponse.success(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (token) {
        await authService.logoutByToken(token, req.ip, req.headers['user-agent']);
      }
      res.clearCookie('refreshToken', { path: '/api/v1/auth' });
      return ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req, res, next) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (token) {
        await authService.logoutAllByToken(token, req.ip, req.headers['user-agent']);
      }
      res.clearCookie('refreshToken', { path: '/api/v1/auth' });
      return ApiResponse.success(res, null, 'Logged out from all devices');
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      return ApiResponse.success(res, null, 'If the email exists, a reset link has been sent');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      return ApiResponse.success(res, null, 'Password reset successfully');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user.id, currentPassword, newPassword);
      return ApiResponse.success(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      return ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
