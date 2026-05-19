
const subscribersRepository = require(
  "./subscribers.repository"
);

const authRepository = require(
  "../auth/auth.repository"
);

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
      throw new Error(
        SUBSCRIPTION_ERRORS.SELF_SUBSCRIBE
      );
    }

    // Check creator exists
    const creator =
      await authRepository.findUserById(
        creatorId
      );

    if (!creator) {
      throw new Error(
        SUBSCRIPTION_ERRORS.CREATOR_NOT_FOUND
      );
    }

    // Only creators can be subscribed
    if (
      creator.role !== "creator"
    ) {
      throw new Error(
        SUBSCRIPTION_ERRORS.INVALID_CREATOR
      );
    }

    // Check existing subscription
    const existingSubscription =
      await subscribersRepository.findSubscription({
        creatorId,
        subscriberId,
      });

    if (existingSubscription) {
      throw new Error(
        SUBSCRIPTION_ERRORS.ALREADY_SUBSCRIBED
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
      throw new Error(
        SUBSCRIPTION_ERRORS.SUBSCRIPTION_NOT_FOUND
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
  }) => {

    page = parseInt(page);

    limit = parseInt(limit);

    // Safe pagination
    if (page < 1) {
      page = 1;
    }

    if (
      limit < 1 ||
      limit > 50
    ) {
      limit = 10;
    }

    const subscribers =
      await subscribersRepository.getCreatorSubscribers({
        creatorId,
        page,
        limit,
      });

    return subscribers;
};

module.exports = {
  subscribeCreatorService,
  unsubscribeCreatorService,
  getSubscriberCountService,
  getSubscriptionStatusService,
  getCreatorSubscribersService,
};

