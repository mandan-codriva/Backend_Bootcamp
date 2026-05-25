
const commentsRepository = require(
  "./comments.repository"
);

const activityService = require(
  "../activity/activity.service"
);

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
      throw new Error(
        "Parent comment not found"
      );
    }

    if (parentComment.post_id !== postId) {
      throw new Error(
        "Reply must belong to same post"
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
    throw new Error("Comment not found");
  }

  if (existingComment.user_id !== userId) {
    throw new Error(
      "You are not authorized to update this comment"
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
    throw new Error("Comment not found");
  }

  if (existingComment.user_id !== userId) {
    throw new Error(
      "You are not authorized to delete this comment"
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