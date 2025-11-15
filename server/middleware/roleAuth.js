const User = require('../models/User');
const Admin = require('../models/Admin');
const Mentor = require('../models/Mentor');

const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      }

      req.userRole = user.role;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Authorization error', error: error.message });
    }
  };
};

const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const admin = await Admin.findOne({ userId: req.user.id });
      
      if (!admin || !admin.hasPermission(permission)) {
        return res.status(403).json({ message: 'Access denied. Missing required permission.' });
      }

      req.admin = admin;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Permission check error', error: error.message });
    }
  };
};

module.exports = { requireRole, requirePermission };
