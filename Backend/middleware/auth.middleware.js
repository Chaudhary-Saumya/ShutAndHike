const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { ROLES } = require('../config/roles');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No authorization token provided.'
      });
    }

    const secret = process.env.JWT_SECRET || 'shut_hike_jwt_secret';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.'
      });
    }

    req.user = user;
    req.data = user; // Kept for backward compatibility
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.'
      });
    }
    next(error);
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = req.user.role;
    const isAllowed = allowedRoles.some(
      (role) => role.toLowerCase() === userRole.toLowerCase()
    );

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${userRole}' is not authorized to perform this action. Required role: ${allowedRoles.join(' or ')}.`
      });
    }

    next();
  };
};

const isAdmin = authorize(ROLES.ADMIN);
const isAdminOrManager = authorize(ROLES.ADMIN, ROLES.MANAGER);

module.exports = {
  authenticate,
  authorize,
  isAdmin,
  isAdminOrManager
};
