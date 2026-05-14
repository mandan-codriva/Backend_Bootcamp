const commentsRepository = require(
  "./comments.repository"
);

const createCommentService = async ({
  postId,
  userId,
  content,
  parentCommentId,
}) => {
  const comment =
    await commentsRepository.createComment({
      postId,
      userId,
      content,
      parentCommentId,
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



  // STEP 1
  // Create map
  comments.forEach((comment) => {
    comment.replies = [];

    commentMap[comment.id] = comment;
  });



  // STEP 2
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
  updateCommentService,
  deleteCommentService,
};