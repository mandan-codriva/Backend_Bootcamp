
const commentsRepository = require(
  "./comments.repository"
);

const activityService = require(
  "../activity/activity.service"
);

const AppError = require("../../utils/appError");
const {
  ACTIVITY_TYPES,
} = require(
  "../activity/activity.constants"
);

const createCommentService = async ({
  postId,
  userId,
  content,
  parentCommentId,
}) => {

  // Validate parent comment
  if (parentCommentId) {

    const parentComment =
      await commentsRepository.findCommentById(
        parentCommentId
      );

    if (!parentComment) {
      throw new AppError(
        "Parent comment not found",
        404
      );
    }

    if (parentComment.post_id !== postId) {
      throw new AppError(
        "Reply must belong to same post",
        400
      );
    }
  }

  // Create comment
  const comment =
    await commentsRepository.createComment({
      postId,
      userId,
      content,
      parentCommentId,
    });

  // Activity logging
  await activityService.createActivity({
    userId,

    activityType: parentCommentId
      ? ACTIVITY_TYPES.REPLY_CREATED
      : ACTIVITY_TYPES.COMMENT_CREATED,

    entityId: comment.id,

    entityType: "comment",

    metadata: {
      postId,
      parentCommentId,
    },
  });

  return comment;
};

const getCommentsByPostService = async (
  postId
) => {

  const comments =
    await commentsRepository.findCommentsByPostId(
      postId
    );

  const commentMap = {};

  const rootComments = [];



  // Create map
  comments.forEach((comment) => {

    comment.replies = [];

    commentMap[comment.id] = comment;

  });



  // Build tree
  comments.forEach((comment) => {

    if (comment.parent_comment_id) {

      const parentComment =
        commentMap[comment.parent_comment_id];

      if (parentComment) {

        parentComment.replies.push(comment);

      }

    } else {

      rootComments.push(comment);

    }

  });

  return rootComments;
};

const getRepliesByCommentService =
  async (commentId) => {

    const replies =
      await commentsRepository.findRepliesByCommentId(
        commentId
      );

    return replies;

};



const updateCommentService = async ({
  commentId,
  userId,
  content,
}) => {

  const existingComment =
    await commentsRepository.findCommentById(
      commentId
    );

  if (!existingComment) {
    throw new AppError("Comment not found", 404);
  }

  if (existingComment.user_id !== userId) {
    throw new AppError(
      "You are not authorized to update this comment",
      403
    );
  }

  const updatedComment =
    await commentsRepository.updateComment(
      commentId,
      content
    );

  return updatedComment;
};

const deleteCommentService = async ({
  commentId,
  userId,
}) => {

  const existingComment =
    await commentsRepository.findCommentById(
      commentId
    );

  if (!existingComment) {
    throw new AppError("Comment not found", 404);
  }

  if (existingComment.user_id !== userId) {
    throw new AppError(
      "You are not authorized to delete this comment",
      403
    );
  }

  const deletedComment =
    await commentsRepository.deleteComment(
      commentId
    );

  return deletedComment;
};

module.exports = {
  createCommentService,
  getCommentsByPostService,
  getRepliesByCommentService,
  updateCommentService,
  deleteCommentService,
};