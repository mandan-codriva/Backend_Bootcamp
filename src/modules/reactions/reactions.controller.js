const reactionsService = require(
  "./reactions.service"
);

const toggleReactionController = async (
  req,
  res,
  next
) => {
  try {
    const { postId, reactionType } =
      req.body;

    const userId = req.user.id;

    const result =
      await reactionsService.toggleReactionService(
        {
          userId,
          postId,
          reactionType,
        }
      );

    return res.status(200).json({
      success: true,
      message: `Reaction ${result.action} successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getReactionCountsController =
  async (req, res, next) => {
    try {
      const { postId } = req.params;

      const counts =
        await reactionsService.getReactionCountsService(
          postId
        );

      return res.status(200).json({
        success: true,
        data: counts,
      });
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  toggleReactionController,
  getReactionCountsController,
};