
const reactionsRepository = require(
  "./reactions.repository"
);

const activityService = require(
  "../activity/activity.service"
);

const {
  ACTIVITY_TYPES,
} = require(
  "../activity/activity.constants"
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
  // Create new reaction
  if (!existingReaction) {

    const newReaction =
      await reactionsRepository.createReaction({
        userId,
        postId,
        reactionType,
      });

    // Log only meaningful engagement
    await activityService.createActivity({
      userId,

      activityType:
        reactionType === "like"
          ? ACTIVITY_TYPES.POST_LIKED
          : ACTIVITY_TYPES.POST_DISLIKED,

      entityId: postId,

      entityType: "post",

      metadata: {
        reactionId: newReaction.id,
      },
    });

    return {
      action: "created",
      reaction: newReaction,
    };
  }

  // CASE 2
  // Remove same reaction
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
  // Update reaction
  const updatedReaction =
    await reactionsRepository.updateReaction(
      existingReaction.id,
      reactionType
    );

  // Log updated engagement
  await activityService.createActivity({
    userId,

    activityType:
      reactionType === "like"
        ? ACTIVITY_TYPES.POST_LIKED
        : ACTIVITY_TYPES.POST_DISLIKED,

    entityId: postId,

    entityType: "post",

    metadata: {
      previousReaction:
        existingReaction.reaction_type,

      updatedReaction:
        reactionType,
    },
  });

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