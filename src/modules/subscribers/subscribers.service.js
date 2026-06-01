
const subscribersRepository = require(
  "./subscribers.repository"
);

const authRepository = require(
  "../auth/auth.repository"
);

const AppError = require("../../utils/appError");
const {
  SUBSCRIPTION_ERRORS,
} = require(
  "./subscribers.constants"
);

const subscribeCreatorService =
  async ({
    creatorId,
    subscriberId,
  }) => {

    // Prevent self subscribe
    if (
      creatorId === subscriberId
    ) {
      throw new AppError(
        SUBSCRIPTION_ERRORS.SELF_SUBSCRIBE,
        400
      );
    }

    // Check creator exists
    const creator =
      await authRepository.findUserById(
        creatorId
      );

    if (!creator) {
      throw new AppError(
        SUBSCRIPTION_ERRORS.CREATOR_NOT_FOUND,
        404
      );
    }


    // Check existing subscription
    const existingSubscription =
      await subscribersRepository.findSubscription({
        creatorId,
        subscriberId,
      });

    if (existingSubscription) {
      throw new AppError(
        SUBSCRIPTION_ERRORS.ALREADY_SUBSCRIBED,
        400
      );
    }

    // Create subscription
    const subscription =
      await subscribersRepository.createSubscription({
        creatorId,
        subscriberId,
      });

    return subscription;
};

const unsubscribeCreatorService =
  async ({
    creatorId,
    subscriberId,
  }) => {

    const existingSubscription =
      await subscribersRepository.findSubscription({
        creatorId,
        subscriberId,
      });

    if (!existingSubscription) {
      throw new AppError(
        SUBSCRIPTION_ERRORS.SUBSCRIPTION_NOT_FOUND,
        404
      );
    }

    await subscribersRepository.deleteSubscription({
      creatorId,
      subscriberId,
    });

    return true;
};

const getSubscriberCountService =
  async (creatorId) => {

    return await subscribersRepository.getSubscriberCount(
      creatorId
    );
};

const getSubscriptionStatusService =
  async ({
    creatorId,
    subscriberId,
  }) => {

    const subscription =
      await subscribersRepository.findSubscription({
        creatorId,
        subscriberId,
      });

    return {
      subscribed:
        !!subscription,
    };
};

const getCreatorSubscribersService =
  async ({
    creatorId,
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortOrder = "DESC",
  }) => {

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // Safe pagination
    if (isNaN(page) || page < 1) {
      page = 1;
    }

    if (isNaN(limit) || limit < 1 || limit > 50) {
      limit = 10;
    }

    // Whitelist sort fields
    const allowedSortFields = ["created_at", "username"];
    const verifiedSortBy = allowedSortFields.includes(sortBy) ? sortBy : "created_at";

    // Resolve prefix table names
    let finalSortBy = "subscribers.created_at";
    if (verifiedSortBy === "username") {
      finalSortBy = "users.username";
    }

    // Normalize sortOrder
    const finalSortOrder = ["ASC", "DESC"].includes(String(sortOrder).toUpperCase())
      ? String(sortOrder).toUpperCase()
      : "DESC";

    const [subscribers, totalSubscribers] = await Promise.all([
      subscribersRepository.getCreatorSubscribers({
        creatorId,
        page,
        limit,
        sortBy: finalSortBy,
        sortOrder: finalSortOrder,
      }),
      subscribersRepository.getSubscriberCount(creatorId)
    ]);

    const totalPages = Math.ceil(totalSubscribers / limit);

    return {
      subscribers,
      pagination: {
        total: totalSubscribers,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        sortBy: verifiedSortBy,
        sortOrder: finalSortOrder,
      }
    };
};

module.exports = {
  subscribeCreatorService,
  unsubscribeCreatorService,
  getSubscriberCountService,
  getSubscriptionStatusService,
  getCreatorSubscribersService,
};

