const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/authorize.middleware");
const { ROLES } = require("../../config/roles");

const {
  getDashboardController,
  getPostAnalyticsController,
  getAdminStatsController,
} = require("./analytics.controller");

// Apply basic authentication globally to all analytics routes
router.use(authMiddleware);

// Creator routes (allows both USER and ADMIN because of role hierarchy)
router.get(
  "/dashboard",
  authorize(ROLES.USER),
  getDashboardController
);

router.get(
  "/posts/:postId",
  authorize(ROLES.USER),
  getPostAnalyticsController
);

// Strict Admin route
router.get(
  "/admin",
  authorize(ROLES.ADMIN),
  getAdminStatsController
);

module.exports = router;
