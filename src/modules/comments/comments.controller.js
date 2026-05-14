const commentsService = require(
  "./comments.service"
);

const createCommentController = async (
  req,
  res,
  next
) => {
  try {
    const {
      postId,
      content,
      parentCommentId,
    } = req.body;

    const userId = req.user.id;

    const comment =
      await commentsService.createCommentService({
        postId,
        userId,
        content,
        parentCommentId,
      });

    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

const getCommentsByPostController = async (
  req,
  res,
  next
) => {
  try {
    const { postId } = req.params;

    const comments =
      await commentsService.getCommentsByPostService(
        postId
      );

    return res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

const updateCommentController = async (
  req,
  res,
  next
) => {
  try {
    const { commentId } = req.params;

    const { content } = req.body;

    const userId = req.user.id;

    const updatedComment =
      await commentsService.updateCommentService({
        commentId,
        userId,
        content,
      });

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCommentController = async (
  req,
  res,
  next
) => {
  try {
    const { commentId } = req.params;

    const userId = req.user.id;

    const deletedComment =
      await commentsService.deleteCommentService({
        commentId,
        userId,
      });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      data: deletedComment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCommentController,
  getCommentsByPostController,
  updateCommentController,
  deleteCommentController,
};