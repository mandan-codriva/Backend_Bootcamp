const postsRepository = require("./posts.repository");

const mediaService = require("./media.service");
const authRepository = require("../auth/auth.repository");

const activityService = require("../activity/activity.service");

const { ACTIVITY_TYPES } = require('../activity/activity.constants');

const createPostService = async (postData, userId) => {
  console.log("postData is in post service", postData);
  const { title, content, media: mediaIds, status, category } = postData;

  // Create post first
  const post = await postsRepository.createPost(title, content, userId, status, category);

  // Save uploaded media
  const media = await mediaService.savePostMediaService(post.id, mediaIds);

  await activityService.createActivity({
    userId,
    activityType: ACTIVITY_TYPES.BLOG_PUBLISHED,
    entityId: post.id,
    entityType: "post"
  });

  return {
    ...post,
    media,
  };
};

const getAllPostsService = async (queryParams) => {
  let {
    page = 1,
    limit = 5,
    search = "",
    category = "",
    userId,
    authorId,
    status,
    sortBy = "created_at",
    sortOrder = "DESC",
  } = queryParams;

  const finalUserId = userId || authorId;

  // Resolve final status filter:
  // 1. If status is explicitly passed, use it.
  // 2. If no status is passed and finalUserId is provided, do NOT filter by status (return all).
  // 3. If no status is passed and no user filter is provided, default to 'published' for security.
  let finalStatus = status || null;
  if (!status && !finalUserId) {
    finalStatus = "published";
  }

  // Whitelist sort fields to prevent SQL injection
  const allowedSortFields = ["created_at", "published_at", "title"];
  const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "created_at";

  // Normalize sortOrder
  const finalSortOrder = ["ASC", "DESC"].includes(String(sortOrder).toUpperCase())
    ? String(sortOrder).toUpperCase()
    : "DESC";

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  // Validation
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  if (isNaN(limit) || limit < 1 || limit > 50) {
    limit = 5;
  }

  const posts = await postsRepository.getAllPosts(
    page,
    limit,
    search,
    category,
    finalUserId,
    finalStatus,
    finalSortBy,
    finalSortOrder
  );

  const totalPosts = await postsRepository.totalPosts(
    search,
    category,
    finalUserId,
    finalStatus
  );

  const totalPages = Math.ceil(totalPosts / limit);

  return {
    page,
    limit,
    search,
    category,
    status: finalStatus,
    sortBy: finalSortBy,
    sortOrder: finalSortOrder,
    totalPosts,
    totalPages,

    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,

    posts,
  };
};

const getPostByIdService = async (id) => {
  const post = await postsRepository.getPostById(id);

  if (!post) {
    const error = new Error("Post not found");
    error.status = 404;
    throw error;
  }
  const media = await mediaService.getPostMediaService(id);

  return {
    ...post,
    media,
  };
};

const updatePostService = async (postId, postData, userId) => {
  const existingPost = await postsRepository.getPostById(postId);

  if (!existingPost) {
    const error = new Error("existing Post not found");
    error.status = 404;
    throw error;
  }

  if (existingPost.author_id !== userId) {
    const error = new Error("You are not allowed to update this post");
    error.status = 403;
    throw error;
  }

  const updatedPost = await postsRepository.updatepost(
    postId,
    postData.title,
    postData.content,
    postData.status,
    postData.category,
  );

  return updatedPost;
};

const deletePostService = async (postId, userId) => {
  const existingPost = await postsRepository.getPostById(postId);

  if (!existingPost) {
    const error = new Error("existing Post not found");
    error.status = 404;
    throw error;
  }

  if (existingPost.author_id !== userId) {
    const error = new Error("You are not allowed to delete this post");
    error.status = 403;
    throw error;
  }

  const deletedPost = await postsRepository.deletePost(postId);

  return deletedPost;
};

module.exports = {
  createPostService,
  getAllPostsService,
  getPostByIdService,
  updatePostService,
  deletePostService,
};
