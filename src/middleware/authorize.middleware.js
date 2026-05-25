const { ROLE_HIERARCHY } = require("../config/roles");

/**
 * Middleware to enforce role-based access control (RBAC) with support for role hierarchy.
 * @param {string} minimumRequiredRole The minimum role required to access the route
 */
const authorize = (minimumRequiredRole) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Authentication required",
        });
      }

      const userRole = (req.user.role || "user").toLowerCase();
      const requiredRole = minimumRequiredRole.toLowerCase();

      const userWeight = ROLE_HIERARCHY[userRole] || 0;
      const requiredWeight = ROLE_HIERARCHY[requiredRole] || 999;

      if (userWeight < requiredWeight) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Access denied. Required role level: '${minimumRequiredRole}'`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal authorization error",
        error: error.message,
      });
    }
  };
};

module.exports = authorize;
