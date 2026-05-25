const adminService = require("./admin.service");

const listUsersController = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      keyword,
      search ,
      sortBy = "created_at",
      sort_by = null,
      sortOrder = "DESC",
      sort_order,
      order
    } = req.query;


    const finalSearch = search || keyword || null;
    const finalSortBy = sort_by || sortBy;
    const finalSortOrder = order || sort_order || sortOrder;

    const allowedSortOrders = ["ASC", "DESC"];
    if (!allowedSortOrders.includes(finalSortOrder)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort order. Use ASC or DESC",
      });
    }

    const result = await adminService.listUsersService(
      page,
      limit,
      finalSearch,
      finalSortBy,
      finalSortOrder
    );

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRoleController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentAdminId = req.user.id;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required in request body",
      });
    }

    const updatedUser = await adminService.updateUserRoleService(id, role, currentAdminId);

    res.status(200).json({
      success: true,
      message: `User role updated successfully to '${role}'`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

const moderateDeletePostController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedPost = await adminService.moderateDeletePostService(id);

    res.status(200).json({
      success: true,
      message: "Post moderated and deleted successfully",
      data: deletedPost,
    });
  } catch (error) {
    next(error);
  }
};

const moderateDeleteCommentController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedComment = await adminService.moderateDeleteCommentService(id);

    res.status(200).json({
      success: true,
      message: "Comment moderated and deleted successfully",
      data: deletedComment,
    });
  } catch (error) {
    next(error);
  }
};

const getStatsController = async (req, res, next) => {
  try {
    const stats = await adminService.getStatsService();

    res.status(200).json({
      success: true,
      message: "System statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

const getUserDetailController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userDetail = await adminService.getUserDetailService(id);

    res.status(200).json({
      success: true,
      message: "User details retrieved successfully by admin",
      data: userDetail,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserDetailController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentAdminId = req.user.id;
    const updatedUser = await adminService.updateUserDetailService(id, req.body, currentAdminId);

    res.status(200).json({
      success: true,
      message: "User profile updated successfully by admin",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUsersController,
  updateUserRoleController,
  moderateDeletePostController,
  moderateDeleteCommentController,
  getStatsController,
  getUserDetailController,
  updateUserDetailController,
};
