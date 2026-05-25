const analyticsService = require("./analytics.service");

/**
 * Controller to fetch dashboard statistics summary for the logged-in creator.
 */
const getDashboardController = async (req, res, next) => {
  try {
    const creatorId = req.user.id;
    const summary = await analyticsService.getCreatorDashboardSummary(creatorId);

    return res.status(200).json({
      success: true,
      message: "Creator dashboard analytics retrieved successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch analytics for a specific blog post.
 */
const getPostAnalyticsController = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const summary = await analyticsService.getBlogPostSummary(postId);

    return res.status(200).json({
      success: true,
      message: "Blog post analytics retrieved successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch overall platform health statistics for admins.
 */
const getAdminStatsController = async (req, res, next) => {
  try {
    const summary = await analyticsService.getAdminSummary();

    return res.status(200).json({
      success: true,
      message: "Admin platform statistics retrieved successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardController,
  getPostAnalyticsController,
  getAdminStatsController,
};
