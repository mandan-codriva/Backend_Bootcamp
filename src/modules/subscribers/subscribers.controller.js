
const subscribersService = require(
  "./subscribers.service"
);

const subscribeCreatorController =
  async (req, res, next) => {

    try {

      const creatorId =
        req.params.creatorId;

      const subscriberId =
        req.user.id;

      const subscription =
        await subscribersService.subscribeCreatorService({
          creatorId,
          subscriberId,
        });

      return res.status(201).json({
        success: true,
        message:
          "Subscribed successfully",
        data: subscription,
      });

    } catch (error) {

      next(error);

    }

};

const unsubscribeCreatorController =
  async (req, res, next) => {

    try {

      const creatorId =
        req.params.creatorId;

      const subscriberId =
        req.user.id;

      await subscribersService.unsubscribeCreatorService({
        creatorId,
        subscriberId,
      });

      return res.status(200).json({
        success: true,
        message:
          "Unsubscribed successfully",
      });

    } catch (error) {

      next(error);

    }

};

const getSubscriberCountController =
  async (req, res, next) => {

    try {

      const creatorId =
        req.params.creatorId;

      const count =
        await subscribersService.getSubscriberCountService(
          creatorId
        );

      return res.status(200).json({
        success: true,
        data: {
          subscriberCount: count,
        },
      });

    } catch (error) {

      next(error);

    }

};

const getSubscriptionStatusController =
  async (req, res, next) => {

    try {

      const creatorId =
        req.params.creatorId;

      const subscriberId =
        req.user.id;

      const status =
        await subscribersService.getSubscriptionStatusService({
          creatorId,
          subscriberId,
        });

      return res.status(200).json({
        success: true,
        data: status,
      });

    } catch (error) {

      next(error);

    }

};

const getCreatorSubscribersController =
  async (req, res, next) => {

    try {

      const creatorId =
        req.params.creatorId;

      const {
        page,
        limit,
        sortBy,
        sortOrder,
      } = req.query;

      const result =
        await subscribersService.getCreatorSubscribersService({
          creatorId,
          page,
          limit,
          sortBy,
          sortOrder,
        });

      return res.status(200).json({
        success: true,
        pagination: result.pagination,
        data: result.subscribers,
      });

    } catch (error) {

      next(error);

    }

};

module.exports = {
  subscribeCreatorController,
  unsubscribeCreatorController,
  getSubscriberCountController,
  getSubscriptionStatusController,
  getCreatorSubscribersController,
};
