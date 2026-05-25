const adminRepository = require("./admin.repository");
const authRepository = require("../auth/auth.repository");
const postsRepository = require("../posts/posts.repository");
const commentsRepository = require("../comments/comments.repository");
const { ROLES } = require("../../config/roles");

const listUsersService = async (
  page = 1,
  limit = 10,
  search = null,
  sortBy = "created_at",
  sortOrder = "DESC"
) => {
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;

  // Whitelist sort fields
  const allowedSortFields = ["id", "username", "email", "role", "created_at"];
  const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "username";

  // Normalize sortOrder
  const finalSortOrder = ["ASC", "DESC"].includes(String(sortOrder).toUpperCase())
    ? String(sortOrder).toUpperCase()
    : "DESC";

  // const users = await adminRepository.getAllUsers(page, limit, search, finalSortBy, finalSortOrder);
  // const total = await adminRepository.totalUsers(search);

  const [users, total] = await Promise.all([
    adminRepository.getAllUsers(page, limit, search, finalSortBy, finalSortOrder),
    adminRepository.totalUsers(search)

  ]);
  const totalPages = Math.ceil(total / limit);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

const updateUserRoleService = async (userId, targetRole, currentAdminId) => {
  // Normalize and validate target role
  const normalizedRole = targetRole ? targetRole.toLowerCase() : "";
  const validRoles = Object.values(ROLES);

  if (!validRoles.includes(normalizedRole)) {
    const error = new Error(`Invalid role: '${targetRole}'. Valid roles: ${validRoles.join(", ")}`);
    error.status = 400;
    throw error;
  }

  // Find user to check if they exist
  const user = await authRepository.findUserById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  // Prevent self demotion to keep the platform safe
  if (parseInt(userId, 10) === parseInt(currentAdminId, 10) && normalizedRole !== ROLES.ADMIN) {
    const error = new Error("Self-demotion is not allowed. You cannot strip your own admin privileges.");
    error.status = 400;
    throw error;
  }

  const updatedUser = await authRepository.updateUserRole(userId, normalizedRole);
  return updatedUser;
};

const moderateDeletePostService = async (postId) => {
  const post = await postsRepository.getPostById(postId);
  if (!post) {
    const error = new Error("Post not found");
    error.status = 404;
    throw error;
  }

  const deletedPost = await postsRepository.deletePost(postId);
  return deletedPost;
};

const moderateDeleteCommentService = async (commentId) => {
  const comment = await commentsRepository.findCommentById(commentId);
  if (!comment) {
    const error = new Error("Comment not found");
    error.status = 404;
    throw error;
  }

  const deletedComment = await commentsRepository.deleteComment(commentId);
  return deletedComment;
};

const getStatsService = async () => {
  const [stats, usersPerMonth, blogsPerMonth] = await Promise.all([
    adminRepository.getSystemStats(),
    adminRepository.getNewUsersPerMonthStats(),
    adminRepository.getNewBlogsPerMonthStats(),
  ]);

  return {
    ...stats,
    usersPerMonth,
    blogsPerMonth,
  };
};

const getUserDetailService = async (userId) => {
  const user = await adminRepository.getUserDetailForAdmin(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  const posts = await adminRepository.getUserPostsForAdmin(userId);
  return {
    ...user,
    posts,
  };
};

const updateUserDetailService = async (userId, updateData, currentAdminId) => {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  // Only permit profile changes (fullName, bio, avatarUrl)
  const allowedKeys = ["fullName", "bio", "avatarUrl"];
  const incomingKeys = Object.keys(updateData);
  const invalidKeys = incomingKeys.filter(key => !allowedKeys.includes(key));
  if (invalidKeys.length > 0) {
    const error = new Error(`Only profile details (fullName, bio, avatarUrl) can be updated. Modifying ${invalidKeys.join(", ")} is not allowed.`);
    error.status = 400;
    throw error;
  }

  await adminRepository.adminUpdateUserAndProfile(userId, {
    fullName: updateData.fullName,
    bio: updateData.bio,
    avatarUrl: updateData.avatarUrl,
  });

  // Return the newly updated details
  return await getUserDetailService(userId);
};

module.exports = {
  listUsersService,
  updateUserRoleService,
  moderateDeletePostService,
  moderateDeleteCommentService,
  getStatsService,
  getUserDetailService,
  updateUserDetailService,
};
