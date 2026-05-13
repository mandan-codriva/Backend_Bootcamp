const postsService = require(
  "./posts.service"
);

const createPostController = async (
  req,
  res,
  next
) => {
  try {
    const post =
      await postsService.createPostService(
        req.body,
        req.user.id
      );

    res.status(201).json({
      success: true,
      message:
        "Post created successfully",
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

const getAllPostsController = async (
  req,
  res,
  next
) => {
  try {
    const posts =
      await postsService.getAllPostsService();

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

const getPostByIdController = async (
  req,
  res,
  next
) => {
  try {
    const post =
      await postsService.getPostByIdService(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

const updatePostController = async (
  req,
  res,
  next
) => {
  try {
    const updatedPost =
      await postsService.updatePostService(
        req.params.id,
        req.body,
        req.user.id
      );

    res.status(200).json({
      success: true,
      message:
        "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};


const deletePostController = async (
  req,
  res,
  next
) => {
  try {
    const deletedPost =
      await postsService.deletePostService(
        req.params.id,
        req.user.id
      );

    res.status(200).json({
      success: true,
      message:
        "Post deleted successfully",
      data: deletedPost,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createPostController,
  getAllPostsController,
  getPostByIdController,
  updatePostController,
  deletePostController,
};