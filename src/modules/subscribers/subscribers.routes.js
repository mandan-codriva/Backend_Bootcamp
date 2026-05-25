
const express = require("express");

const router = express.Router();

const subscribersController = require(
  "./subscribers.controller"
);

const authMiddleware = require(
  "../../middleware/auth.middleware"
);

const validateMiddleware = require(
  "../../middleware/validate.middleware"
);

const {
  creatorIdValidation,
  paginationValidation,
} = require(
  "./subscribers.validation"
);

// Subscribe to creator
router.post(
  "/:creatorId",

  authMiddleware,

  creatorIdValidation,

  validateMiddleware,

  subscribersController.subscribeCreatorController
);

// Unsubscribe from creator
router.delete(
  "/:creatorId",

  authMiddleware,

  creatorIdValidation,

  validateMiddleware,

  subscribersController.unsubscribeCreatorController
);

// Get subscriber count
router.get(
  "/:creatorId/count",

  creatorIdValidation,

  validateMiddleware,

  subscribersController.getSubscriberCountController
);

// Check subscription status
router.get(
  "/:creatorId/status",

  authMiddleware,

  creatorIdValidation,

  validateMiddleware,

  subscribersController.getSubscriptionStatusController
);

// Get creator subscribers list
router.get(
  "/:creatorId/list",

  creatorIdValidation,

  paginationValidation,

  validateMiddleware,

  subscribersController.getCreatorSubscribersController
);

module.exports = router;

