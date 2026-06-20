const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../../config/database');
const config = require('../../config');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/token');
const { sanitizeUser } = require('../../utils/helpers');
const { AppError } = require('../../middlewares/errorHandler');
const logger = require('../../utils/logger');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

class AuthService {
  async login(email, password, ipAddress, userAgent) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.lockUntil && new Date() < user.lockUntil) {
      const remainingMs = user.lockUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      throw new AppError(`Account locked. Try again in ${remainingMin} minute(s)`, 423);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const newAttempts = (user.loginAttempts || 0) + 1;
      const updateData = { loginAttempts: newAttempts };
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
      }
      await prisma.user.update({ where: { id: user.id }, data: updateData });
      throw new AppError('Invalid email or password', 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockUntil: null },
    });

    const tokenPayload = { id: user.id, email: user.email, role: user.role.slug };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'auth',
        ipAddress,
        userAgent,
      },
    });

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
      permissions: user.role.rolePermissions.map((rp) => rp.permission.slug),
    };
  }

  async refreshToken(token, ipAddress, userAgent) {
    const decoded = verifyRefreshToken(token);

    const storedToken = await prisma.refreshToken.findFirst({
      where: { token, userId: decoded.id, revoked: false },
    });

    if (!storedToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    if (new Date() > storedToken.expiresAt) {
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      });
      throw new AppError('Refresh token expired', 401);
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('User not found or inactive', 401);
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role.slug };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user: sanitizeUser(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      permissions: user.role.rolePermissions.map((rp) => rp.permission.slug),
    };
  }

  async logoutByToken(token, ipAddress, userAgent) {
    const stored = await prisma.refreshToken.findFirst({
      where: { token, revoked: false },
    });
    if (!stored) return;

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: stored.userId,
        action: 'LOGOUT',
        entity: 'auth',
        ipAddress,
        userAgent,
      },
    });
  }

  async logoutAllByToken(token, ipAddress, userAgent) {
    const stored = await prisma.refreshToken.findFirst({
      where: { token, revoked: false },
    });
    if (!stored) return;

    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revoked: false },
      data: { revoked: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: stored.userId,
        action: 'LOGOUT',
        entity: 'auth',
        ipAddress,
        userAgent,
      },
    });
  }

  async logout(userId, token, ipAddress, userAgent) {
    await prisma.refreshToken.updateMany({
      where: { token, userId },
      data: { revoked: true },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        entity: 'auth',
        ipAddress,
        userAgent,
      },
    });
  }

  async logoutAll(userId, ipAddress, userAgent) {
    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        entity: 'auth',
        ipAddress,
        userAgent,
      },
    });
  }

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { resetToken: resetTokenHash, resetTokenExp },
    });

    try {
      const transporter = require('../../utils/email');
      await transporter.sendMail({
        to: user.email,
        subject: 'Password Reset - BlueDesk',
        html: `<p>You requested a password reset.</p>
               <p>Click <a href="${config.cors.origin}/reset-password/${resetToken}">here</a> to reset your password.</p>
               <p>This link expires in 1 hour.</p>`,
      });
    } catch (err) {
      logger.error('Email send failed:', err);
    }
  }

  async resetPassword(token, password) {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: resetTokenHash,
        resetTokenExp: { gte: new Date() },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null,
        loginAttempts: 0,
        lockUntil: null,
      },
    });

    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revoked: false },
      data: { revoked: true },
    });
  }

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!user) throw new AppError('User not found', 404);
    return sanitizeUser(user);
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PASSWORD_CHANGE',
        entity: 'auth',
      },
    });
  }
}

module.exports = new AuthService();