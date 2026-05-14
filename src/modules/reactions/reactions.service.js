const reactionsRepository = require(
  "./reactions.repository"
);

const toggleReactionService = async ({
  userId,
  postId,
  reactionType,
}) => {
  const existingReaction =
    await reactionsRepository.findReaction(
      userId,
      postId
    );

  // CASE 1
  // No reaction exists
  if (!existingReaction) {
    const newReaction =
      await reactionsRepository.createReaction({
        userId,
        postId,
        reactionType,
      });

    return {
      action: "created",
      reaction: newReaction,
    };
  }

  // case2
  // Same reaction clicked again
  if (
    existingReaction.reaction_type ===
    reactionType
  ) {
    await reactionsRepository.deleteReaction(
      existingReaction.id
    );

    return {
      action: "removed",
    };
  }

  // CASE 3
  // Different reaction selected
  const updatedReaction =
    await reactionsRepository.updateReaction(
      existingReaction.id,
      reactionType
    );

  return {
    action: "updated",
    reaction: updatedReaction,
  };
};

const getReactionCountsService = async (
  postId
) => {
  const counts =
    await reactionsRepository.getPostReactionCounts(
      postId
    );

  return counts;
};

module.exports = {
  toggleReactionService,
  getReactionCountsService,
};